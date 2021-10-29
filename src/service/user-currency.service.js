const { UserCurrencyModel } = require("../model/user-currency.model");
const { Types } = require("mongoose");

const Model = UserCurrencyModel;
const { isValid } = Types.ObjectId;

exports.UserCurrencyService = class UserCurrencyService {
    /**
     * Logs a new investment history
     * @param {{}}} model new model
     */
    static async NewCurrency(user, currency) {
        if (currency && isValid(user)) {
            const cb = await new Model({ user, currency }).save();
            if (cb)
                return {
                    status: 200,
                    message: "Created successfully",
                    doc: cb
                };
        }
        throw new Error("Account not found");
    }

    static async GetCurrency(user) {
        if (isValid(user)) {
            const q = { user };
            const cb = await Model.findOne(q).exec();
            if (cb) return { status: 200, doc: cb, message: "Found" };
        }
        throw new Error("Currency not set!");
    }

    static async HasCurrency(user) {
        if (isValid(user)) {
            const q = { user };
            const count = await Model.countDocuments(q).exec();
            return count > 0;
        }
        return false;
    }

    static async UpdateCurrency(user, currency) {
        if (!(await this.HasCurrency(user))) return await this.NewCurrency(user, currency);
        const q = { user };
        const u = { $set: { currency } };
        const doc = await Model.findOneAndUpdate(q, u, { new: true }).exec();
        if (doc) return { doc: doc, message: "Currency set successfully!", status: 200 };
        throw new Error("Account not found");
    }
};
