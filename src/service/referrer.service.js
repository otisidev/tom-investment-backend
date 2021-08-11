const { ReferrerModel } = require("../model/referral.model");
const { Types } = require("mongoose");

const Model = ReferrerModel;
const { isValid } = Types.ObjectId;

exports.ReferrerService = class ReferrerService {
    // new
    static async Create(model) {
        if (model && isValid(model.user) && isValid(model.investment) && isValid(model.referrer)) {
            const cb = await new Model(model).save();
            if (cb) {
                return {
                    status: 200,
                    message: "Completed successfully!",
                    doc: cb
                };
            }
        }
        throw new Error("Bad data! Invalid referral object.");
    }
    // get unpaid
    static async GetPayableReferrals(page = 1, limit = 25) {
        // const current = new Date();
        // if (current.getDay() === 5) {
        const q = { paid: false };
        const opt = {
            page,
            limit,
            sort: { created_at: -1 }
        };
        const cb = await Model.paginate(q, opt);
        return {
            ...cb,
            status: 200,
            message: "Completed"
        };
        // }
        // throw new Error("Referral payout are only on Fridays!");
    }
    // pay
    static async Paid(id) {
        if (isValid(id)) {
            const q = { paid: false, _id: id };
            const update = { $set: { paid: true } };
            const cb = await Model.findOneAndUpdate(q, update, {
                new: true
            }).exec();
            if (cb)
                return {
                    status: 200,
                    message: "Record updated successfully!",
                    doc: cb
                };
        }
        throw new Error("Referral record not found!");
    }
    // get users referred account and amount
    static async GetReferredAccount(user) {
        if (isValid(user)) {
            const q = { referrer: user };
            const cb = await Model.find(q).sort({ created_at: -1 }).exec();
            return {
                status: 200,
                message: "Completed!",
                docs: cb
            };
        }
        return {
            status: 404,
            message: "No Referral found!",
            docs: []
        };
    }

    /**
     * Gets a single referral object
     * @param {string} id referral id
     */
    static async GetSingle(id) {
        if (isValid(id)) {
            // query
            const q = { _id: id };
            // result
            const result = await Model.findOne(q).exec();
            return result;
        }
        throw new Error("Referral object not found!");
    }

    /**
     * Check if already have any pending or paid referral request
     * @param {string} user user's id
     * @param {string} referrer user referrer's id
     */
    static async AlreadyLogged(user, referrer) {
        if (isValid(user) && isValid(referrer)) {
            const q = { user, referrer };
            const count = await Model.countDocuments(q).exec();
            return count > 0;
        }
        return false;
    }
};
