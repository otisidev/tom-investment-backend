const { AuthenticationError } = require("apollo-server");
const { ReferrerService } = require("../../service/referrer.service");
const { InvestmentHistoryService } = require("../../service/investment-log.service");
const { InvestmentService } = require("../../service/investment.service");
const { UserService } = require("../../service/user.service");

const resolvers = {
    Query: {
        GetReferrals: async (_, __, { user }) => {
            if (user) {
                return await ReferrerService.GetReferredAccount(user.id);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        GetPayableReferrals: async (_, { page, limit }, { user }) => {
            if (user && user.isAdmin) {
                return await ReferrerService.GetPayableReferrals(page, limit);
            }
            return new AuthenticationError("Unauthorized access!");
        },
    },
    Mutation: {
        PayReferral: async (_, { id }, { user }) => {
            if (user && user.isAdmin) {
                const result = await ReferrerService.Paid(id);

                await InvestmentHistoryService.LogInvestment({
                    investment: result.doc.investment._id,
                    amount: result.doc.amount,
                    reason: "Referral Bonus",
                });
                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        FixReferral: async (_, __, { user, dataSources }) => {
            if (user && user.isAdmin) {
                try {
                    const users = await UserService.GetUsersWithIncompleteReferral();
                    const _items = Array.from(users);
                    _items.forEach(async (item) => {
                        // update user's referral list
                        await UserService.AddManyReferral(item.referrer, item.users);
                        // get build referral payment
                        const users = Array.from(item.users);
                        users.forEach(async (_user) => {
                            // check if user and referrer has pending referral payment
                            const exits = await ReferrerService.AlreadyLogged(_user, item.referrer);
                            if (!exits) {
                                //  get first investment of user
                                const investment = await InvestmentService.GetFirstInvestment(_user);
                                if (investment) {
                                    // get payable amount
                                    const amount = calculatePayout(investment.investmentMade, dataSources.helpers.app.referral_bonus);
                                    // create a new referral bonus payout
                                    await ReferrerService.Create({
                                        amount,
                                        referrer: item.referrer,
                                        user: _user,
                                        investment: investment.id,
                                    });
                                }
                            }
                        });
                    });
                    return "Fixed successfully ";
                } catch (error) {
                    return error.message;
                }
            }
            return new AuthenticationError("Unauthorized access!");
        },
    },
    Referral: {
        created_at: ({ created_at }) => new Date(created_at).toISOString(),
        user: async ({ user }, _, { dataSources }) => await dataSources.loaders.userLoader.load(user.toString()),
        referrer: async ({ referrer }, _, { dataSources }) => await dataSources.loaders.userLoader.load(referrer.toString()),
        investment: async ({ investment }, _, { dataSources }) => await dataSources.loaders.investmentLoader.load(investment.toString()),
    },
};
exports.resolvers = resolvers;
