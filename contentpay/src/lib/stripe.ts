import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
  typescript: true,
});

export const STRIPE_PLANS = {
  monthly: {
    name: "Monthly Subscription",
    interval: "month" as const,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
  },
  yearly: {
    name: "Yearly Subscription",
    interval: "year" as const,
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
  },
};
