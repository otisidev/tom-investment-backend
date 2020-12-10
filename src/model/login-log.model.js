const { model, Schema } = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const LoginLogSchema = new Schema(
    {
        attempt: {
            type: Number,
            required: true,
        },
        ip: {
            type: String,
            required: true,
            trim: true,
        },
        device: {
            type: String,
            required: true,
            trim: true,
        },
        userAgent: {
            type: String,
            required: true,
            trim: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            trim: true,
        },
        removed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
LoginLogSchema.plugin(paginate);
// public member
exports.LoginLogModel = model("LoginLog", LoginLogSchema);
