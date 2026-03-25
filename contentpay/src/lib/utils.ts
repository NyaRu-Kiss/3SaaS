import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (cents: number, currency: string = "usd") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
};

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const paymentErrors: Record<string, string> = {
  card_declined: "您的银行卡被拒绝，请尝试其他支付方式",
  expired_card: "您的银行卡已过期，请更新卡信息",
  insufficient_funds: "您的账户余额不足",
  processing_error: "支付处理出错，请稍后重试",
};
