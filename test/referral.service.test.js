const { setupDB } = require("./config/test-setup");
const { InvestmentService } = require("../src/service/investment.service");
const { ReferrerService } = require("../src/service/referrer.service");
const { UserService } = require("../src/service/user.service");
const { PlanService } = require("../src/service/plan.service");
const { generate } = require("rand-token");
const { CoreService } = require("../lib");
const investment = require("./data/investment.json");
const user = require("./data/user.json");
const referral = require("./data/referral.json");
const plan = require("./data/plan.json");

setupDB();
// id
let id = ""; // referral payment id
let userId = ""; // second user to create with investment
let investmentId = ""; // investment id
let referrerId = ""; //first user to create

beforeAll(async () => {
    // referral
    const _codeR = generate(10, "0123456789");
    const refRes = await UserService.CreateUser({ ...user, referralCode: _codeR }, await CoreService.EncryptPassword(user.password));
    referrerId = refRes.doc.id;

    // user
    const _codeU = generate(10);
    const restU = await UserService.CreateUser(
        { ...user, email: "otis@looptrace.com", referralCode: _codeU, phone: "07024123525", walletAddress: "3NnXYNSQaWri23yx8inGXgUHRpGZL6urQj" },
        await CoreService.EncryptPassword("password123")
    );
    userId = restU.doc.id;

    const planRes = await PlanService.CreatePlan(plan);

    // investment
    const investmentRes = await InvestmentService.NewInvestment({ ...investment, plan: planRes.doc.id, user: userId });
    investmentId = investmentRes.doc.id;
});

describe("Referral service unit test.", () => {
    // CREATE
    it("Should create a new referral payment request successfully", async () => {
        // create
        const result = await ReferrerService.Create({ ...referral, investment: investmentId, user: userId, referrer: referrerId });

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        id = result.doc.id;
    });

    // GET SINGLE
    it("Should get a single referral payment successfully", async () => {
        const result = await ReferrerService.GetSingle(id);

        expect(result).toBeDefined();
        expect(result.id.toString()).toBe(id.toString());
    });

    it("Should get payable items successfully!", async () => {
        const result = await ReferrerService.GetPayableReferrals(1, 24);

        expect(result).toBeDefined();
        expect(result.docs).toBeDefined();
        expect(result.docs.length).toBeTruthy();
    });
    it("Should mark record paid.", async () => {
        const result = await ReferrerService.Paid(id);

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.paid).toBeTruthy();
    });
});
