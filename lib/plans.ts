export interface Plan {
    name: string;
    amount: number;
    currency: string;
    interval: string;
    isPopular: boolean;
    description: string;
    features: string[];
}

export const availablePlans: Plan[] = [
    {
        name: "Weekly Plan",
        amount: 10,
        currency: "GBP",
        interval: "weekly",
        isPopular: false,
        description: "A basic meal plan for individuals.",
        features: [
            "Access to weekly meal plans",
            "Basic nutritional guidance",
            "Email support",
        ],
    },
    {
        name: "Monthly Plan",
        amount: 25,
        currency: "GBP",
        interval: "monthly",
        isPopular: true,
        description: "A meal plan designed for families.",
        features: [
            "Access to family meal plans",
            "Advanced nutritional guidance",
            "Priority email support",
            "Access to family-friendly recipes",
        ],
    },
    {
        name: "Yearly Plan",
        amount: 50,
        currency: "GBP",
        interval: "yearly",
        isPopular: true,
        description: "A premium meal plan with all features.",
        features: [
            "Access to all meal plans",
            "Personalized nutritional guidance",
            "24/7 support",
            "Access to exclusive recipes",
            "Monthly one-on-one consultations",
        ],
    },
];

// Map the plan types to Stripe price IDs
const mapPriceId: Record<string, string> = {
    weekly: process.env.STRIPE_PRICE_WEEKLY || "",
    monthly: process.env.STRIPE_PRICE_MONTHLY || "",
    yearly: process.env.STRIPE_PRICE_YEARLY || "",
};

export const getPriceIDUsingPlanType = (planType: string): string => {
    const priceId = mapPriceId[planType];
    if (!priceId) {
        throw new Error(`No price ID found for plan type: ${planType}`);
    }
    return priceId;
}
