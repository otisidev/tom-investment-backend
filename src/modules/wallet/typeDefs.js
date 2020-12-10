const { gql } = require("apollo-server");

const typeDefs = gql`
    extend type Query {
        "Prepare wallet transaction"
        PrepareWalletTransaction("Amount to transfer" amount: Int!, "Wallet address of the receiver" wallet: String!): WalletTransaction!
    }
    "Wallet Transaction Template"
    type WalletTransaction {
        "The bitcoin wallet balance of the owner"
        balance: String!
        "Amount to transfer in bitcoin"
        bitcoin: String!
        "Amount to transfer in dollars"
        amount: String!
        "Bitcoin address fo the receiver"
        receiver: String!
        "sender bitcoin address"
        sender: String!
    }
`;

exports.typeDefs = typeDefs;
