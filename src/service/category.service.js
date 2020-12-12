const { CategoryModel } = require("../model/category.model");
const { Types } = require("mongoose");
const { BatchDataLoader } = require("../../lib/batch-entity");

const Model = CategoryModel;
const { isValid } = Types.ObjectId;

exports.CategoryService = class CategoryService {
    static async CreateCategory(model) {
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
            throw new Error("Invalid Category Object!");
        } catch (error) {
            if (error.message.startsWith("E11000 duplicate key error collection:"))
                throw new Error("Bad data! Category already exists.");
            throw error;
        }
    }

    /**
     * Updates the Props of a Category
     * @param {string} Category Category id
     * @param {{}} model updated Category object
     */
    static async UpdateCategory(Category, model) {
        try {
            if (isValid(Category)) {
                const query = { removed: false, _id: Category };
                const update = {
                    $set: {
                        title: model.title,
                        desc: model.desc
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
            throw new Error("Category not found!");
        } catch (error) {
            throw error;
        }
    }

    /**
     * Removes a Category from user access
     * @param {string} Category
     */
    static async DeleteCategory(Category) {
        try {
            const _item = await this.GetCategory(Category);
            const query = { removed: false, _id: Category };
            const update = {
                $set: { removed: true, title: `${_item.doc.title} - Deleted - ${new Date().toISOString()}` }
            };
            const op = await Model.findOneAndUpdate(query, update).exec();
            if (op) {
                return {
                    status: 200,
                    message: "Completed!",
                    doc: { id: Category, status: "Deleted" }
                };
            }

            throw new Error("Category not found!");
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves a list of all the Category
     */
    static async GetCategories() {
        const query = { removed: false };
        const op = await Model.find(query).sort({ title: 1 }).exec();
        if (op) {
            return {
                status: 200,
                message: "Completed!",
                docs: op
            };
        }
    }
    /**
     * Gets a single Category
     * @param {string} Category Category id
     */
    static async GetCategory(Category) {
        if (isValid(Category)) {
            const query = { removed: false, _id: Category };
            const op = await Model.findOne(query).exec();
            if (op) {
                return {
                    status: 200,
                    message: "Completed!",
                    doc: op
                };
            }
        }
        throw new Error("Category not found!");
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
