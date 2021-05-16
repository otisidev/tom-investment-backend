const { InvestmentModel } = require("../model/investment.model");
const { Types } = require("mongoose");
const { BatchDataLoader } = require("../../lib/batch-entity");

const Model = InvestmentModel;
const { isValid } = Types.ObjectId;

exports.InvestmentService = class InvestmentService {
    /**
     * Creates new Investment
     * @param {{}} model
     */
    static async NewInvestment(model) {
        try {
            const { investmentMade, user, plan } = model;
            if (isValid(user) && isValid(plan) && investmentMade) {
                const op = await new Model({ ...model }).save();
                if (op) {
                    await Model.populate(op, [
                        { path: "plan", model: "Plan" },
                        { path: "user", model: "User" }
                    ]);
                    return {
                        status: 200,
                        message: "Completed!",
                        doc: op
                    };
                }
            }
            throw new Error("Invalid Investment Object!");
        } catch (error) {
            throw error;
        }
    }

    /**
     * Approves an investment
     * @param {string} investment investment object
     * @param {string} nextFund next fund date
     */
    static async Approve(investment, nextFund) {
        if (isValid(investment) && nextFund) {
            const query = {
                removed: false,
                _id: investment,
                closed: false,
                declined: false,
                approved: false,
                paid: true
            };
            const update = { $set: { approved: true, nextFund } };
            const op = await Model.findOneAndUpdate(query, update, {
                new: true
            })
                .populate(["plan", "user"])
                .exec();
            if (op)
                return {
                    status: 200,
                    message: "Investment Approved!",
                    doc: op
                };
        }
        throw new Error("Investment not found!");
    }
    /**
     * Confirm an investment Payment
     * @param {string} investment
     * @param {string} wallet wallet address
     */
    static async ConfirmPayment(investment, wallet) {
        if (isValid(investment) && wallet) {
            const query = {
                removed: false,
                _id: investment,
                closed: false,
                declined: false,
                approved: false,
                paid: false
            };
            const update = { $set: { paid: true, walletAddress: wallet } };
            const op = await Model.findOneAndUpdate(query, update, {
                new: true
            })
                .populate(["plan", "user"])
                .exec();
            if (op)
                return {
                    status: 200,
                    message: "Investment Payment Confirmed Successfully!",
                    doc: op
                };
        }
        throw new Error("Investment or wallet address not found!");
    }

    /**
     * Declines an investment
     * @param {string} investment investment id
     */
    static async Decline(investment) {
        if (isValid(investment)) {
            const query = {
                removed: false,
                _id: investment,
                closed: false,
                declined: false,
                approved: false,
                paid: true
            };
            const update = { $set: { declined: true } };
            const op = await Model.findOneAndUpdate(query, update, {
                new: true
            }).exec();
            if (op)
                return {
                    status: 200,
                    message: "Investment Declined!",
                    doc: op
                };
        }
        throw new Error("Investment not found!");
    }

    /**
     * Retrieves user's investments
     * @param {string} user user object id
     * @param {int} page page number
     * @param {int} limit maximum record per request
     */
    static async GetUserInvestment(user, page = 1, limit = 25) {
        if (isValid(user)) {
            const query = { removed: false, user, closed: false };
            const op = await Model.paginate(query, {
                page,
                limit,
                sort: { created_at: -1, approved: 1 },
                populate: ["plan", "user"]
            });
            return {
                status: 200,
                message: "Completed!",
                ...op
            };
        }
        throw new Error("Investment not found!");
    }

    /**
     * closes the investment for a user
     * @param {string} investment investment object id
     * @param {string} user user object id
     */
    static async CloseInvestment(investment) {
        if (isValid(investment)) {
            const query = { removed: false, _id: investment };
            const update = { $set: { closed: true, removed: true } };
            const op = await Model.findOneAndUpdate(query, update).exec();
            if (op) {
                return {
                    status: 200,
                    message: "Investment closed successfully!",
                    doc: { id: investment, status: "Closed!" }
                };
            }
        }
        throw new Error("Investment not found!");
    }

    /**
     * Account investment reinvestment
     * @param {string} id Investment objectId
     * @param {number} payout total amount to increase the user's investment with
     * @param {number} weeks Number of days to the next fund date
     */
    static async Reinvest(id, payout, weeks) {
        if (isValid(id) && payout && weeks) {
            // query definition
            const q = {
                removed: false,
                closed: false,
                paid: true,
                approved: true,
                _id: id
            };
            const investment = await this.GetSingle(id);
            const dueDate = new Date(investment.doc.nextFund);
            // New date for payout
            dueDate.setHours(weeks * 7 * 24);
            // update statement
            const update = {
                $set: { nextFund: dueDate },
                $inc: { investmentMade: payout },
                $currentDate: { lastFund: true }
            };
            const cb = await Model.findOneAndUpdate(q, update, {
                new: true
            })
                .populate(["plan", "user"])
                .exec();
            if (cb)
                return {
                    status: 200,
                    message: "Operation completed successfully",
                    doc: cb
                };
        }
        throw new Error("Bad data! Investment not valid.");
    }

    /**
     * Pay for investment
     * @param {string} investment investment object id
     * @param {int} amount amount
     * @param {string} nextFund investment next fund date
     */
    static async Payout(investment, amount, nextFund) {
        if (isValid(investment) && amount && nextFund) {
            const q = {
                removed: false,
                approved: true,
                closed: false,
                declined: false,
                _id: investment
            };
            const update = {
                $set: { nextFund },
                $inc: { currentBalance: amount },
                $currentDate: { lastFund: true }
            };
            const cb = await Model.findOneAndUpdate(q, update, {
                new: true
            })
                .populate(["plan", "user"])
                .exec();
            if (cb) {
                //TODO: Update compound investment after payout await this.UpdateCompoundInvestment(investment); // update compound status
                return {
                    status: 200,
                    message: "Completed successfully!",
                    doc: cb
                };
            }
        }
        throw new Error("Investment or amount not valid!");
    }

    static async GetSingle(investment) {
        if (isValid(investment)) {
            const q = { removed: false, _id: investment };
            const cb = await Model.findOne(q).populate(["plan", "user"]).exec();
            if (cb)
                return {
                    status: 200,
                    message: "Found!",
                    doc: cb
                };
        }
        throw new Error("Investment not found!");
    }

    /**
     * Gets list of payable investment
     * @param {number} page page number
     * @param {number} limit maximum record per request
     * @param {string} user User's email address or phone number
     */
    static async GetPayableInvestments(page = 1, limit = 25, user = null) {
        const current = new Date();

        if (current.getDay() === 1) {
            let q = {
                removed: false,
                closed: false,
                approved: true,
                declined: false,
                nextFund: { $lte: current }
            };
            if (user) {
                q.user = { $in: user };
            }
            const opt = {
                page,
                limit,
                sort: { nextFund: -1 },
                populate: ["plan", "user"]
            };
            const cb = await Model.paginate(q, opt);
            return {
                ...cb,
                status: 200,
                message: "Completed!"
            };
        } else {
            throw new Error("Investment payout is only on Mondays!");
        }
    }

    static async GetInvestmentForApproval(page = 1, limit = 25) {
        const q = {
            removed: false,
            closed: false,
            paid: true,
            approved: false,
            declined: false
        };
        const option = {
            page,
            limit,
            sort: {
                created_at: -1
            },
            populate: ["plan", "user"]
        };
        const cb = await Model.paginate(q, option);
        return {
            ...cb,
            status: 200,
            message: "Completed"
        };
    }

    static async IsFirstInvestment(user) {
        if (isValid(user)) {
            const q = {
                removed: false,
                closed: false,
                paid: true,
                approved: true,
                user
            };
            const count = await Model.countDocuments(q).exec();
            return count === 1;
        }
        return false;
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

    static async CountInvestment(user) {
        if (isValid(user)) {
            const q = { removed: false, closed: false, user };
            return await Model.countDocuments(q).exec();
        }
        return 0;
    }

    static async CountApprovedInvestment(user) {
        if (isValid(user)) {
            const q = {
                removed: false,
                closed: false,
                user,
                approved: true
            };
            return await Model.countDocuments(q).exec();
        }
        return 0;
    }
    static async CountPendingInvestment() {
        const q = {
            removed: false,
            closed: false,
            approved: false,
            declined: false,
            paid: true
        };
        return await Model.countDocuments(q).exec();
    }

    static async CountActiveInvestment() {
        const q = {
            removed: false,
            closed: false,
            approved: true,
            declined: false,
            paid: true
        };
        return await Model.countDocuments(q).exec();
    }

    static async SumInvestmentMade(user) {
        // validation
        if (!isValid(user)) return 0;
        const q = {
            removed: false,
            closed: false,
            approved: true,
            paid: true,
            user
        };
        const cb = await Model.find(q).select("investmentMade").exec();
        if (cb.length) {
            const count = cb.map((c) => c.investmentMade).reduce((a, b) => a + b);
            return count;
        }
        return 0;
    }

    /**
     * Gets list of active investments
     * @param {number} page page number
     * @param {number} limit maximum record per request
     * @param {string} user [optional] user id
     */
    static async GetActiveInvestments(page = 1, limit = 25, user = null) {
        // query
        let q = {
            closed: false,
            approved: true,
            declined: false,
            paid: true
        };
        if (user) {
            q.user = { $in: user };
        }
        // option
        const opt = {
            page,
            limit,
            sort: {
                nextFund: -1,
                created_at: -1
            },
            populate: ["plan", "user"]
        };
        // execution
        const cb = await Model.paginate(q, opt);
        return {
            ...cb,
            status: 200,
            message: "Completed!"
        };
    }

    /**
     * Compound investment
     * @param {string} id investment id
     * @param {string} nextDate total number of weeks to compound
     * @param {string} user user object id
     * @param {number} payout amount to receive
     */
    static async CompoundInvestment(id, nextDate, user, payout) {
        if (isValid(id) && nextDate && isValid(user) && payout) {
            const _query = { removed: false, _id: id, user, closed: false };
            const _update = {
                $set: {
                    "compounded.status": true,
                    "compounded.payoutDate": nextDate,
                    "compounded.payout": payout,
                    nextFund: nextDate
                }
            };
            const result = await Model.findOneAndUpdate(_query, _update, { new: true }).exec();
            if (result)
                return {
                    status: 200,
                    message: "Operation completed successfully!",
                    doc: result
                };
        }
        throw new Error("Investment not found!");
    }

    static async UpdateCompoundInvestment(investment) {
        if (isValid(investment)) {
            const _query = { removed: false, _id: investment, "compounded.status": true };
            const _update = { $set: { "compounded.status": false } };
            const result = await Model.findOneAndUpdate(_query, _update).exec();
            if (result)
                return {
                    message: "Completed!",
                    status: 200,
                    doc: result
                };
        }
    }

    static async GetFirstInvestment(user) {
        if (isValid(user)) {
            const q = { removed: false, closed: false, paid: true, approved: true, user };
            const docs = await Model.find(q).sort({ created_at: 1 }).limit(1).exec();
            if (docs.length) return docs[0];
        }
        return null;
    }

    static async GetInvestmentGroupedByUsers() {
        const pipeline = [
            {
                $match: {
                    closed: false,
                    removed: false
                }
            },
            {
                $group: {
                    _id: "$user",
                    ids: { $push: "$_id" }
                }
            },
            {
                $project: {
                    user: "$_id",
                    investments: "$ids",
                    _id: 0
                }
            }
        ];
        return await Model.aggregate(pipeline).exec();
    }
    static async TopUp(id, amount, plan = null) {
        if (isValid(id) && amount) {
            const q = { removed: false, closed: false, _id: id };
            let update = { $inc: { investmentMade: amount } };
            if (plan) update.$set = { plan };
            const result = await Model.findOneAndUpdate(q, update).exec();
            if (result) return true;
        }
        return false;
    }
};
