# The Accessible Hygienist

The Accessible Hygienist Care Tracker is a clinical session-logging app designed for caregivers of patients with dementia. It enables caregivers to record oral hygiene sessions, track behavioral triggers and what helps, log visual clinical findings, and generate a personalized AI-powered care plan — all tied to individual patient profiles.

## Status

This zip contains a fully working **V1** (localStorage-based, no login)
rebuilt with Tailwind CSS, plus the **dependencies installed** for the V2
stack (Clerk, Supabase, Stripe) — but those three are not wired up yet.
That's the next step.

## Setup

```bash
pnpm install
cp .env.local.example .env.local
# edit .env.local and add your real ANTHROPIC_API_KEY at minimum
pnpm dev
```

Open http://localhost:3000 — the app works fully (add patients, log
sessions, see insights, generate AI care plans) using only the
Anthropic key. Clerk/Supabase/Stripe keys are only needed once those
features are built.

## Folder structure

```
app/
  layout.tsx            Fonts (next/font/google) + global styles
  page.tsx               Renders the app
  globals.css             Tailwind v4 theme (@theme block — all colors/fonts)
  api/generate-plan/route.ts   Server-side Anthropic proxy (API key never reaches browser)

components/
  HomePage.tsx   Root client component — owns all state
  PatientList.tsx
  AddPatient.tsx
  PatientDashboard.tsx          Tab shell (Log/Insights/Care Plan/History)
  tabs/
    LogTab.tsx
    InsightsTab.tsx
    CarePlanTab.tsx
    HistoryTab.tsx
  ui/
    Pill.tsx, Card.tsx, SectionHead.tsx, StatTile.tsx, InsightRow.tsx, Toast.tsx

lib/
  types.ts        Patient / Session TypeScript interfaces
  constants.ts     Triggers, helps, tools, moods, etc. (clinical reference data)
  utils.ts          uid(), fmtDate(), countField(), topN(), toggle()
  colors.ts         Hex lookup for the handful of runtime-dynamic colors
                     (Tailwind can't generate classes from a JS variable,
                     so mood/urgency colors use this instead)
  storage.ts        localStorage load/save (V1 — replace with Supabase for V2)
  seed.ts            Sample patient + sessions shown on first load
```

## Next steps toward V2

1. Add Clerk auth (`middleware.ts`, wrap layout in `<ClerkProvider>`, add
   `app/sign-in/[[...sign-in]]/page.tsx`)
2. Replace `lib/storage.ts` with Supabase reads/writes — `lib/supabase/client.ts`
   and `lib/supabase/server.ts`
3. Add Stripe checkout (`app/api/checkout/route.ts`) and webhook listener
   (`app/api/stripe/webhook/route.ts`)
