const { getResponse } = require("../lib/request");
const { UserService } = require("./service/user.service");
const { ReferrerService } = require("./service/referrer.service");
const { InvestmentService } = require("./service/investment.service");
const { calculatePayout } = require("../lib/percent");
const { helpers } = require("./service/root.service");

exports.handler = async (event) => {
    // get user investment
    const users = await UserService.GetUsersWithIncompleteReferral();
    const _items = Array.from(users);

    _items.forEach(async (item) => {
        // update user's referral list
        await UserService.AddManyReferral(item.referrer, item.users);
        // get build referral payment
        const users = Array.from(item.users);
        users.forEach(async (_user) => {
            // check if user and referrer has pending referral payment
            const exits = await ReferrerService.AlreadyLogged(_user, item.referrer);
            if (!exits) {
                //  get first investment of user
                const investment = await InvestmentService.GetFirstInvestment(_user);
                if (investment) {
                    // get payable amount
                    const amount = calculatePayout(investment.investmentMade, helpers.app.referral_bonus);
                    // create a new referral bonus payout
                    await ReferrerService.Create({
                        amount,
                        referrer: item.referrer,
                        user: _user,
                        investment: investment.id,
                    });
                }
            }
        });
    });

    return getResponse(200, { status: 200, message: "completed" });
};
