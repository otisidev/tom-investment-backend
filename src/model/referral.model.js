const { model, Schema } = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const ReferrerSchema = new Schema(
    {
        amount: {
            type: Number,
            required: true,
        },
        paid: {
            type: Boolean,
            default: false,
        },
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            trim: true,
            ref: "User",
        },
        referrer: {
            type: Schema.Types.ObjectId,
            required: true,
            trim: true,
            ref: "User",
        },
        investment: {
            type: Schema.Types.ObjectId,
            required: true,
            trim: true,
            ref: "Investment",
        },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
ReferrerSchema.plugin(paginate);
// include id
ReferrerSchema.virtual("id").get(function () {
    return this._id;
});
// public member
exports.ReferrerModel = model("Referrer", ReferrerSchema);
