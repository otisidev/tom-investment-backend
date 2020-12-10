const { model, Schema } = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const InvestmentLogSchema = new Schema(
    {
        investment: {
            type: Schema.Types.ObjectId,
            required: true,
            trim: true,
            ref: "Investment",
        },
        amount: {
            type: Number,
            required: true,
        },
        reason: { type: String, required: true },
        date: { type: Date, default: Date.now },
        removed: {
            type: Boolean,
            required: false,
        },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
InvestmentLogSchema.plugin(paginate);
InvestmentLogSchema.virtual("id").get(function () {
    return this._id;
});
// public member
exports.InvestmentLogModel = model("InvestmentLog", InvestmentLogSchema);
