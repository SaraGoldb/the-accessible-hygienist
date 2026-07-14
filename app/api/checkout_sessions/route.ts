// Creates a Stripe Checkout session.
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  // Reuse an existing Stripe customer if this user already has one, so we
  // don't create duplicates every time someone clicks the button.
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('clerk_user_id', userId)
    .single();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: existing?.stripe_customer_id ?? undefined,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7, // this one line IS the free trial — Stripe handles the rest
    },
    client_reference_id: userId, // lets the webhook link Stripe's customer back to Clerk's user
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}