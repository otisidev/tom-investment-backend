const { TopUpModel } = require("../model/top-up.model");
const { Types } = require("mongoose");
// const { BatchDataLoader } = require("../../lib/batch-entity");

const Model = TopUpModel;
const { isValid } = Types.ObjectId;

class TopUpInvestmentService {
    static async NewTopUp(amount, investment, user) {
        try {
            if (isValid(investment) && isValid(user) && amount) {
                const res = await new Model({ user, amount, investment }).save();
                if (res) return { status: 200, message: "Top-up request sent successfully!", doc: res };
            }
            throw new Error("invalid investment top-up!");
        } catch (error) {
            throw error;
        }
    }

    static async Approve(id) {
        if (isValid(id)) {
            const q = { removed: false, _id: id, approved: false };
            const u = { $set: { approved: true } };
            const res = await Model.findOneAndUpdate(q, u, { new: true });
            if (res) return { status: 200, message: "Top-up approved successfully!", doc: res };
        }
        throw new Error("Investment top-up not found!");
    }

    static async Cancel(id) {
        if (isValid(id)) {
            const q = { removed: false, _id: id, approved: false };
            const u = { $set: { removed: true } };
            const res = await Model.findOneAndUpdate(q, u);
            if (res) return { status: 200, message: "Top-up request cancelled successfully!", doc: { status: "Deleted", id } };
        }
        throw new Error("Investment top-up not found!");
    }

    static async GetInvestmentTopUp(investment) {
        if (isValid(investment)) {
            const q = { removed: false, investment };
            const res = await Model.find(q).sort({ created_at: -1 }).exec();
            return { docs: res, message: "Completed", status: 200 };
        }
        throw new Error("Unknown investment object!");
    }

    static async GetTopUpForApproval(page, limit) {
        const q = { removed: false, approved: false };
        const opt = { page, limit, sort: { created_at: -1 } };
        const res = await Model.paginate(q, opt);
        return {
            ...res,
            message: "completed",
            status: 200
        };
    }
}

module.exports = {
    TopUpInvestmentService
};
