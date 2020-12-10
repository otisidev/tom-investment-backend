const { isWalletValid, walletValidation } = require("../lib/wallet");

const wallet = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

describe("Wallet address validity test", () => {
    it("Should validate wallet address successfully", async () => {
        const result = await isWalletValid(wallet);

        expect(result).toBeTruthy();
    });

    it('Should test user defined reg expression successfully!', () => {
        const result  = walletValidation(wallet);
        expect(result).toBeTruthy();
    });
});
