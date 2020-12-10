const { toBitcoin, getAccount } = require("../lib/bitcoin");
const { walletAddress } = require("./data/user.json");
const { isWalletValid } = require("../lib/wallet");
describe("Testing bitcoin related services", () => {
    // bitcoin converter
    it("Should convert $ to bitcoin successfully", async () => {
        const amount = 10000; // converting $1,000 to bitcoin
        const bitcoin = await toBitcoin(amount);

        expect(bitcoin).toBeDefined();
    });

    it("Should get coinbase account information successfully.", async () => {
        const info = await getAccount();

        expect(info).toBeDefined();
    });

    it("Should confirm if value is a valid bitcoin address successfully", async () => {
        const result = await isWalletValid(walletAddress);

        expect(result).toBeDefined();
        expect(result).toBeTruthy();
    });
});
