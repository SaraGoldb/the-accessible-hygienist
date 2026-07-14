// components/StartTrialButton.tsx
'use client';

export function StartTrialButton() {
  async function handleClick() {
    const res = await fetch('/api/checkout', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url; // hand off to Stripe's hosted page
  }

  return <button onClick={handleClick}>Start 7-day free trial</button>;
}