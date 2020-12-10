const { mailing } = require("../src/service/mailing.service");
const user = require("./data/user.json");

describe("Mailing Service unit test.", () => {
    // Account creation test
    it("Should send message on new account creation.", async () => {
        const result = await mailing.SendEmailConfirmation("/some/invalid/link", user.email, `${user.firstname} ${user.lastname}`);

        expect(result).toBeDefined();
        expect(result.status).toBe(200);
    });

    // Send email notification
    it("Should send email notification to user successfully. ", async () => {
        const result = await mailing.SendEmailNotification(user.email, "Testing email notification", `<h4>Email notification testing from NODEJS</h4>`);

        expect(result).toBeDefined();
        expect(result.status).toBe(200);
    });

    // Password reset
    it("Should send password reset link to user's email successfully", async () => {
        const name = `${user.firstname} ${user.lastname}`;

        const result = await mailing.SendPasswordResetLink("/invalid-link", "bhjvbjhe823", name, user.email);
        expect(result).toBeDefined();
        expect(result.status).toBe(200);
    });
});
