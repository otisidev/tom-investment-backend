const { WithdrawalModel } = require("../model/withdrawal.model");
const { Types } = require("mongoose");
const { BatchDataLoader } = require("../../lib/batch-entity");

const Model = WithdrawalModel;
const { isValid } = Types.ObjectId;

exports.WithdrawalService = class WithdrawalService {
    static async NewWithdrawal(user, amount) {
        try {
            if (isValid(user) && amount) {
                const op = await new Model({ user, amount }).save();
                if (op) {
                    return {
                        status: 200,
                        message: "Request sent successfully!",
                        doc: op
                    };
                }
            }
            throw new Error("Invalid Transaction Object!");
        } catch (error) {
            if (error.message.startsWith("E11000 duplicate key error collection:")) throw new Error("Transaction already exists.");
            throw error;
        }
    }

    static async Approve(id) {
        if (isValid(id)) {
            const q = { removed: false, approved: false, _id: id };
            const update = { $set: { approved: true } };
            const res = await Model.findOneAndUpdate(q, update, { new: true }).exec();
            if (res)
                return {
                    status: 200,
                    message: "Approved request successfully",
                    doc: res
                };
        }
        throw new Error("User not found!");
    }

    static async GetUserWithdrawals(user) {
        if (isValid(user)) {
            const q = { removed: false, user };
            const res = await Model.find(q).sort({ updated_at: -1 }).exec();
            return {
                status: 200,
                message: "completed",
                docs: res
            };
        }
        throw new Error("User not found!");
    }

    /**
     * Retrieves a list of all the Category
     */
    static async GetWithdrawalApprovals(page = 1, limit = 25) {
        const query = { removed: false, approved: false };
        const option = { page, limit, sort: { created_at: -1 } };
        const op = await Model.paginate(query, option);
        return {
            status: 200,
            message: "Completed!",
            ...op
        };
    }

    /**
     * Gets list of Category
     * @param {Array<string>} ids user ids
     */
    static async GetMany(ids) {
        const q = { _id: { $in: ids } };
        const result = await Model.find(q).exec();
        return BatchDataLoader(ids, result);
    }
};
