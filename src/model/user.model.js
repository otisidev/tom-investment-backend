const { model, Schema } = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const UserSchema = new Schema(
    {
        firstname: { type: String, trim: true, required: true },
        lastname: { type: String, trim: true, required: true },
        email: { type: String, trim: false, required: true, unique: true },
        phone: { type: String, trim: true, required: true },
        verified: { type: Boolean, default: false },
        passwordHash: { type: String, trim: true, required: true },
        walletAddress: {
            type: String,
            trim: true,
            required: true
        },
        address: { type: String, trim: true },
        gender: { type: String, trim: true, required: true },
        nationality: { type: String, trim: true, required: true },
        dob: { type: Date, required: true },
        removed: { type: Boolean, default: false },
        investments: [
            {
                type: Schema.Types.ObjectId,
                trim: true,
                default: [],
                ref: "Investment"
            }
        ],
        referredUsers: [
            {
                type: Schema.Types.ObjectId,
                trim: true,
                default: [],
                ref: "User"
            }
        ],
        referrer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        nextOfKin: {
            type: Schema.Types.ObjectId,
            ref: "NextKin",
            default: null
        },
        admin: {
            type: Boolean,
            default: false
        },
        resetCode: {
            type: String,
            trim: true,
            default: null
        },
        referralCode: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        image: {
            type: String,
            trim: true,
            default: null
        },
        useTwoF: {
            type: Boolean,
            default: false
        },
        accountType: {
            type: String,
            default: "Weekly Payout"
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toJSON: {
            virtual: true
        }
    }
);
UserSchema.virtual("id").get(function () {
    return this._id;
});
UserSchema.virtual("name").get(function () {
    return this.firstname + " " + this.lastname;
});
// Add single pagination
UserSchema.plugin(paginate);

// create index on firstname and lastname
UserSchema.index({ firstname: "text", lastname: "text", referralCode: "text" });
exports.UserModel = model("User", UserSchema);
