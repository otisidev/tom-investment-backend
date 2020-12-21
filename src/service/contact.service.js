const { ContactPersonModel } = require("../model/contact.model");
const { Types } = require("mongoose");
const { BatchDataLoader } = require("../../lib/batch-entity");

const Model = ContactPersonModel;
const { isValid } = Types.ObjectId;

exports.ContactPersonService = class ContactPersonService {
    /**
     *
     * @param {any} model Contact person object
     */
    static async NewContactPerson(model) {
        try {
            if (model && isValid(model.category)) {
                const cb = await new Model(model).save();
                if (cb)
                    return {
                        status: 200,
                        message: "New Contact person added successfully!",
                        doc: cb
                    };
            }
            throw new Error("Bad data! Contact person contains an invalid property.");
        } catch (error) {
            if (error.message.startsWith("E11000 duplicate key error collection:"))
                throw new Error("Bad data! Contact person already exists.");
            throw error;
        }
    }

    /**
     * Get a single contact person object
     * @param {string} id contact person object id
     */
    static async GetContactPerson(id) {
        if (isValid(id)) {
            const query = { removed: false, _id: id };
            const cb = await Model.findOne(query).exec();
            if (cb)
                return {
                    status: 200,
                    message: "Contact person found!",
                    doc: cb
                };
        }
        throw new Error("Contact person not found!");
    }

    static async GetContactPersons(category) {
        if (isValid(category)) {
            const q = { removed: false, category };
            const cb = await Model.find(q).sort({ name: 1 }).exec();
            if (cb)
                return {
                    status: 200,
                    message: "Contact person found!",
                    docs: cb
                };
        }
        throw new Error("Contact person not found!");
    }

    static async GetContactPersonsGroupByCategory() {
        const pipeline = [
            { $match: { removed: false } },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: 1 },
                    contacts: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    category: "$_id",
                    total: 1,
                    contacts: 1,
                    _id: 0
                }
            }
        ];

        const result = await Model.aggregate(pipeline).exec();
        return {
            status: 200,
            message: "Completed",
            docs: result
        };
    }

    static async RemoveContactPerson(id) {
        const contact = await this.GetContactPerson(id);
        const q = { removed: false, _id: id };
        const update = {
            $set: {
                removed: true,
                name: `${contact.doc.name} - Deleted - ${new Date().toISOString()}`,
                email: `${contact.doc.email} - Deleted - ${new Date().toISOString()}`,
                phone: `${contact.doc.phone} - Deleted - ${new Date().toISOString()}`
            }
        };
        const cb = await Model.findOneAndUpdate(q, update).exec();
        if (cb)
            return {
                status: 200,
                message: "Contact person removed successfully!",
                doc: { id, status: "Removed" }
            };

        throw new Error("Failed! Contact person not found.");
    }

    static async GetMany(ids) {
        const q = { _id: { $in: ids } };
        const result = await Model.find(q).exec();
        return BatchDataLoader(ids, result);
    }

    static async UpdateContact(id, model) {
        try {
            if (isValid(id) && model) {
                const q = { removed: false, _id: id };
                const _update = {
                    $set: {
                        name: model.name,
                        email: model.email,
                        phone: model.phone,
                        position: model.position,
                        image: model.image
                    }
                };
                const cb = await Model.findOneAndUpdate(q, _update, {
                    new: true
                }).exec();
                if (cb)
                    return {
                        status: 200,
                        message: "Contact person updated successfully!",
                        doc: cb
                    };
            }
            throw new Error("Failed! Contact person not found.");
        } catch (error) {
           if (error.message.startsWith("E11000 duplicate key error collection:"))
               throw new Error("Bad data! Contact person already exists.");
           throw error; 
        }
    }
};
