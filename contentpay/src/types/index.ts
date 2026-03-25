export type Role = "CREATOR" | "READER";
export type PostStatus = "DRAFT" | "PUBLISHED";
export type PriceType = "FREE" | "ONE_TIME" | "SUBSCRIPTION";
export type PaywallType = "FULL" | "PREVIEW" | "MEMBERSHIP";
export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "EXPIRED";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  role: Role;
  bio?: string | null;
  slug?: string | null;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string | null;
  excerpt?: string | null;
  priceType: PriceType;
  price?: number | null;
  currency: string;
  paywallType: PaywallType;
  previewRatio: number;
  status: PostStatus;
  publishedAt?: Date | null;
  creatorId: string;
  creator?: User;
}

export interface Purchase {
  id: string;
  userId: string;
  postId: string;
  amount: number;
  currency: string;
  stripePaymentId: string;
  paymentStatus: PaymentStatus;
}

export interface Subscription {
  id: string;
  subscriberId: string;
  creatorId: string;
  status: SubscriptionStatus;
  plan: "monthly" | "yearly";
  amount: number;
  stripeSubscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date | null;
}
