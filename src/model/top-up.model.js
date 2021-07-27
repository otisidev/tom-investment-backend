const { model, Schema } = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const TopUpSchema = new Schema(
    {
        approved: {
            type: Boolean,
            default: false
        },
        amount: {
            type: Number,
            required: true,
            trim: true
        },
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
            trim: true
        },
        investment: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Investment",
            trim: true
        },
        removed: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
TopUpSchema.virtual("id").get(function () {
    return this._id;
});

TopUpSchema.plugin(paginate);
// public member
exports.TopUpModel = model("TopUpModel", TopUpSchema);
