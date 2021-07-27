const { gql } = require("apollo-server");

const typeDefs = gql`
    extend type Query {
        GetReferrals: ReferralListResponse!
        GetPayableReferrals(page: Int, limit: Int): ReferralListResponse!
    }
    extend type Mutation {
        PayReferral(id: ID!): ReferralSingleResponse!
        FixReferral: String!
        NewReferral(referrer: ID!, referred: ID!): ReferralSingleResponse!
    }   
    type ReferralSingleResponse {
        status: Int!
        message: String!
        doc: Referral!
    }
    type ReferralListResponse {
        status: Int!
        message: String!
        docs: [Referral!]
        page: Int
        "Maximum record per request"
        limit: Int
        "Total number of document"
        totalDocs: Int
        "Total pages"
        totalPages: Int
        "Next page number"
        nextPage: Int
        "Previous page number"
        prevPage: Int
        hasNextPage: Boolean
        hasPrevPage: Boolean
    }

    type Referral {
        id: ID!
        amount: String!
        investment: Investment!
        user: User!
        referrer: User!
        created_at: String!
        paid: Boolean!
    }
`;

exports.typeDefs = typeDefs;
