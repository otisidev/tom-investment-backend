const { model, Schema } = require("mongoose");

const ContactPersonSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        image: {
            type: String,
            required: true,
            trim: true
        },
        position: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Category",
            trim: true
        },
        removed: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
ContactPersonSchema.virtual("id").get(function () {
    return this._id;
});
// public member
exports.ContactPersonModel = model("ContactPerson", ContactPersonSchema);
