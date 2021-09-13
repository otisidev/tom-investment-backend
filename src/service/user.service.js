const { UserModel } = require("../model/user.model");
const { Types } = require("mongoose");
const { BatchDataLoader } = require("../../lib/batch-entity");
const gen = require("rand-token");

const Model = UserModel;
const { isValid } = Types.ObjectId;

exports.UserService = class UserService {
    /**
     * Creates a new user object
     * @param {any} model new user object
     * @param {string} password hashed password
     */
    static async CreateUser(model, password) {
        try {
            if (!model || !password) throw new Error("Bad data! Invalid user data.");
            const cb = await new Model({ ...model, passwordHash: password }).save();
            if (cb)
                return {
                    status: 200,
                    message: "User account created successfully",
                    doc: cb
                };
        } catch (error) {
            if (error.message.startsWith("E11000 duplicate key error collection:")) throw new Error("Bad data! User already exists.");
            throw error;
        }
    }

    /**
     * Verifies user email for new account
     * @param {string} id
     */
    static async EmailVerification(id) {
        if (isValid(id)) {
            const query = { removed: false, _id: id };
            const update = { $set: { verified: true } };
            const op = await Model.findOneAndUpdate(query, update, {
                new: true
            }).exec();
            if (op)
                return {
                    status: 200,
                    message: "User verified!",
                    doc: op
                };
        }
        throw new Error("Unable to verify account! Record not found!");
    }

    /**
     * Retrieves a user by email or phone number
     * @param {string} email
     */
    static async GetUserByEmail(email) {
        if (email) {
            const query = {
                removed: false,
                $or: [{ email }, { phone: email }]
            };
            const cb = await Model.findOne(query).exec();
            if (cb)
                return {
                    status: 200,
                    message: "User found!",
                    doc: cb
                };
        }
        throw new Error("User not found!");
    }

    /**
     * Gets a single user account by object id
     * @param {string} id user id
     */
    static async GetSingleUser(id) {
        if (isValid(id)) {
            const query = { removed: false, _id: id };
            const cb = await Model.findOne(query).exec();
            if (cb)
                return {
                    status: 200,
                    message: "User found!",
                    doc: cb
                };
        }
        throw new Error("User not found!");
    }

    /**
     * Changes user password
     * @param {string} email user's email address
     * @param {string} NewPassword hashed password
     */
    static async NewPassword(email, NewPassword) {
        if (email && NewPassword) {
            const query = { removed: false, email };
            const update = { $set: { passwordHash: NewPassword } };
            const op = await Model.findOneAndUpdate(query, update, {
                new: true
            }).exec();
            if (op)
                return {
                    status: 200,
                    message: "Password Changed!",
                    doc: op
                };
        }
        throw new Error("User not found!");
    }

    /**
     * Retrieves a list of users by their nationality
     * @param {int} page page number per request
     * @param {int} limit maximum record per request
     * @param {string} nationality user's nationality
     * @param {string} user user's email or phone number
     */
    static async GetUsers(page = 1, limit = 25, nationality = null, user = null) {
        let query = { removed: false };
        if (nationality !== null) {
            query.nationality = nationality;
        }
        if (user) {
            query = {
                ...query,
                $or: [{ email: user }, { phone: user }, { firstname: user }, { lastname: user }]
            };
        }
        const op = await Model.paginate(query, {
            page,
            limit,
            sort: { created_at: -1 }
        });

        return {
            status: 200,
            message: "Completed!",
            ...op
        };
    }

    /**
     * Adds a new investment plan for a user
     * @param {string} user
     * @param {string} investment
     */
    static async UpdateInvestment(user, investment) {
        if (isValid(user) && isValid(investment)) {
            const query = { removed: false, _id: user };
            const update = { $addToSet: { investments: investment } };
            const op = await Model.findOneAndUpdate(query, update).exec();
            if (op) {
                return {
                    status: 200,
                    message: "Completed!",
                    doc: op
                };
            }
        }
        throw new Error("User not found!");
    }
    /**
     * Adds a new investment plan for a user
     * @param {string} user
     * @param {Array<string>} investment
     */
    static async UpdateManyInvestment(user, investments) {
        if (isValid(user) && investments.every((r) => isValid(r))) {
            const query = { removed: false, _id: user };
            const update = { $addToSet: { investments } };
            const op = await Model.findOneAndUpdate(query, update).exec();
            if (op) {
                return {
                    status: 200,
                    message: "Completed!",
                    doc: op
                };
            }
        }
        throw new Error("User not found!");
    }

    /**
     * Updates user's referral list
     * @param {string} user id  of the new user
     * @param {string} refererId id of the user that invited the new user
     */
    static async AddReferral(user, refererId) {
        if (isValid(user) && isValid(refererId)) {
            const q = { removed: false, _id: refererId };
            const update = { $addToSet: { referredUsers: user } };
            const cb = await Model.findOneAndUpdate(q, update, {
                new: true
            }).exec();
            if (cb)
                return {
                    status: 200,
                    message: "Operation completed successfully!",
                    doc: cb
                };
        }
        throw new Error("User not found!");
    }

    /**
     * Update user's referral list
     * @param {string} user referrer's id
     * @param {Array<string>} users list of referred users
     */
    static async AddManyReferral(user, users) {
        if (isValid(user) && users.every((c) => isValid(c))) {
            const q = { removed: false, _id: user };
            const update = { $addToSet: { referredUsers: users } };
            const cb = await Model.findOneAndUpdate(q, update, {
                new: true
            }).exec();
            if (cb)
                return {
                    status: 200,
                    message: "Operation completed successfully!",
                    doc: cb
                };
        }
        throw new Error("User not found!");
    }

    /**
     * Gets list of users
     * @param {Array<string>} ids user ids
     */
    static async GetMany(ids) {
        const q = { _id: { $in: ids } };
        const result = await Model.find(q).exec();
        return BatchDataLoader(ids, result);
    }

    /**
     * removes a single user account
     * @param {string} id user id
     */
    static async Remove(id) {
        if (isValid(id)) {
            const q = { removed: false, _id: id };
            const update = { $set: { removed: true } };
            const cb = await Model.findOneAndUpdate(q, update).exec();
            if (cb)
                return {
                    status: 200,
                    message: "User account removed successfully!",
                    doc: { id, status: "Removed" }
                };
        }
        throw new Error("Failed! User account not found.");
    }

    static async UpdateProfileImage(id, image) {
        if (isValid(id) && image) {
            const q = { removed: false, _id: id };
            const update = { $set: { image } };
            const cb = await Model.findOneAndUpdate(q, update, {
                new: true
            }).exec();
            if (cb)
                return {
                    status: 200,
                    message: "User account updated successfully!",
                    doc: cb
                };
        }
        throw new Error("Failed! User account not found.");
    }

    static async UpdateReferrer(id, referrer) {
        if (isValid(id) && isValid(referrer)) {
            const q = { removed: false, _id: id };
            const update = { $set: { referrer } };
            const cb = await Model.findOneAndUpdate(q, update, {
                new: true
            }).exec();
            if (cb)
                return {
                    status: 200,
                    message: "User referrer updated successfully!",
                    doc: cb
                };
        }
        throw new Error("Failed! User account not found.");
    }

    static async UpdateAccount(id, model) {
        if (isValid(id) && model) {
            const q = { removed: false, _id: id };
            const update = {
                $set: {
                    firstname: model.firstname,
                    lastname: model.lastname,
                    phone: model.phone,
                    walletAddress: model.walletAddress,
                    address: model.address,
                    gender: model.gender,
                    walletName: model.walletName
                }
            };
            const cb = await Model.findOneAndUpdate(q, update, {
                new: true
            }).exec();
            if (cb)
                return {
                    status: 200,
                    message: "Account updated successfully!",
                    doc: cb
                };
        }
        throw new Error("Failed! User account not found.");
    }

    /**
     * Get the user that referred user with given id
     * @param {string} id user id
     */
    static async GetUserReferrer(id) {
        if (isValid(id)) {
            const q = { removed: false, referredUsers: { $in: id } };
            const cb = await Model.findOne(q).exec();
            if (cb) return cb;
        }
        return false;
    }

    static async CountUsers() {
        const q = {
            removed: false
        };
        return await Model.countDocuments(q).exec();
    }

    static async CountByEmail(email) {
        if (email) {
            const q = { removed: false, email };
            const count = await Model.countDocuments(q).exec();
            return count > 0;
        }
        return false;
    }

    /**
     * Updates
     * @param {string} id user id
     */
    static async GenerateResetCode(id) {
        if (isValid(id)) {
            const code = gen.generate(10);
            const q = { removed: false, _id: id };
            const update = {
                $set: {
                    resetCode: code
                }
            };
            const cb = await Model.findOneAndUpdate(q, update).exec();
            if (cb) return code;
        }
        throw new Error("User account not found!");
    }

    /**
     * Updates user's email address
     * @param {string} id user's id
     * @param {string} email email address
     * @param {string} code generated code
     */
    static async UpdateEmailAddress(id, email, code) {
        try {
            if (isValid(id)) {
                const q = { removed: false, _id: id, resetCode: code };
                const update = { $set: { email, resetCode: null } };
                const cb = await Model.findOneAndUpdate(q, update, {
                    new: true
                }).exec();
                if (cb)
                    return {
                        status: 200,
                        message: "Email address updated successfully!",
                        doc: cb
                    };
            }
            throw new Error("User account not found!");
        } catch (error) {
            if (error.message.startsWith("E11000 duplicate key error collection:"))
                throw new Error("Bad data! User with email address already exists.");
            throw error;
        }
    }

    /**
     * Get a single by by either name, email, or phone number
     * @param {string} user user's name, email address, or phone number
     */
    static async GetUserByNameEmailPhone(user) {
        if (user) {
            const q = {
                $text: { $search: user }
            };
            const cb = await Model.find(q).exec();
            return cb;
        }
        throw new Error("User not found!");
    }

    static async GetYourReferrals(user) {
        if (isValid(user)) {
            const _query = { removed: false, referrer: user };
            const result = await Model.find(_query).exec();
            if (result)
                return {
                    status: 200,
                    message: "Completed successfully!",
                    docs: result
                };
        }
        throw new Error("User not found!");
    }

    /**
     * Gets a single user using their referral code
     * @param {string} code user's referral code
     */
    static async GetUserByReferralCode(code) {
        if (code) {
            const q = { removed: false, referralCode: code };
            const cb = await Model.findOne(q).exec();
            if (cb)
                return {
                    status: 200,
                    message: "Found user!",
                    doc: cb
                };
        }
        throw new Error("User not found!");
    }

    static async GetUsersWithIncompleteReferral() {
        const _pipeline = [
            {
                $match: {
                    referrer: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: "$referrer",
                    total: {
                        $sum: 1
                    },
                    users: {
                        $push: "$_id"
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "referrer"
                }
            },
            {
                $unwind: {
                    path: "$referrer"
                }
            },
            {
                $project: {
                    referrer: "$referrer._id",
                    listCount: { $size: "$referrer.referredUsers" },
                    total: 1,
                    users: 1,
                    _id: 0
                }
            }
        ];

        const result = await Model.aggregate(_pipeline).exec();
        return result.filter((item) => item.total > item.listCount);
    }

    /**
     *
     * @param {string} user user object id
     * @param {string} next next of kin object id
     */
    static async UpdateNextOfKin(user, next) {
        if (isValid(user) && isValid(next)) {
            const query = { removed: false, _id: user };
            const update = { $set: { nextOfKin: next } };
            const cb = await Model.findOneAndUpdate(query, update).exec();
            if (cb)
                return {
                    status: 200,
                    message: "Updated next of kin successfully",
                    doc: cb
                };
        }
        throw new Error("User not found!");
    }

    static async RequestForLogin(email, token) {
        if (email && token) {
            const query = { removed: false, email };
            const update = { $set: { resetCode: token } };
            const cb = await Model.findOneAndUpdate(query, update).exec();
            if (cb)
                return {
                    status: 200,
                    message: "Verification code sent to your email address!"
                };
        }
        throw new Error("User not found!");
    }

    static async AccountLoggedIn(id) {
        if (isValid(id)) {
            const query = { removed: false, _id: id };
            const update = { $set: { resetCode: null } };
            const cb = await Model.findOneAndUpdate(query, update).exec();
            if (cb) return true;
        }
        return false;
    }

    static async Update2FA(id, status) {
        if (isValid(id)) {
            const query = { removed: false, _id: id };
            const update = { $set: { useTwoF: status } };
            const cb = await Model.findOneAndUpdate(query, update).exec();
            if (cb)
                return {
                    status: 200,
                    message:
                        status !== false
                            ? "Enabled Two factor authentication successfully"
                            : "Disabled Two Factor authentication successfully",
                    doc: cb
                };
        }
        throw new Error("User not found!");
    }

    static async ChangeAccountType(id, _type) {
        if (isValid(id) && _type) {
            const q = { removed: false, _id: id };
            const u = { $set: { accountType: _type } };
            const cb = await Model.findOneAndUpdate(q, u).exec();
            if (cb) return { status: 200, message: "Updated successfully!", data: cb };
        }
        throw new Error("User not found!");
    }

    static async AdminUpdateAccount(id, model) {
        if (isValid(id) && model) {
            const q = { removed: false, _id: id };
            const update = {
                $set: {
                    firstname: model.firstname,
                    lastname: model.lastname,
                    phone: model.phone,
                    walletAddress: model.walletAddress,
                    dob: model.dob,
                    gender: model.gender,
                    nationality: model.nationality,
                    email: model.email,
                    duration: model.duration
                }
            };
            const cb = await Model.findOneAndUpdate(q, update, {
                new: true
            }).exec();
            if (cb)
                return {
                    status: 200,
                    message: "Account updated successfully!",
                    doc: cb
                };
        }
        throw new Error("Failed! User account not found.");
    }
};
