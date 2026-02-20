export const RAZORPAY_PLANS: Record<"starter" | "growth" | "agency", string> = {
    starter: process.env.RAZORPAY_PLAN_STARTER_ID || "plan_starter_placeholder",
    growth: process.env.RAZORPAY_PLAN_GROWTH_ID || "plan_growth_placeholder",
    agency: process.env.RAZORPAY_PLAN_AGENCY_ID || "plan_agency_placeholder",
};
