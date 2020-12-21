const { model, Schema } = require("mongoose");

const PlanSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        percent: {
            type: Number,
            required: true,
        },
        maxAmount: {
            type: Number,
            required: true,
            default: 0,
        },
        removed: {
            type: Boolean,
            default: false,
        },
        canReinvestment: {
            type: Boolean,
            default: false,
        },
       
        category: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Category",
            trim: true,
        },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
PlanSchema.virtual("id").get(function () {
    return this._id;
});
// public member
exports.PlanModel = model("Plan", PlanSchema);
