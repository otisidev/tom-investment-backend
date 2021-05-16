const { gql } = require("apollo-server");

const typeDefs = gql`
    extend type Query {
        GetInvestmentTopUp(investment: ID!): TopUpListResponse!
        GetTopUpForApproval(page: Int, limit: Int): TopUpPaginatedListResponse!
    }
    extend type Mutation {
        NewInvestmentTopUp(amount: Int!, investment: ID!): TopUpResponse!
        ApproveTopUp("id" id: ID!): TopUpResponse!
        CancelTopUp("id" id: ID!): DeletedResponse!
    }

    type TopUpResponse {
        status: Int!
        message: String!
        doc: InvestmentTopUp!
    }
    type TopUpListResponse {
        status: Int!
        message: String!
        docs: [InvestmentTopUp!]
    }

    type TopUpPaginatedListResponse {
        status: Int!
        message: String!
        docs: [InvestmentTopUp]!
        page: Int
        limit: Int
        totalPages: Int
        totalDocs: Int
        nextPage: Int
        prevPage: Int
    }

    "InvestmentTopUp Template"
    type InvestmentTopUp {
        id: ID!
        amount: Int!
        investment: Investment!
        created_at: String!
        approved: Boolean!
    }
`;

exports.typeDefs = typeDefs;
