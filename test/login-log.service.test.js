const { setupDB } = require("./config/test-setup");
const { generate } = require("rand-token");
const { UserService } = require("../src/service/user.service");
const { LoginLogService } = require("../src/service/login-log.service");
const { CoreService } = require("../lib");
const log = require("./data/login-log.json");
const user = require("./data/user.json");
const code = generate(10);
setupDB();
// plan id
let id = "";
let userId = "";

beforeAll(async () => {
    const hashed = await CoreService.EncryptPassword(user.password);
    const result = await UserService.CreateUser({ ...user, referralCode: code }, hashed);
    userId = result.doc.id;
});

describe("Testing user login logging functionality.", () => {
    it("Should user new login log successfully!", async () => {
        const result = await LoginLogService.LogNew({ ...log, user: userId });

        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.user.toString()).toBe(userId.toString());
        id = result.doc.id;
    });

    it("Should read login logs of a single user successfully!", async () => {
        const result = await LoginLogService.ViewUserLoginLog(userId, 1, 25);

        expect(result).toBeDefined();
        expect(result.docs).toBeDefined();
        expect(result.docs.length).toBeTruthy();
    });

    it("Should return a single login log successfully", async () => {
        const result = await LoginLogService.ViewLoginLog(id);
        expect(result).toBeDefined();
        expect(result.doc).toBeDefined();
        expect(result.doc.id.toString()).toBe(id.toString());
    });
});
