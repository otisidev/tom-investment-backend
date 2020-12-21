const { gql } = require("apollo-server");

const typeDefs = gql`
    extend type Query {
        GetCategory(id: ID!): CategoryResponse!
        GetCategories: CategoriesResponse!
    }
    extend type Mutation {
        NewCategory("Category input template" model: CategoryInput!): CategoryResponse!
        UpdateCategory("Category id" id: ID!, model: CategoryInput!): CategoryResponse!
        DeleteCategory("Category id" id: ID!): DeletedResponse!
    }

    "Category input template"
    input CategoryInput {
        "Title"
        title: String!
        "Description"
        desc: String!
    }

    type CategoryResponse {
        status: Int!
        message: String!
        doc: Category!
    }

    type CategoriesResponse {
        status: Int!
        message: String!
        docs: [Category]!
    }

    "Category Template"
    type Category {
        id: ID!
        "Category title"
        title: String!
        "Category description"
        desc: String!
        "Date of creation"
        created_at: String!
    }

    extend type Plan {
        category: Category!
    }
`;

exports.typeDefs = typeDefs;
