const { AuthenticationError } = require("apollo-server");
const { ContactPersonService } = require("../../service/contact.service");

const resolvers = {
    Query: {
        GetContactPersons: async (_, { category }, { user }) => {
            if (user) {
                const res = await ContactPersonService.GetContactPersons(category);
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        GetContactPerson: async (_, { id }, { user }) => {
            if (user) {
                const res = await ContactPersonService.GetContactPerson(id);
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        },
        GetContactPersonGroupedBy: async (_, __, { user }) => {
            if (user) {
                const res = await ContactPersonService.GetContactPersonsGroupByCategory();
                return res;
            }
            return new AuthenticationError("Unauthorized access!");
        }
    },
    Mutation: {
        CreateContactPerson: async (_, { model }, { user }) => {
            if (user && user.isAdmin) {
                return await ContactPersonService.NewContactPerson(model);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        UpdateContactPerson: async (_, { id, update }, { user }) => {
            if (user && user.isAdmin) {
                return await ContactPersonService.UpdateContact(id, update);
            }
            return new AuthenticationError("Unauthorized access!");
        },
        RemoveContactPerson: async (_, { id }, { user }) => {
            if (user && user.isAdmin) {
                return await ContactPersonService.RemoveContactPerson(id);
            }
            return new AuthenticationError("Unauthorized access!");
        }
    },
    ContactPerson: {
        id: ({ _id }) => _id,
        created_at: ({ created_at }) => new Date(created_at).toISOString(),
        category: async ({ category }, _, { dataSources }) => await dataSources.loaders.categoryLoader.load(category.toString())
    },
    ContactPersonGroup: {
        category: async ({ category }, _, { dataSources }) => await dataSources.loaders.categoryLoader.load(category.toString())
    }
};

exports.resolvers = resolvers;
