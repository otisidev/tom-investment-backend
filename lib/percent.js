const _percent = 100;

/**
 * Calculates total percent of an amount and returns the result
 * @param {number} total Total investment made
 * @param {number} value Value of percentage
 */
const getPayout = (total, value) => {
    if (total && value) {
        // Get percent of the number
        const percent = value / _percent;
        // result
        return Math.floor(percent * total);
    }
    return 0;
};
module.exports = {
    calculatePayout: getPayout,
};
