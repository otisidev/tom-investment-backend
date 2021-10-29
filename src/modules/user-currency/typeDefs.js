const { gql } = require("apollo-server");

const typeDefs = gql`
    extend type Query {
        GetUserCurrency: UserCurrencyResponse!
    }

    extend type Mutation {
        SetUserCurrency(currency: String!): UserCurrencyResponse!
    }

    type UserCurrencyResponse {
        status: Int!
        message: String!
        doc: UserCurrency!
    }

    type UserCurrency {
        id: ID!
        user: User!
        currency: String!
    }
`;

exports.typeDefs = typeDefs;
