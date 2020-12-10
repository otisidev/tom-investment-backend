const { NextKinModel } = require("../model/kin.model");
const { Types } = require("mongoose");
const { BatchDataLoader } = require("../../lib/batch-entity");

const Model = NextKinModel;
const { isValid } = Types.ObjectId;

class NextOfKinService {
    /**
     * Creates a new next of kin object
     * @param {any} model update object
     * @param {string} user user object id
     */
    static async NewKin(model, user) {
        try {
            if (model && isValid(user)) {
                const op = await new Model({ ...model, user }).save();
                if (op) {
                    return {
                        status: 200,
                        message: "Next of kin created successfully!",
                        doc: op,
                    };
                }
            }
            throw new Error("Invalid next of kin Object!");
        } catch (error) {
            if (error.message.startsWith("E11000 duplicate key error collection:")) throw new Error("Bad data! next of kin already exists.");
            throw error;
        }
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
    /**
     *
     * @param {string} id
     * @param {*} update
     * @param {*} user
     */
    static async UpdateKin(id, update, user) {
        try {
            if (isValid(id) && update && isValid(user)) {
                const { email, phone, name, image, relationship } = update;
                const query = { removed: false, _id: id, user };
                const _update = { $set: { email, image, name, phone, relationship } };
                const cb = await Model.findOneAndUpdate(query, _update).exec();
                if (cb)
                    return {
                        status: 200,
                        message: "Update next of kin information successfully!",
                        doc: cb,
                    };
            }
            throw new Error("Bad data! Next of kin not found.");
        } catch (error) {
            if (error.message.startsWith("E11000 duplicate key error collection:")) throw new Error("Bad data! next of kin already exists.");
            throw error;
        }
    }

    static async HasNextOfKin(user) {
        if (isValid(user)) {
            const query = { removed: false, user };
            const count = await Model.countDocuments(query).exec();

            return count > 0;
        }
        return false;
    }
}

exports.NextOfKinService = NextOfKinService;
