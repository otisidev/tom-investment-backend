const { setupDB } = require("./config/test-setup");
const { generate } = require("rand-token");
const { CoreService } = require("../lib");
const { UserService } = require("../src/service/user.service");
const user = require("./data/user.json");

// user id
let id = undefined;
const code = generate(10);
setupDB();

describe("User service unit test", () => {
    // CREATE
    it("Should create a new user successfully!", async () => {
        const hashed = await CoreService.EncryptPassword(user.password);
        const result = await UserService.CreateUser({ ...user, referralCode: code }, hashed);

        expect(result).toBeDefined();
        expect(result.status).toBe(200);
        expect(result.doc).toBeDefined();
        id = result.doc.id;
    });

    // GET SINGLE USER
    it("Should a single user using only it's id successfully!", async () => {
        const result = await UserService.GetSingleUser(id);

        expect(result).toBeDefined();
        expect(result.status).toBe(200);
        expect(result.doc).toBeDefined();
        expect(result.doc.email).toBe(user.email);
    });

    // GET SINGLE USER
    it("Should a single user using only it's email address successfully!", async () => {
        const result = await UserService.GetUserByEmail(user.email);

        expect(result).toBeDefined();
        expect(result.status).toBe(200);
        expect(result.doc).toBeDefined();
        expect(result.doc.email).toBe(user.email);
    });

    // GET SINGLE USER
    it("Should a single user using only it's phone number successfully!", async () => {
        const result = await UserService.GetUserByEmail(user.phone);

        expect(result).toBeDefined();
        expect(result.status).toBe(200);
        expect(result.doc).toBeDefined();
        expect(result.doc.phone).toBe(user.phone);
    });

    it("Should user using referral code successfully!", async () => {
        const result = await UserService.GetUserByReferralCode(code);
        expect(result).toBeDefined();
        expect(result.status).toBe(200);
        expect(result.doc).toBeDefined();
        expect(result.doc.referralCode).toBe(code);
    });

    it("Should verify email address successfully", async () => {
        const result = await UserService.EmailVerification(id);
        expect(result).toBeDefined();
        expect(result.status).toBe(200);
        expect(result.doc).toBeDefined();
        expect(result.doc.verified).toBeTruthy();
    });

    it("Should Change user's password successfully!", async () => {
        const password = "new$password";
        const hashed = await CoreService.EncryptPassword(password);
        const result = await UserService.NewPassword(user.email, hashed);

        expect(result).toBeDefined();
        expect(result.status).toBe(200);
        expect(result.doc).toBeDefined();
        expect(result.doc.passwordHash).toBe(hashed);
    });

    it("Should get list of users successfully! ", async () => {
        const result = await UserService.GetUsers(1, 25);

        expect(result).toBeDefined();
        expect(result.status).toBe(200);
        expect(result.docs.length).toBeTruthy();
    });

    it("Should update user's account successfully", async () => {
        const first = "Otis";
        const last = "Chiemezie";
        const result = await UserService.UpdateAccount(id, { ...user, firstname: first, lastname: last });

        expect(result).toBeDefined();
        expect(result.status).toBe(200);
        expect(result.doc.firstname).toBe(first);
        expect(result.doc.lastname).toBe(last);
    });

    it("Should return total count of users within the system successfully", async () => {
        const result = await UserService.CountUsers();
        expect(result).toBeTruthy();
    });

    it("Should generate password reset code successfully!", async () => {
        const result = await UserService.GenerateResetCode(id);
        expect(result).toBeDefined();
    });

    it("Should remove a single user's account successfully!", async () => {
        const result = await UserService.Remove(id);

        expect(result).toBeDefined();
        expect(result.status).toBe(200);
        expect(result.doc).toBeDefined();
        expect(result.doc.id.toString()).toBe(id.toString());
    });
});
