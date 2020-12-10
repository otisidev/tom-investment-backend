const { setupDB } = require("./config/test-setup");
const { InvestmentService } = require("../src/service/investment.service");
const { UserService } = require("../src/service/user.service");
const { PlanService } = require("../src/service/plan.service");
const { InvestmentHistoryService } = require("../src/service/investment-log.service");
const investment = require("./data/investment.json");
const user = require("./data/user.json");
const plan = require("./data/plan.json");
const { generate } = require("rand-token");
const log = require("./data/log.json");

// investment log id
let id = "";
let planId = "";
let userId = "";
let investmentId = "";

setupDB();

beforeAll(async () => {
    // user
    const code = generate(10);
    const userResult = await UserService.CreateUser({ ...user, referralCode: code }, user.password);
    userId = userResult.doc.id;
    // plan
    const planRes = await PlanService.CreatePlan(plan);
    planId = planRes.doc.id;

    // investment
    const investRes = await InvestmentService.NewInvestment({ ...investment, plan: planId, user: userId });
    investmentId = investRes.doc.id;
});

describe("Investment log service unit test.", () => {
    it("Should create a new investment log successfully!", async () => {
        const result = await InvestmentHistoryService.LogInvestment({ ...log, investment: investmentId });

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.investment.toString()).toBe(investmentId.toString());
        id = result.doc.id;
    });

    it("Should get list of logs of a single investment successfully", async () => {
        const result = await InvestmentHistoryService.GetInvestmentLogs(investmentId);

        expect(result).toBeDefined();
        expect(result.docs).toBeDefined();
        expect(result.docs.length).toBeTruthy();
    });

    it("Should get a single investment log successfully!", async () => {
        const result = await InvestmentHistoryService.GetSingle(id);

        expect(result).toBeDefined();
        expect(result.id.toString()).toBe(id.toString());
    });
});
