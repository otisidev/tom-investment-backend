const { AuthenticationError, ApolloError } = require("apollo-server");
const { TopUpInvestmentService } = require("../../service/top-up.service");
const { PlanService } = require("../../service/plan.service");
const { InvestmentService } = require("../../service/investment.service");

const resolvers = {
    Query: {
        GetInvestmentTopUp: async (_, { investment }, { user }) => {
            if (user) {
                const res = await TopUpInvestmentService.GetInvestmentTopUp(investment);
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        GetTopUpForApproval: async (_, { page, limit }, { user }) => {
            if (user) {
                const res = await TopUpInvestmentService.GetTopUpForApproval(page, limit);
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        }
    },
    Mutation: {
        NewInvestmentTopUp: async (_, { amount, investment }, { user }) => {
            if (user) {
                const result = await TopUpInvestmentService.NewTopUp(amount, investment, user.id);
                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        ApproveTopUp: async (_, { id }, { user }) => {
            if (user && user.isAdmin) {
                const res = await TopUpInvestmentService.Approve(id);
                // get new plan
                const _investment = await InvestmentService.GetSingle(res.doc.investment);
                const planResult = await PlanService.GetPlanByAmount(
                    Math.round(res.doc.amount + _investment.doc.investmentMade),
                    _investment.doc.category
                );
                if (!planResult) return new ApolloError("investment plan not found!");
                //update investment
                await InvestmentService.TopUp(res.doc.investment, res.doc.amount, planResult._id);
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        CancelTopUp: async (_, { id }, { user }) => {
            if (user && user.isAdmin) {
                const res = await TopUpInvestmentService.Cancel(id);
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        }
    },
    InvestmentTopUp: {
        id: ({ _id }) => _id,
        created_at: ({ created_at }) => new Date(created_at).toISOString(),
        investment: async ({ investment }, _, { dataSources }) => await dataSources.loaders.investmentLoader.load(investment.toString())
    }
};

exports.resolvers = resolvers;
