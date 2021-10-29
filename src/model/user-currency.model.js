const { model, Schema } = require("mongoose");

const UserCurrencySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            unique: true,
            ref: "User"
        },
        currency: {
            type: String,
            default: true
        },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
// include id
UserCurrencySchema.virtual("id").get(function () {
    return this._id;
});
// public member
exports.UserCurrencyModel = model("UserCurrency", UserCurrencySchema);
