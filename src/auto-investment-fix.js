const { getResponse } = require("../lib/request");
const { InvestmentService } = require("./service/investment.service");
const { UserService } = require("./service/user.service");

exports.handler = async (event) => {
    // get user and investments
    const items = await InvestmentService.GetInvestmentGroupedByUsers();
    console.log("All", items);
    for (let i = 0; i < items.length; i++) {
        const { user, investments } = items[i];
        console.log("Single", item);
        UserService.UpdateManyInvestment(user, investments);
    }
    return getResponse(200, { status: 200, message: "Completed " + items.length + " Records" });
};
