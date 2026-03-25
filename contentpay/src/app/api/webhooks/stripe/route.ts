import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, postId, type } = session.metadata || {};

        if (type === "purchase" && userId && postId) {
          const existingPurchase = await prisma.purchase.findUnique({
            where: {
              userId_postId: { userId, postId },
            },
          });

          if (!existingPurchase) {
            await prisma.purchase.create({
              data: {
                userId,
                postId,
                amount: session.amount_total || 0,
                currency: session.currency || "usd",
                stripePaymentId: session.payment_intent as string,
                paymentStatus: "SUCCEEDED",
              },
            });
          } else if (existingPurchase.paymentStatus !== "SUCCEEDED") {
            await prisma.purchase.update({
              where: { id: existingPurchase.id },
              data: {
                stripePaymentId: session.payment_intent as string,
                paymentStatus: "SUCCEEDED",
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const { creatorId, userId, plan } = subscription.metadata || {};

        if (creatorId && userId) {
          const existingSubscription = await prisma.subscription.findUnique({
            where: {
              subscriberId_creatorId: {
                subscriberId: userId,
                creatorId,
              },
            },
          });

          const subscriptionData = {
            subscriberId: userId,
            creatorId,
            status: subscription.status === "active" ? "ACTIVE" : "CANCELED",
            plan: plan || "monthly",
            amount: subscription.items.data[0]?.price.unit_amount || 0,
            stripeSubscriptionId: subscription.id,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            canceledAt: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000)
              : null,
          };

          if (existingSubscription) {
            await prisma.subscription.update({
              where: { id: existingSubscription.id },
              data: subscriptionData,
            });
          } else {
            await prisma.subscription.create({
              data: subscriptionData,
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const { creatorId, userId } = subscription.metadata || {};

        if (creatorId && userId) {
          await prisma.subscription.updateMany({
            where: {
              subscriberId: userId,
              creatorId,
              stripeSubscriptionId: subscription.id,
            },
            data: { status: "CANCELED" },
          });
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntent = charge.payment_intent as string;

        if (paymentIntent) {
          await prisma.purchase.updateMany({
            where: { stripePaymentId: paymentIntent },
            data: { paymentStatus: "REFUNDED" },
          });
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
