const { model, Schema } = require("mongoose");

const CategorySchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        desc: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        removed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
CategorySchema.virtual("id").get(function () {
    return this._id;
});
// public member
exports.CategoryFModel = model("Category", CategorySchema);
