// Stripe webhook listener. Register this URL in the Stripe Dashboard
// (Developers -> Webhooks) as: https://yourdomain.com/api/stripe/webhook
// TODO: set STRIPE_WEBHOOK_SECRET in .env.local (Stripe gives you this
// when you create the webhook endpoint, or via `stripe listen` locally).
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text(); // raw text, not .json() — signature check needs exact raw bytes
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await supabaseAdmin.from('subscriptions').upsert(
        {
          clerk_user_id: session.client_reference_id,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status: 'trialing',
        },
        { onConflict: 'clerk_user_id' }
      );
      break;
    }

    // Fires on trial end, renewal, plan change, cancellation, payment failure, etc.
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;

      // current_period_end lives on the subscription item, not the subscription
      // itself, as of newer Stripe API versions — grab it from the first item
      // since we only ever attach one price per subscription.
      const currentPeriodEnd = sub.items.data[0]?.current_period_end;

      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: sub.status,
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          current_period_end: currentPeriodEnd
            ? new Date(currentPeriodEnd * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}