const { AuthenticationError } = require("apollo-server");
const { toBitcoin } = require("../../../lib/bitcoin");

const resolvers = {
    Query: {
        PrepareWalletTransaction: async (_, { amount, wallet }, { user }) => {
            if (user && user.isAdmin) {
                // get balance
                // const { balance } = await dataSources.helpers.getAccount();
                // get bitcoin value
                const coin = await toBitcoin(amount);

                return {
                    balance: 0.0,
                    sender: user.walletAddress,
                    receiver: wallet,
                    bitcoin: coin,
                    amount,
                };
            }
            return new AuthenticationError("Unauthorized access!");
        },
    },
};

exports.resolvers = resolvers;
