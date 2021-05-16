const { Schema, model } = require("mongoose");
const mongoose_pagination = require("mongoose-paginate-v2");

const InvestmentScheme = new Schema(
    {
        investmentMade: {
            type: Number,
            required: true
        },
        currentBalance: {
            type: Number,
            default: 0.0
        },
        removed: {
            type: Boolean,
            default: false
        },
        nextFund: { type: Date, default: null },
        lastFund: { type: Date, default: null },
        date: { type: Date, default: Date.now },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        plan: {
            type: Schema.Types.ObjectId,
            ref: "Plan",
            required: true
        },
        closed: {
            type: Boolean,
            default: false
        },
        approved: { type: Boolean, default: false },
        declined: { type: Boolean, default: false },
        paid: { type: Boolean, default: false },
        compounded: {
            status: {
                type: Boolean,
                default: false
            },
            payoutDate: {
                type: Date
            },
            payout: {
                type: String
            }
        },
        walletAddress: {
            type: String
        },
        daysToPayout: {
            type: Number,
            required: true
        },
        weeklyPayoutInterval: {
            type: Number,
            required: true
        },
        currency: {
            type: Schema.Types.ObjectId,
            default: null,
            ref: "Currency"
        }
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
InvestmentScheme.virtual("id").get(function () {
    return this._id;
});
InvestmentScheme.plugin(mongoose_pagination);
exports.InvestmentModel = model("Investment", InvestmentScheme);
