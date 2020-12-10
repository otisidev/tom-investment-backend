const { UserService } = require("./user.service");
const { InvestmentService } = require("./investment.service");
const { PlanService } = require("./plan.service");
const DataLoader = require("dataloader");
const { isWalletValid } = require("../../lib/wallet");
const { NextOfKinService } = require("./kin.service");

module.exports = {
    loaders: {
        userLoader: new DataLoader(async (ids) => await UserService.GetMany(ids)),
        planLoader: new DataLoader(async (ids) => await PlanService.GetMany(ids)),
        investmentLoader: new DataLoader(async (ids) => await InvestmentService.GetMany(ids)),
        kinLoader: new DataLoader(async (ids) => await NextOfKinService.GetMany(ids)),
    },
    helpers: {
        app: {
            referral_bonus: 8,
        },
        isWalletValid: isWalletValid
    },
};
