const { AuthenticationError, ApolloError } = require("apollo-server");
const { InvestmentService } = require("../../service/investment.service");
const { UserService } = require("../../service/user.service");
const { InvestmentHistoryService } = require("../../service/investment-log.service");
const { mailing } = require("../../service/mailing.service");
const { ReferrerService } = require("../../service/referrer.service");
const { calculatePayout } = require("../../../lib/percent");
// const { NextOfKinService } = require("../../service/kin.service");

const resolvers = {
    Query: {
        GetUserInvestments: async (_, { page, limit }, { user }) => {
            if (user) {
                return await InvestmentService.GetUserInvestment(user.id, page, limit);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        GetPayableInvestments: async (_, __, { user }) => {
            if (user && user.isAdmin) {
                let _userId = null;
                if (__.user) {
                    const users = await UserService.GetUserByNameEmailPhone(__.user);
                    _userId = users.map((c) => c._id);
                }
                return await InvestmentService.GetPayableInvestments(__.page, __.limit, _userId);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        GetInvestmentsForApproval: async (_, { page, limit }, { user }) => {
            if (user && user.isAdmin) {
                return await InvestmentService.GetInvestmentForApproval(page, limit);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        CountInvestment: async (_, __, { user }) => {
            if (user) {
                return InvestmentService.CountInvestment(user.id);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        CountApprovedInvestment: async (_, __, { user }) => {
            if (user) return InvestmentService.CountApprovedInvestment(user.id);
            return new AuthenticationError("Unauthorized access!");
        },
        CountPendingInvestment: async (_, __, { user }) => {
            if (user && user.isAdmin) return InvestmentService.CountPendingInvestment();
            return 0;
        },
        CountActiveInvestment: async (_, __, { user }) => {
            if (user && user.isAdmin) return InvestmentService.CountActiveInvestment();
            return 0;
        },
        SumInvestmentMade: async (_, __, { user }) => {
            if (user) return InvestmentService.SumInvestmentMade(user.id);
            return new AuthenticationError("Unauthorized access!");
        },
        GetInvestmentHistory: async (_, __, { user }) => {
            if (user) {
                const { page, limit, id } = __;
                return await InvestmentHistoryService.GetInvestmentLogs(id, page, limit);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        GetActiveInvestment: async (_, __, { user }) => {
            if (user && user.isAdmin) {
                let _userId = null;
                if (__.user) {
                    const users = await UserService.GetUserByNameEmailPhone(__.user);
                    _userId = users.map((c) => c._id);
                }
                const result = await InvestmentService.GetActiveInvestments(__.page, __.limit, _userId);
                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        },
    },
    Mutation: {
        NewInvestment: async (_, { model }, { user }) => {
            if (user) {
                const userRes = await UserService.GetSingleUser(user.id);
                if (!userRes.doc.image) return new ApolloError("Bad data! You can not create an investment without updating your profile picture.", 400);
                // const next = await NextOfKinService.HasNextOfKin(user.id);
                // if (!next) return new ApolloError("Bad data! You cannot create an investment without a next of kin information.");
                // new investment
                const result = await InvestmentService.NewInvestment({
                    ...model,
                    user: user.id,
                });
                await UserService.UpdateInvestment(user.id, result.doc.id);
                // Updated Email
                const message = `You've created a new investment. <br/>
                    <b> Amount: </b> ${model.investmentMade} <br/>
                    <b> Date: </b> ${new Date().toDateString()}
			    `;
                await mailing.SendEmailNotification(user.email, "New Investment Notification", message);
                // return result
                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        ApproveInvestment: async (_, { id, nextFund }, { dataSources, user }) => {
            if (user && user.isAdmin) {
                // approve
                // add investment
                const investment = await InvestmentService.GetSingle(id);
                // const next = new Date();
                const _user = investment.doc.user;

                // update to next
                const message = `Your investment has been approved!. <br/>
					<b> Amount: </b> ${investment.doc.investmentMade} <br/>
					<b> Plan: </b> ${investment.doc.plan.title} <br/>
					<b> Date: </b> ${new Date().toDateString()} <br/>
					<b> Next Payout Date: </b> Payout are Mondays only.
				`;
                // Approve investment
                const result = await InvestmentService.Approve(id, nextFund);
                await mailing.SendEmailNotification(_user.email, "Investment Approval", message);
                // check if first investment
                if (await InvestmentService.IsFirstInvestment(_user.id)) {
                    const referrer = await UserService.GetUserReferrer(_user.id);

                    if (referrer) {
                        const amount = calculatePayout(investment.doc.investmentMade, dataSources.helpers.app.referral_bonus);
                        await ReferrerService.Create({
                            amount,
                            referrer: referrer.id,
                            user: _user._id,
                            investment: id,
                        });
                    }
                }
                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        DeclineInvestment: async (_, { id }, { user }) => {
            if (user) {
                const invest = await InvestmentService.GetSingle(id);
                // decline
                const result = await InvestmentService.Decline(id);
                const person = invest.doc.user;
                const message = `Your investment has been declined!. <br/>
					<b> Investment Made: </b> ${Intl.NumberFormat("en-US").format(invest.doc.investmentMade)} <br/>
					<b> Plan: </b> ${invest.doc.plan.title} <br/>
					<b> Date: </b> ${new Date().toDateString()} 
				`;
                await mailing.SendEmailNotification(person.email, "Investment Declined!", message);

                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        PaidForInvestment: async (_, { id, wallet }, { user }) => {
            if (user) {
                // confirm
                return await InvestmentService.ConfirmPayment(id, wallet);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        NewInvestmentByAdmin: async (_, { model }, { dataSources, user }) => {
            if (user && user.isAdmin) {
                const result = await InvestmentService.NewInvestment(model);
                await UserService.UpdateInvestment(model.user, result.doc.id);
                // update referral
                if (model.approved && (await InvestmentService.IsFirstInvestment(model.user))) {
                    const referrer = await UserService.GetUserReferrer(model.user);
                    if (referrer) {
                        const amount = calculatePayout(investment.doc.investmentMade, dataSources.helpers.app.referral_bonus);
                        await ReferrerService.Create({
                            amount,
                            referrer: referrer.id,
                            user: model.user,
                            investment: result.doc.id,
                        });
                    }
                }
                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        Payout: async (_, { id, btc, to }, { user }) => {
            if (user && user.isAdmin) {
                // get a single investment
                const investment = await InvestmentService.GetSingle(id);
                // make payment
                // const paymentState = await helpers.makeTransaction(to, btc);

                // if (paymentState) {
                const { investmentMade, plan } = investment.doc;
                const { daysToPayout, weeklyPayoutInterval, percent } = plan;
                // try {
                // get amount to payout
                const amount = calculatePayout(investmentMade, percent) * weeklyPayoutInterval;
                // get next fund date

                // current date and time
                const next = new Date();
                // update to next
                next.setHours(daysToPayout * weeklyPayoutInterval * 24);
                next.setHours(-24); // remove
                // Update payout
                const result = await InvestmentService.Payout(id, amount, next);

                await InvestmentHistoryService.LogInvestment({
                    investment: id,
                    amount: amount,
                    reason: "Payout",
                });

                const message = `New investment payout. <br/>
							<b> Investment Made: </b> $${Intl.NumberFormat("en-US").format(investmentMade)} <br/>
							<b> Payout: </b> $${Intl.NumberFormat("en-US").format(amount)}<br/>
							<b> Plan: </b> ${investment.doc.plan.title} <br/>
							<b> Date: </b> ${new Date().toDateString()} <br/>
							<b> Next Payout Date: </b> Payout are Mondays only. 
						`;
                await mailing.SendEmailNotification(investment.doc.user.email, "Investment Payout!", message);

                // return
                return result;
                // }
            }
            return new AuthenticationError("Unauthorized access!");
        },
        Reinvestment: async (_, { id, payout, weeks }, { user }) => {
            if (user) {
                const investment = await InvestmentService.GetSingle(id);
                const result = await InvestmentService.Reinvest(id, payout, weeks);
                const { email } = investment.doc.user;
                const message = `Reinvestment Notification. <br/>
					<b> Investment Made: </b> $${Intl.NumberFormat("en-US").format(investment.doc.investmentMade)} <br/>
					<b> Next Payout: </b> Payout are Mondays only. <br/>
					<b> Plan: </b> ${investment.doc.plan.title} <br/>
					<b> Date: </b> ${new Date().toDateString()} <br/>
					<b> Next Payout Date: </b> ${new Date(investment.doc.nextFund).toDateString()} 
				`;
                await mailing.SendEmailNotification(email, "Reinvestment Notification!", message);
                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        CloseInvestment: async (_, { id }, { user }) => {
            if (user) {
                return await InvestmentService.CloseInvestment(id);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        CompoundInvestment: async (_, { id, payout, nextFund }, { user }) => {
            if (user) {
                const result = await InvestmentService.CompoundInvestment(id, nextFund, user.id, payout);
                const message = `Investment Compound Notification. <br/>
					<b> Investment Made: </b> $${Intl.NumberFormat("en-US").format(result.doc.investmentMade)} <br/>
					<b> Next Payout: </b> $${Intl.NumberFormat("en-US").format(payout)} <br/>
					<b> Date: </b> ${new Date().toDateString()} <br/>
					<b> Next Payout Date: </b> ${new Date(nextFund).toDateString()} 
				`;
                await mailing.SendEmailNotification(user.email, "Investment Compound Notification!", message);
                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        FixInvestment: async (_, __, { user }) => {
            if (user && user.isAdmin) {
                try {
                    const items = await InvestmentService.GetInvestmentGroupedByUsers();
                    items.forEach(async (item) => {
                        const { user, investments } = item;
                        await UserService.UpdateManyInvestment(user, investments);
                    });
                    return "Investment fixed successfully";
                } catch (error) {
                    return error.message;
                }
            }
            return new AuthenticationError("Unauthorized access!");
        },
    },
    Investment: {
        created_at: ({ created_at }) => new Date(created_at).toISOString(),
        investment_made: ({ investmentMade }) => investmentMade,
        date: ({ date }) => new Date(date).toISOString(),
        balance: ({ currentBalance }) => currentBalance,
        payout_sum: ({ investmentMade, plan }) => calculatePayout(investmentMade, plan.percent) * plan.weeklyPayoutInterval,
        payout_weekly: ({ investmentMade, plan }) => calculatePayout(investmentMade, plan.percent),
        next_fund_date: ({ nextFund }) => {
            if (nextFund) return new Date(nextFund).toISOString();
            return null;
        },
        last_fund_date: ({ lastFund }) => {
            if (lastFund) return new Date(lastFund).toISOString();
            return null;
        },
    },
    InvestmentHistory: {
        date: ({ date }) => new Date(date).toISOString(),
    },
    InvestmentCompound: {
        payoutDate: ({ payoutDate }) => {
            if (payoutDate) return new Date(payoutDate).toISOString();
            return null;
        },
    },
};

exports.resolvers = resolvers;
