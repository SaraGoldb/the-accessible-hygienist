// Server-side Anthropic proxy — keeps ANTHROPIC_API_KEY off the client.
// Called by components/tabs/CarePlanTab.tsx.
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { Patient, Session } from "@/lib/types";

const SECTIONS = ["IDEAL ROUTINE", "ENVIRONMENT SETUP", "AVOID", "CAREGIVER TIPS"];

// No names/dates sent — matches the privacy note shown in CarePlanTab.
function buildPrompt(patient: Patient, sessions: Session[]) {
  const summary = sessions.map((s) => ({
    time: s.time,
    mood: s.mood,
    completion: s.completion,
    triggers: s.triggers,
    helps: s.helps,
    tools: s.tools,
    findings: s.findings,
    complaints: s.complaints,
    discomfort: s.discomfort,
  }));

  return `You are a dental hygienist assistant creating a personalized oral care plan for a caregiver of a dementia patient.

Patient context:
- Dementia stage: ${patient.stage}
- Allergies/sensitivities: ${patient.allergies || "None known"}

Session history (${sessions.length} sessions, oldest to newest):
${JSON.stringify(summary, null, 2)}

Based on these patterns, write a care plan with exactly these four sections, in this order: ${SECTIONS.join(", ")}.

Format each section exactly like this (including the double asterisks):
**SECTION NAME**
• bullet point
• bullet point

Keep each section to 3-5 concise, actionable bullets grounded in the data above. Output nothing besides these four sections.`;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfigured: missing ANTHROPIC_API_KEY" },
      { status: 500 }
    );
  }

  let patient: Patient, sessions: Session[];
  try {
    ({ patient, sessions } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!patient || !sessions || sessions.length < 2) {
    return NextResponse.json(
      { error: "At least 2 sessions are required to generate a plan" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5", // TODO: swap for a different model string if you prefer
        max_tokens: 1000,
        messages: [{ role: "user", content: buildPrompt(patient, sessions) }],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", await response.text());
      return NextResponse.json({ error: "Failed to generate plan" }, { status: 502 });
    }

    const data = await response.json();
    const plan = (data.content ?? [])
      .map((block: { type: string; text?: string }) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    return NextResponse.json({ plan: plan || "Unable to generate plan. Please try again." });
  } catch (err) {
    console.error("generate-plan error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}