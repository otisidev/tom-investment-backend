const { CurrencyModel } = require("../model/currency.model");
const { Types } = require("mongoose");
const { BatchDataLoader } = require("../../lib/batch-entity");

const Model = CurrencyModel;
const { isValid } = Types.ObjectId;

exports.CurrencyService = class CurrencyService {
    static async CreateCurrency(model) {
        try {
            if (model) {
                const op = await new Model(model).save();
                if (op) {
                    return {
                        status: 200,
                        message: "Completed!",
                        doc: op
                    };
                }
            }
            throw new Error("Invalid Currency Object!");
        } catch (error) {
            if (error.message.startsWith("E11000 duplicate key error collection:")) throw new Error("Bad data! Currency already exists.");
            throw error;
        }
    }

    /**
     * Updates the Props of a Currency
     * @param {string} Currency Currency id
     * @param {{}} model updated Currency object
     */
    static async UpdateCurrency(Currency, model) {
        try {
            if (isValid(Currency)) {
                const query = { removed: false, _id: Currency };
                const update = {
                    $set: {
                        name: model.name,
                        address: model.address
                    }
                };
                const op = await Model.findOneAndUpdate(query, update, {
                    new: true
                }).exec();
                if (op) {
                    return {
                        status: 200,
                        message: "Completed!",
                        doc: op
                    };
                }
            }
            throw new Error("Currency not found!");
        } catch (error) {
            throw error;
        }
    }

    /**
     * Removes a Currency from user access
     * @param {string} Currency
     */
    static async DeleteCurrency(Currency) {
        try {
            const _item = await this.GetCurrency(Currency);
            const query = { removed: false, _id: Currency };
            const update = {
                $set: { removed: true, name: `${_item.doc.name} - Deleted - ${new Date().toISOString()}` }
            };
            const op = await Model.findOneAndUpdate(query, update).exec();
            if (op) {
                return {
                    status: 200,
                    message: "Completed!",
                    doc: { id: Currency, status: "Deleted" }
                };
            }

            throw new Error("Currency not found!");
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves a list of all the Currency
     */
    static async GetCurrencies() {
        const query = { removed: false };
        const op = await Model.find(query).sort({ name: 1 }).exec();
        if (op) {
            return {
                status: 200,
                message: "Completed!",
                docs: op
            };
        }
    }
    /**
     * Gets a single Currency
     * @param {string} Currency Currency id
     */
    static async GetCurrency(Currency) {
        if (isValid(Currency)) {
            const query = { removed: false, _id: Currency };
            const op = await Model.findOne(query).exec();
            if (op) {
                return {
                    status: 200,
                    message: "Completed!",
                    doc: op
                };
            }
        }
        throw new Error("Currency not found!");
    }

    /**
     * Gets list of Currency
     * @param {Array<string>} ids user ids
     */
    static async GetMany(ids) {
        const q = { _id: { $in: ids } };
        const result = await Model.find(q).exec();
        return BatchDataLoader(ids, result);
    }
};
