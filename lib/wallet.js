const BitcoinValidity = require("bitcoin-address-validation");

/**
 * Checks if bitcoin wallet address is valid
 * @param {string} address user wallet address
 */
const validate = async (address) => {
    if (address) {
        const result = BitcoinValidity(address);
        if (result) return true;
    }
    return false;
};
module.exports = {
    isWalletValid: validate,
};
