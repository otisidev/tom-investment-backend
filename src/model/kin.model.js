const { model, Schema } = require("mongoose");

const KinSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        relationship: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            required: true,
            trim: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            trim: true,
            ref: "User",
        },
        removed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
KinSchema.virtual("id").get(function () {
    return this._id;
});
// public member
exports.NextKinModel = model("NextKin", KinSchema);
