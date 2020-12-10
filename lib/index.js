const { hash, compare } = require("bcryptjs");
const { sign } = require("jsonwebtoken");

class CoreService {
    /**
     * password hashing
     * @param {string} password password
     */
    static async EncryptPassword(password) {
        const hashedPassword = await hash(password, 10);
        return hashedPassword;
    }

    /**
     * Generate web token for currently authenticated user
     * @param {any} user object
     */
    static GenerateToken(user) {
        if (!user) throw new Error("Account not found!");
        const token = sign(user, process.env.DB_KEY, {
            expiresIn: "2h",
        });
        return token;
    }

    /**
     * Compare two passwords
     * @param {string} plain user plain password
     * @param {string} hashed saved hashed password
     */
    static async ComparePasswords(plain, hashed) {
        return await compare(plain, hashed);
    }

    /**
     * Check if email is valid
     * @param {string} email email address
     */
    static async IsEmailValid(email) {
        if (email) return email.includes("@");
        throw new Error("Email address is invalid!");
    }
}
exports.CoreService = CoreService;
