const { PlanModel } = require("../model/plan.model");
const { Types } = require("mongoose");
const { BatchDataLoader } = require("../../lib/batch-entity");

const Model = PlanModel;
const { isValid } = Types.ObjectId;

class PlanService {
    /**
     * Creates new PLan
     * @param {{}} model
     */
    static async CreatePlan(model) {
        try {
            const { title, amount, percent, daysToPayout } = model;
            if (title && amount && percent && daysToPayout) {
                const op = await new Model(model).save();
                if (op) {
                    return {
                        status: 200,
                        message: "Completed!",
                        doc: op,
                    };
                }
            }
            throw new Error("Invalid Plan Object!");
        } catch (error) {
            if (error.message.startsWith("E11000 duplicate key error collection:")) throw new Error("Bad data! Plan already exists.");
            throw error;
        }
    }

    /**
     * Updates the Props of a Plan
     * @param {string} plan plan id
     * @param {{}} model updated plan object
     */
    static async UpdatePlan(plan, model) {
        try {
            if (isValid(plan)) {
                const query = { removed: false, _id: plan };
                const update = {
                    $set: {
                        title: model.title,
                        amount: model.amount,
                        percent: model.percent,
                        daysToPayout: model.daysToPayout,
                        weeklyPayoutInterval: model.weeklyPayoutInterval,
                        canReinvestment: model.canReinvestment,
                        maxAmount: model.maxAmount,
                    },
                };
                const op = await Model.findOneAndUpdate(query, update, {
                    new: true,
                }).exec();
                if (op) {
                    return {
                        status: 200,
                        message: "Completed!",
                        doc: op,
                    };
                }
            }
            throw new Error("Plan not found!");
        } catch (error) {
            throw error;
        }
    }

    /**
     * Removes a plan from user access
     * @param {string} plan
     */
    static async DeletePlan(plan) {
        try {
            if (isValid(plan)) {
                const query = { removed: false, _id: plan };
                const update = { $set: { removed: true } };
                const op = await Model.findOneAndUpdate(query, update).exec();
                if (op) {
                    return {
                        status: 200,
                        message: "Completed!",
                        doc: { id: plan, status: "Deleted" },
                    };
                }
            }
            throw new Error("Plan not found!");
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves a list of all the plans
     */
    static async GetPlans() {
        const query = { removed: false };
        const op = await Model.find(query).sort({ percent: 1 }).exec();
        if (op) {
            return {
                status: 200,
                message: "Completed!",
                docs: op,
            };
        }
    }
    /**
     * Gets a single plan
     * @param {string} plan plan id
     */
    static async GetPlan(plan) {
        if (isValid(plan)) {
            const query = { removed: false, _id: plan };
            const op = await Model.findOne(query).exec();
            if (op) {
                return {
                    status: 200,
                    message: "Completed!",
                    doc: op,
                };
            }
        }
        throw new Error("Investment plan not found!");
    }

    /**
     * Update reinvestment status of a single plan
     * @param {string} id plan id
     * @param {boolean} state can re investment or not
     */
    static async UpdateReinvestmentState(id, state) {
        if (isValid(id)) {
            const q = { removed: false, _id: id };
            const update = { $set: { canReinvestment: state } };
            const cb = await Model.findOneAndUpdate(q, update, {
                new: true,
            }).exec();
            if (cb)
                return {
                    status: 200,
                    message: "Plan updated successfully!",
                    doc: cb,
                };
        }
        throw new Error("Investment plan not found!");
    }

    /**
     * Gets list of Plan
     * @param {Array<string>} ids user ids
     */
    static async GetMany(ids) {
        const q = { _id: { $in: ids } };
        const result = await Model.find(q).exec();
        return BatchDataLoader(ids, result);
    }
}

exports.PlanService = PlanService;
