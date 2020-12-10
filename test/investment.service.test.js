const { setupDB } = require("./config/test-setup");
const { InvestmentService } = require("../src/service/investment.service");
const { UserService } = require("../src/service/user.service");
const { PlanService } = require("../src/service/plan.service");
const investment = require("./data/investment.json");
const user = require("./data/user.json");
const plan = require("./data/plan.json");
const { generate } = require("rand-token");

// investment id
let id = "";
let planId = "";
let userId = "";

setupDB();

beforeAll(async () => {
    const code = generate(10);
    const userResult = await UserService.CreateUser({ ...user, referralCode: code }, user.password);
    userId = userResult.doc.id;

    const planRes = await PlanService.CreatePlan(plan);
    planId = planRes.doc.id;
});

describe("Investment service unit test.", () => {
    // new investment
    it("Should create new investment successfully!", async () => {
        const result = await InvestmentService.NewInvestment({ ...investment, plan: planId, user: userId });

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        id = result.doc.id;
    });

    // CONFIRM INVESTMENT
    it("Should confirm a single investment successfully", async () => {
        const wallet = "1HFnDpJxefxnUtE2CQYckvr8sKFpo3rbQs";
        const result = await InvestmentService.ConfirmPayment(id, wallet);

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.walletAddress).toBe(wallet);
        expect(result.doc.paid).toBeTruthy();
    });

    // GET INVESTMENT FOR APPROVAL
    it("Should get investments for approval successfully!", async () => {
        const result = await InvestmentService.GetInvestmentForApproval(1, 24);

        expect(result).toBeDefined();
        expect(result.docs).toBeDefined();
        expect(result.docs.length).toBeTruthy();
    });

    it("Should count pending investment successfully", async () => {
        const count = await InvestmentService.CountPendingInvestment();

        expect(count).toBeDefined();
        expect(count).toBe(1);
    });

    // APPROVE INVESTMENT
    it("Should approve a single investment successfully!", async () => {
        const next = new Date(new Date().setHours(24 * 7 * 1)).toISOString();
        const result = await InvestmentService.Approve(id, next);

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.nextFund).toBeDefined();
        expect(result.doc.approved).toBeTruthy();
    });

    it("Should get user investment list successfully!", async () => {
        const result = await InvestmentService.GetUserInvestment(userId, 1, 25);

        expect(result).toBeDefined();
        expect(result.docs).toBeDefined();
        expect(result.docs.length).toBeTruthy();
    });

    it("Should allow reinvestment.", async () => {
        const result = await InvestmentService.Reinvest(id, 200, 4);

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.investmentMade).toBe(1700);
        expect(result.doc.lastFund).toBeDefined();
        expect(result.doc.nextFund).toBeDefined();
    });

    it("Should make investment payout successfully!", async () => {
        const next = new Date(new Date().setHours(24 * 7 * 2)).toISOString();
        const result = await InvestmentService.Payout(id, 300, next);

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.lastFund).toBeDefined();
        expect(result.doc.nextFund).toBeDefined();
    });

    it("Should get a single investment successfully!", async () => {
        const result = await InvestmentService.GetSingle(id);

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.id.toString()).toBe(id.toString());
    });

    it("Should be the first investment", async () => {
        const result = await InvestmentService.IsFirstInvestment(userId);
        expect(result).toBeDefined();
        expect(result).toBeTruthy();
    });

    it("Should count user's investment successfully!", async () => {
        const result = await InvestmentService.CountInvestment(userId);
        expect(result).toBeDefined();
        expect(result).toBe(1);
    });

    it("Should count user's approved investment successfully!", async () => {
        const result = await InvestmentService.CountApprovedInvestment(userId);

        expect(result).toBeDefined();
        expect(result).toBe(1);
    });

    it("Should count active investment successfully", async () => {
        const count = await InvestmentService.CountActiveInvestment();

        expect(count).toBeDefined();
        expect(count).toBe(1);
    });

    it("Should sum all user's investment successfully", async () => {
        const count = await InvestmentService.SumInvestmentMade(userId);

        expect(count).toBeDefined();
        expect(count).toBeTruthy();
    });

    it("Should get all active investment successfully!", async () => {
        const result = await InvestmentService.GetActiveInvestments(1, 24);

        expect(result).toBeDefined();
        expect(result.docs).toBeDefined();
        expect(result.docs.length).toBeTruthy();
    });

    it("Should compound investment successfully!", async () => {
        const next = new Date(new Date().setHours(24 * 7 * 4)).toISOString();
        const payout = 500;
        const result = await InvestmentService.CompoundInvestment(id, next, userId, payout);

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.compounded).toBeDefined();
        expect(result.doc.compounded.status).toBeTruthy();
        expect(result.doc.compounded.payout).toBe(payout.toString());
    });

    it("Should be able to close a single investment successfully!", async () => {
        const result = await InvestmentService.CloseInvestment(id, userId);

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.id.toString()).toBe(id.toString());
    });
});
