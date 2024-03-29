const { gql } = require("apollo-server");

const typeDefs = gql`
    extend type Query {
        GetUserCurrency(id: ID): UserCurrencyResponse!
    }

    extend type Mutation {
        SetUserCurrency(currency: String!, id: ID): UserCurrencyResponse!
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
