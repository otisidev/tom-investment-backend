const { model, Schema } = require("mongoose");

const CurrencySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        removed: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
CurrencySchema.virtual("id").get(function () {
    return this._id;
});
// public member
exports.CurrencyModel = model("Currency", CurrencySchema);
