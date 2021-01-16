const { AuthenticationError } = require("apollo-server");
const { CategoryService } = require("../../service/category.service");

const resolvers = {
    Query: {
        GetCategory: async (_, { id }, { user }) => {
            if (user) {
                const res = await CategoryService.GetCategory(id);
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        GetCategories: async (_, __, { user }) => {
            if (user) {
                const res = await CategoryService.GetCategories();
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        }
    },
    Mutation: {
        NewCategory: async (_, { model }, { user }) => {
            if (user && user.isAdmin) {
                const result = await CategoryService.CreateCategory(model);
                return result;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        UpdateCategory: async (_, { id, model }, { user }) => {
            if (user && user.isAdmin) {
                const res = await CategoryService.UpdateCategory(id, model);
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        DeleteCategory: async (_, { id }, { user }) => {
            if (user && user.isAdmin) {
                const res = await CategoryService.DeleteCategory(id);
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        }
    },
    Category: {
        created_at: ({ created_at }) => new Date(created_at).toISOString()
    },
    Plan: {
        category: async ({ category }, _, { dataSources }) => await dataSources.loaders.categoryLoader.load(category.toString())
    }
};

exports.resolvers = resolvers;
