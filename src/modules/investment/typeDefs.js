const { gql } = require("apollo-server");

const typeDefs = gql`
    extend type Query {
        "Gets a list of Investment"
        GetUserInvestments(" Page number" page: Int, "maximum record per request" limit: Int): InvestmentListResponse!
        "Gets a list of Investment for approval"
        GetInvestmentsForApproval(" Page number" page: Int, "maximum record per request" limit: Int): InvestmentListResponse!
        GetPayableInvestments(
            "Page number"
            page: Int
            "Maximum record per request"
            limit: Int
            "User email address or phone"
            user: String
        ): InvestmentListResponse!
        "Count all investment of a user"
        CountInvestment: Int!
        "Count all user's approved investment"
        CountApprovedInvestment: Int!
        "Count all paid investment awaiting approval"
        CountPendingInvestment: Int!
        "Count all active  investment"
        CountActiveInvestment: Int!
        "Count Sum of the investment made"
        SumInvestmentMade: Int!
        "Get investment histories"
        GetInvestmentHistory(
            "Investment id"
            id: ID!
            "page number"
            page: Int!
            "maximum record per request"
            limit: Int!
        ): InvestmentHistoryList!

        GetActiveInvestment(
            "Page number"
            page: Int
            "Maximum record per request"
            limit: Int
            "User email address or phone"
            user: String
        ): InvestmentListResponse!
    }

    extend type Mutation {
        "User new investment"
        NewInvestment("user investment model" model: InvestmentInput!): SingleInvestmentResponse!
        "Approves a single user's investment"
        ApproveInvestment("Investment id" id: ID!, nextFund: String!): SingleInvestmentResponse!
        "Declines a single user's investment"
        DeclineInvestment("Investment id" id: ID!): SingleInvestmentResponse!
        "Confirms an investment by the user"
        PaidForInvestment("Investment id" id: ID!, "User's wallet address" wallet: String!): SingleInvestmentResponse!
        "New investment by an admin"
        NewInvestmentByAdmin("New investment complete object" model: NewInvestmentInput!): SingleInvestmentResponse!
        Payout("Investment id" id: ID!, "Amount in bitcoin" btc: String!, "Receiver address" to: String!): SingleInvestmentResponse!
        "Reinvestment"
        Reinvestment("investment id" id: ID!, "Payout" payout: Int!, "weeks to next payout" weeks: Int!): SingleInvestmentResponse
        CompoundInvestment("investment id" id: ID!, "Payout" payout: String!, "next fund date" nextFund: String!): SingleInvestmentResponse!
        "Close active investment"
        CloseInvestment("investment id" id: ID!): DeletedResponse!
        FixInvestment: String!
    }

    type InvestmentHistory {
        id: ID!
        amount: Int!
        reason: String!
        date: String!
    }

    type InvestmentHistoryList {
        status: Int
        message: String
        docs: [InvestmentHistory!]
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
    "New Investment Object Template"
    input InvestmentInput {
        "Selected plan id"
        plan: ID!
        "Amount invested"
        investmentMade: Int!
        "Total day to payout"
        daysToPayout: Int!
        "Weekly payout interval"
        weeklyPayoutInterval: Int!
    }
    "New Investment Object Template"
    input NewInvestmentInput {
        "Selected plan id"
        plan: ID!
        "Amount invested"
        investmentMade: Int!
        "User id "
        user: ID!
        "date and time of the investment"
        date: String!
        "Payment status of the investment"
        paid: Boolean!
        "Investment approval status"
        approved: Boolean!
        nextFund: String!
        "Total day to payout"
        daysToPayout: Int!
        "Weekly payout interval"
        weeklyPayoutInterval: Int!
    }

    type SingleInvestmentResponse {
        "Status code: 200: Ok"
        status: Int!
        "Status message"
        message: String!
        "User object"
        doc: Investment!
    }

    type InvestmentListResponse {
        "Request status code"
        status: Int!
        "Request status message"
        message: String!
        "list of patient"
        docs: [Investment!]
        "Page number"
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

    type Investment {
        "Investment id"
        id: ID!
        "Created at"
        created_at: String!
        "Plan object template"
        plan: Plan!
        "Total investment made"
        investment_made: Int!
        "User object template"
        user: User!
        "date and time of the investment"
        date: String!
        "Payment status of the investment"
        paid: Boolean!
        "Approval status of the investment"
        approved: Boolean!
        "Active status of the investment"
        closed: Boolean!
        "Is investment declined?"
        declined: Boolean!
        "Current balance"
        balance: Int!
        "Weekly payout"
        payout_sum: Int!
        "Compound payout"
        payout_weekly: Int!
        "weeks"
        weeks_to_next: Int
        "Next payout date"
        next_fund_date: String
        "Last payout date"
        last_fund_date: String
        compounded: InvestmentCompound
        walletAddress: String

        "Days to payout"
        days_to_payout: Int!
        "Weekly payout interval"
        weekly_payout_interval: Int!
    }

    type InvestmentCompound {
        status: Boolean
        payout: String
        payoutDate: String
    }
`;

exports.typeDefs = typeDefs;
