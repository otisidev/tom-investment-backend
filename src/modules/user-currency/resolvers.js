const { AuthenticationError } = require("apollo-server");
const { UserCurrencyService } = require("../../service/user-currency.service");

const resolvers = {
    Query: {
        GetUserCurrency: async (_, { id }, { user }) => {
            if (user) {
                return await UserCurrencyService.GetCurrency(id || user.id);
            }
            return new AuthenticationError("Unauthorized access!");
        }
    },
    Mutation: {
        SetUserCurrency: async (_, { currency, id }, { user }) => {
            if (user) {
                const result = await UserCurrencyService.UpdateCurrency(id || user.id, currency);
                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        }
    },
    UserCurrency: {
        user: async ({ user }, _, { dataSources }) => await dataSources.loaders.userLoader.load(user.toString())
    }
};
exports.resolvers = resolvers;
