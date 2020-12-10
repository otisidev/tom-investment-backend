const { PlanService } = require("../../service/plan.service");

const resolvers = {
    Query: {
        GetPlans: async () => {
            return await PlanService.GetPlans();
        },
    },
    Mutation: {
        NewPlan: async (_, { model }) => {
            return await PlanService.CreatePlan(model);
        },
        DeletePlan: async (_, { id }) => await PlanService.DeletePlan(id),
        UpdatePlan: async (_, { id, update }) => await PlanService.UpdatePlan(id, update),
    },
    Plan: {
        created_at: ({ created_at }) => new Date(created_at).toISOString(),
        can_reinvestment: ({ canReinvestment }) => canReinvestment,
        days_to_payout: ({ daysToPayout }) => daysToPayout,
        weekly_payout_interval: ({ weeklyPayoutInterval }) => weeklyPayoutInterval,
        max_amount: ({ maxAmount }) => maxAmount,
    },
};

exports.resolvers = resolvers;
