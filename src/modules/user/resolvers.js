const { ApolloError, AuthenticationError } = require("apollo-server");
const { UserService } = require("../../service/user.service");
const { mailing } = require("../../service/mailing.service");
const { LoginLogService } = require("../../service/login-log.service");
const { generate } = require("rand-token");
const { CoreService } = require("../../../lib");
const { NextOfKinService } = require("../../service/kin.service");
const { Types } = require("mongoose");
// const { isWalletValid } = require("../../../lib/wallet");

const resolvers = {
    Query: {
        GetUser: async (_, { id }) => {
            return await UserService.GetSingleUser(id);
        },
        GetUsers: async (_, __) => {
            const { nationality, page, limit, user } = __;
            const result = await UserService.GetUsers(page, limit, nationality, user);
            return result;
        },
        CountUsers: async (_, __, { user }) => {
            if (user && user.isAdmin) {
                return await UserService.CountUsers();
            }
            return 0;
        },
        CountReferral: async (_, __, { user }) => {
            if (user) {
                const result_user = await UserService.GetSingleUser(user.id);
                return result_user.doc.referredUsers.length;
            }
            return 0;
        },
        GetYourReferrals: async (_, __, { user }) => {
            if (user) {
                return await UserService.GetYourReferrals(user.id);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        GetUserByEmail: async (_, { email }, { user }) => {
            if (user) {
                const cb = await UserService.GetUserByEmail(email);
                return cb;
            }
            return new AuthenticationError("Unauthorized access!");
        }
    },
    Mutation: {
        NewUserAccount: async (_, { model, referrer, option }, { ip }) => {
            // validate wallet address
            try {
                // const result = await isWalletValid(model.walletAddress);
                if (true) {
                    // Create account
                    const { password, ...rest } = model;
                    let refId = "";
                    let e = "";
                    // code
                    const code = generate(10);
                    const _hashed = await CoreService.EncryptPassword(password);

                    // Update referer
                    if (referrer) {
                        const _userRef = await UserService.GetUserByReferralCode(referrer);
                        refId = _userRef.doc._id;
                        e = _userRef.doc.email;
                    }
                    const cb = await UserService.CreateUser(
                        {
                            ...rest,
                            referralCode: code,
                            referrer: refId ? refId : null
                        },
                        _hashed
                    );
                    if (Types.ObjectId.isValid(refId)) {
                        await UserService.AddReferral(cb.doc.id, refId);
                        // send message
                        const message = `You have added new referral:
                            <br />
                            <strong>Name:" " </strong> ${model.firstname} ${model.lastname}
                            <strong>Email:" " </strong> ${model.email} 
                `;
                        // referrer
                        await mailing.SendEmailNotification(e, "New Referral", message);
                    }
                    // generate token
                    const token = CoreService.GenerateToken(toDTO(cb.doc));
                    // Send mail to user account
                    await mailing.SendEmailConfirmation(cb.doc.id, cb.doc.email, `${cb.doc.firstname} ${cb.doc.lastname}`);
                    // Log login activity
                    await LoginLogService.LogNew({
                        ...option,
                        user: cb.doc.id,
                        ip,
                        attempt: 1
                    });
                    // return return
                    return { ...cb, token };
                }
                // return new ApolloError("Bad data! Wallet address is invalid!");
            } catch (error) {
                // console.log(error);
                // console.log(JSON.stringify(model, null, 4));
                return new ApolloError(error.message, 500);
            }
        },
        VerifyAccount: async (_, { id }) => {
            // get single user
            const result = await UserService.EmailVerification(id);
            const token = await CoreService.GenerateToken(toDTO(result.doc));
            // Log activity
            return { ...result, token };
        },
        UpdatePassword: async (_, { password, oldPassword }, { user }) => {
            if (user) {
                // check existing password
                if (await CoreService.ComparePasswords(oldPassword, user.passwordHash)) {
                    // hash the new password
                    const _new = await CoreService.EncryptPassword(password);
                    // update new password
                    const result = await UserService.NewPassword(user.email, _new);
                    return result.status === 200;
                }
                return new ApolloError("Invalid password!", 403);
            }

            return new AuthenticationError("Unauthorized access!");
        },
        DeleteAccount: async (_, { id }, { user }) => {
            if (user) {
                return await UserService.Remove(id);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        Login: async (_, { email, password, option }, { ip }) => {
            // get user by email
            const user = await UserService.GetUserByEmail(email);
            // compare passwords
            const state = await CoreService.ComparePasswords(password, user.doc.passwordHash);
            if (state) {
                // check for 2 FA
                if (user.doc.useTwoF && user.doc.resetCode !== null) {
                    if (option.token !== user.doc.resetCode)
                        return new AuthenticationError("Verification code! Please enter the verification code sent to your inbox.");
                } else if (user.doc.useTwoF && user.doc.resetCode === null) {
                    // generate token and send
                    const _token = generate(8);
                    const _result = await UserService.RequestForLogin(email, _token);
                    // Send email
                    const message = `Verification code for login: <br/> <h4>${_token}</h4>`;
                    await mailing.SendEmailNotification(email, "Account verification code", message);
                    return new AuthenticationError(_result.message);
                }
                // generate token
                const token = CoreService.GenerateToken(toDTO(user.doc));
                // log
                await LoginLogService.LogNew({ ...option, user: user.doc.id, ip });
                // update login token
                await UserService.AccountLoggedIn(user.doc.id);
                return {
                    ...user,
                    message: "Authenticated successfully!",
                    token
                };
            }
            return new ApolloError("Incorrect email or password!", 404);
        },
        NewPassword: async (_, { email, password }, { ip, userAgent }) => {
            // get user by email
            const passwordHash = await CoreService.EncryptPassword(password);
            const user = await UserService.NewPassword(email, passwordHash);
            // generate token
            const token = CoreService.GenerateToken(toDTO(user.doc));
            // log
            await LoginLogService.LogNew({
                user: user.doc._id,
                ip,
                userAgent,
                attempt: 1,
                device: userAgent
            });
            // Updated Email
            const message = `You have successfully updated <br/>
			<b>User Agent: </b> ${userAgent} <br/>
			<b>IP Address: </b> ${ip}
			`;
            await mailing.SendEmailNotification(email, "Password Updated Successfully!", message);
            // return result
            return {
                ...user,
                message: "Authenticated successfully!",
                token
            };
        },
        ResetPassword: async (_, { email }) => {
            if (await CoreService.IsEmailValid(email)) {
                const userObj = await UserService.GetUserByEmail(email);
                const { id, firstname, lastname } = userObj.doc;
                const result = await mailing.SendPasswordResetLink(id, id, `${firstname} ${lastname}`, email);
                return result.message;
            }
            return new ApolloError("Invalid email address!");
        },
        UpdateAccount: async (_, { id, update }, { user }) => {
            if (user) {
                const cb = await UserService.UpdateAccount(id, update);
                return cb;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        ResendVerificationLink: async (_, __, { user }) => {
            if (user) {
                const result = await mailing.SendEmailConfirmation(user.id, user.email, `${user.firstname} ${user.lastname}`);
                return result.message;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        SendEmailModificationRequest: async (_, { email }, { user, ip, userAgent }) => {
            if (user) {
                // generate reset code
                const result = await UserService.GenerateResetCode(user.id);
                // compose notification message
                const message = `You've request for a change of your email. Use the following code to complete the process. <br/>
				<b>Reset Code:  > ${result} < </b>  <br/>
				<b>User Agent: </b> ${userAgent} <br/>
				<b>IP Address: </b> ${ip}
			`;
                await mailing.SendEmailNotification(email, "Change of email address request!", message);
                return "Activation code has been sent to " + email;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        UpdateEmailAddress: async (_, { email, code }, { user, ip, userAgent }) => {
            if (user) {
                // update email address
                const result = await UserService.UpdateEmailAddress(user.id, email, code);
                // compose notification message
                const message = `You have successfully updated your email address<br/>
				<b>Email Address: </b> ${email} <br/>
				<b>User Agent: </b> ${userAgent} <br/>
				<b>IP Address: </b> ${ip} <br/>
				<b>Datetime: </b> ${new Date().toUTCString()}
			`;
                await mailing.SendEmailNotification(user.email, "Email address changed!", message);
                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        UpdateProfile: async (_, { path }, { user }) => {
            if (user) {
                const result = await UserService.UpdateProfileImage(user.id, path);
                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        NewNextOfKin: async (_, { model }, { user }) => {
            if (user) {
                const result = await NextOfKinService.NewKin(model, user.id);
                await UserService.UpdateNextOfKin(user.id, result.doc.id);
                return result.doc;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        UpdateNextOfKin: async (_, { update, id }, { user }) => {
            if (user) {
                const result = await NextOfKinService.UpdateKin(id, update, user.id);
                return result.doc;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        Update2FA: async (_, { status }, { user }) => {
            if (user) {
                return await UserService.Update2FA(user.id, status);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        ChangeAccountType: async (_, { id, newType }, { user }) => {
            if (user) {
                return await UserService.ChangeAccountType(id, newType);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        AdminAccountUpdate: async (_, { id, model }, { user }) => {
            if (user && user.isAdmin) {
                return await UserService.AdminUpdateAccount(id, model);
            }
            return new AuthenticationError("Unauthorized access!");
        }
    },
    User: {
        created_at: ({ created_at }) => new Date(created_at).toISOString(),
        dob: ({ dob }) => new Date(dob).toISOString(),
        wallet_address: ({ walletAddress }) => walletAddress,
        referred: async ({ referredUsers }, _, { dataSources }) =>
            await dataSources.loaders.userLoader.loadMany(referredUsers.map((c) => c.toString())),
        referrer: async ({ referrer }, _, { dataSources }) => {
            if (referrer) return await dataSources.loaders.userLoader.load(referrer.toString());
            return null;
        },
        name: ({ firstname, lastname }) => `${firstname} ${lastname}`,
        next_of_kin: async ({ nextOfKin }, _, { dataSources }) => {
            if (nextOfKin) return await dataSources.loaders.kinLoader.load(nextOfKin.toString());
            return null;
        },
        id: ({ _id }) => _id
    }
};
const toDTO = (user) => ({
    id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    verified: user.verified,
    passwordHash: user.passwordHash,
    walletAddress: user.walletAddress,
    address: user.address,
    isAdmin: user.admin
});
exports.resolvers = resolvers;
