const { AuthenticationError } = require("apollo-server");
const { CurrencyService } = require("../../service/currency.service");

const resolvers = {
    Query: {
        GetCurrency: async (_, { id }, { user }) => {
            if (user) {
                const res = await CurrencyService.GetCurrency(id);
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        GetCurrencies: async (_, __, { user }) => {
            if (user) {
                const res = await CurrencyService.GetCurrencies();
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        }
    },
    Mutation: {
        NewCurrency: async (_, { model }, { user }) => {
            if (user && user.isAdmin) {
                const result = await CurrencyService.CreateCurrency(model);
                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        UpdateCurrency: async (_, { id, model }, { user }) => {
            if (user && user.isAdmin) {
                const res = await CurrencyService.UpdateCurrency(id, model);
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        DeleteCurrency: async (_, { id }, { user }) => {
            if (user && user.isAdmin) {
                const res = await CurrencyService.DeleteCurrency(id);
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        }
    },
    Currency: {
        created_at: ({ created_at }) => new Date(created_at).toISOString()
    },
    Investment: {
        currency: async ({ currency }, _, { dataSources }) => {
            if (currency) return await dataSources.loaders.currencyLoader.load(currency.toString());
            return null;
        }
    }
};

exports.resolvers = resolvers;
