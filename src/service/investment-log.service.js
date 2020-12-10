const { InvestmentLogModel } = require("../model/investment-log.model");
const { Types } = require("mongoose");

const Model = InvestmentLogModel;
const { isValid } = Types.ObjectId;

exports.InvestmentHistoryService = class InvestmentHistoryService {
    /**
     * Logs a new investment history
     * @param {{}}} model new model
     */
    static async LogInvestment(model) {
        if (model && isValid(model.investment)) {
            const cb = await new Model(model).save();
            if (cb)
                return {
                    status: 200,
                    message: "Investment logged successfully",
                    doc: cb,
                };
        }
        throw new Error("Bad data! Investment not found");
    }

    /**
     * Gets a list of investment history
     * @param {string} investment investment id
     * @param {number} page page number
     * @param {number} limit maximum per request
     */
    static async GetInvestmentLogs(investment, page = 1, limit = 25) {
        if (isValid(investment)) {
            const q = { investment };
            const opt = { page, limit, sort: { created_at: -1 } };
            const cb = await Model.paginate(q, opt);
            return {
                ...cb,
                status: 200,
                message: "Completed!",
            };
        }
        throw new Error("Bad data! Investment not found!");
    }

    static async GetSingle(id) {
        if (isValid(id)) {
            const q = { _id: id };
            const cb = await Model.findOne(q).exec();
            if (cb) return cb;
        }
        throw new Error("Investment log not found!");
    }
};
