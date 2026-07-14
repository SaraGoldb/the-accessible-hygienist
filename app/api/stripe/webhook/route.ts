// Stripe webhook listener. Register this URL in the Stripe Dashboard
// (Developers -> Webhooks) as: https://yourdomain.com/api/stripe/webhook
// TODO: set STRIPE_WEBHOOK_SECRET in .env.local (Stripe gives you this
// when you create the webhook endpoint, or via `stripe listen` locally).
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.metadata?.clerkUserId;
      // TODO: mark this user as subscribed — e.g. update a `subscribed`
      // column on a Supabase table keyed by clerkUserId.
      console.log("Checkout complete for user:", clerkUserId);
      break;
    }
    case "customer.subscription.deleted": {
      // TODO: mark the corresponding user as unsubscribed.
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}