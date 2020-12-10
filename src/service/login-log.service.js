const { LoginLogModel } = require("../model/login-log.model");
const { Types } = require("mongoose");

const Model = LoginLogModel;
const { isValid } = Types.ObjectId;

exports.LoginLogService = class LoginLogService {
    /**
     * Creates new Login Log
     * @param {{}} model
     */
    static async LogNew(model) {
        try {
            const { attempt, ip, device, userAgent, user } = model;
            if (isValid(user) && attempt && ip && device && userAgent) {
                const op = await new Model({ ...model }).save();
                if (op) {
                    return {
                        status: 200,
                        message: "Completed!",
                        doc: op,
                    };
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves a list of user's login logs
     * @param {string} user
     * @param {int} page
     * @param {int} limit
     */
    static async ViewUserLoginLog(user, page = 1, limit = 25) {
        if (isValid(user)) {
            const query = { removed: false, user };
            const op = await Model.paginate(query, {
                page,
                limit,
                sort: { created_at: -1 },
            });

            return {
                status: 200,
                message: "Completed!",
                ...op,
            };
        }
        throw new Error("User Login Logs not found!");
    }

    /**
     * Retrieves a single Login Log object
     * @param {string} id
     */
    static async ViewLoginLog(id) {
        if (isValid(id)) {
            const query = { removed: false, _id: id };
            const op = await Model.findOne(query).exec();
            if (op) {
                return {
                    status: 200,
                    message: "Completed!",
                    doc: op,
                };
            }
        }
        throw new Error("Login log not found!");
    }
};
