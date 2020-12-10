const { setupDB } = require("./config/test-setup");
const { PlanService } = require("../src/service/plan.service");
const plan = require("./data/plan.json");

setupDB();
// plan id
let id = undefined;

describe("Plan service unite test.", () => {
    // CREATE
    it("Should create a single plan successfully.", async () => {
        const result = await PlanService.CreatePlan(plan);

        expect(result).toBeDefined();
        expect(result.status).toBe(200);
        expect(result.doc).toBeDefined();
        expect(result.doc.title).toBe(plan.title);
        id = result.doc.id;
    });

    // UPDATE
    it("Should update plan's title successfully.", async () => {
        const name = "Standard Plus";
        const result = await PlanService.UpdatePlan(id, { ...plan, title: name });

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.title).toBe(name);
    });

    it("Should  get single plan successful!", async () => {
        const result = await PlanService.GetPlan(id);

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.id.toString()).toBe(id.toString());
    });

    it("Should get a list of plans under the system successfully!", async () => {
        const result = await PlanService.GetPlans();

        expect(result).toBeDefined();
        expect(result.docs.length).toBeTruthy();
    });

    // REMOVE
    it("Should remove a single plan successfully!", async () => {
        const result = await PlanService.DeletePlan(id);

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.id.toString()).toBe(id.toString());
    });
});
