const { calculatePayout } = require("../lib/percent");

describe("Test percentage function", () => {
    it("Should return 20 as the 2% of 1000", () => {
        const value = calculatePayout(1000, 2);

        expect(value).toBeDefined();
        expect(value).toBe(20);
    });
});
