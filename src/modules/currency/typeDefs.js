const { gql } = require("apollo-server");

const typeDefs = gql`
    extend type Query {
        GetCurrency(id: ID!): CurrencyResponse!
        GetCurrencies: CurrenciesResponse!
    }
    extend type Mutation {
        NewCurrency("Currency input template" model: CurrencyInput!): CurrencyResponse!
        UpdateCurrency("Currency id" id: ID!, model: CurrencyInput!): CurrencyResponse!
        DeleteCurrency("Currency id" id: ID!): DeletedResponse!
    }

    "Currency input template"
    input CurrencyInput {
        "name"
        name: String!
        "wallet address"
        address: String!
    }

    type CurrencyResponse {
        status: Int!
        message: String!
        doc: Currency!
    }

    type CurrenciesResponse {
        status: Int!
        message: String!
        docs: [Currency]!
    }

    "Currency Template"
    type Currency {
        id: ID!
        "Currency name"
        name: String!
        "Currency wallet address"
        address: String!
        "Date of creation"
        created_at: String!
    }

    extend type Investment {
        currency: Currency
    }
`;

exports.typeDefs = typeDefs;
