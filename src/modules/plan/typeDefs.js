const { gql } = require("apollo-server");

const typeDefs = gql`
    extend type Query {
        "Gets a list of Plan"
        GetPlans("Category id" category: ID!): PlanListResponse!
    }

    extend type Mutation {
        "New Plan"
        NewPlan("New plan object" model: PlanInput!): SinglePlanResponse!
        "Deletes a single plan object"
        DeletePlan("plan's id" id: ID!): DeletedResponse!
        "Update plan"
        UpdatePlan(id: ID!, update: PlanUpdateInput!): SinglePlanResponse!
    }
    type DeletedResponse {
        message: String!
        status: Int!
        doc: DeleteDoc!
    }

    type DeleteDoc {
        id: ID!
        status: String!
    }

    "Option identity template"
    input PlanInput {
        "plan title"
        title: String!
        "Plan's minimum Amount"
        amount: String!
        "Maximum amount"
        maxAmount: String!
        "percent"
        percent: Int!
        "Is the plan re-investable"
        canReinvestment: Boolean

        "Category id"
        category: ID!
    }
    "Option identity template"
    input PlanUpdateInput {
        "plan title"
        title: String!
        "Plan's minimum Amount"
        amount: String!
        "Maximum amount"
        maxAmount: String!
        "percent"
        percent: Int!
        "Is the plan re-investable"
        canReinvestment: Boolean
    }

    type SinglePlanResponse {
        "Status code: 200: Ok"
        status: Int!
        "Status message"
        message: String!
        "User object"
        doc: Plan!
    }

    type PlanListResponse {
        "Request status code"
        status: Int!
        "Request status message"
        message: String!
        "list of patient"
        docs: [Plan!]
    }

    type Plan {
        "Plan id"
        id: ID!
        "Plan's title"
        title: String!
        "Created at"
        created_at: String!
        "Can user reinvest this plan"
        can_reinvestment: Boolean!
        "Percent"
        percent: Int!
        "Minimum Amount"
        amount: Int!
        "maximum amount"
        max_amount: Int!
    }
`;

exports.typeDefs = typeDefs;
