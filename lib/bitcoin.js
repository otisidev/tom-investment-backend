const request = require("request-promise");
const { Client } = require("coinbase");

const BASE_BITCOIN = "https://blockchain.info/tobtc";

// config
const client = new Client({
    apiKey: "YwXsa904RgBRXPax",
    apiSecret: "NuJ0Vd8pW54db9qNY5c9otSV8UXEU1jB",
    strictSSL: false,
});

/**
 * Convert dollars to bitcoin
 * @param value {any} Amount in dollars
 */
const getBitcoinValue = (value) =>
    new Promise(function (resolve, reject) {
        request(`${BASE_BITCOIN}?currency=USD&value=${value}`)
            .then((cb) => resolve(cb))
            .catch((err) => reject(err));
    });

const makeTransaction = (to, btc, desc = "Investment Payout") =>
    new Promise((resolve, reject) => {
        client.getAccount("primary", (err, account) => {
            if (err) reject(err.message);

            // make the transfer here
            if (account) {
                account.sendMoney(
                    {
                        to,
                        amount: btc,
                        description: desc,
                        currency: "BTC",
                    },
                    (failed, tnx) => {
                        if (failed) reject(failed.message);
                        // console.log("Coinbase Transaction: ", tnx);
                        resolve(tnx);
                    }
                );
            } else {
                reject("Coinbase: Account not found!");
            }
        });
    });

const getAccount = () =>
    new Promise((resolve, reject) => {
        client.getAccount("primary", (error, result) => {
            if (error) {
                reject(error.message);
                return;
            }
            if (!result) {
                reject("Unable to fet account information");
                return;
            }
            const { id, balance, name } = result;
            resolve({ id, name, balance: balance.amount });
        });
    });

module.exports = {
    toBitcoin: getBitcoinValue,
    sendFund: makeTransaction,
    getAccount: getAccount,
};
