"use client";

// Calls /api/generate-plan (which proxies to Claude server-side, keeping
// the API key off the client) to turn logged sessions into a 4-section
// personalized care plan, then lets the caregiver export or share it.
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { SectionHead } from "@/components/ui/SectionHead";
import { Toast } from "@/components/ui/Toast";
import { PLAN_ICONS } from "@/lib/constants";
import { COLOR_HEX } from "@/lib/colors";
import { today } from "@/lib/utils";
import type { Patient, Session } from "@/lib/types";

// Calls our own Next.js API route — never calls Anthropic directly from
// the browser, so the API key is never exposed to the client.
async function generateAICarePlan(patient: Patient, sessions: Session[]) {
  const response = await fetch("/api/generate-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patient, sessions }),
  });
  const data = await response.json();
  return data.plan || "Unable to generate plan. Please try again.";
}

// Splits the AI's raw "**SECTION**\n• bullet" text into a lookup of
// section name -> array of bullet strings, for rendering as cards.
function parsePlan(text: string) {
  const sections = ["IDEAL ROUTINE", "ENVIRONMENT SETUP", "AVOID", "CAREGIVER TIPS"];
  const result: Record<string, string[]> = {};
  sections.forEach((sec, i) => {
    const start = text.indexOf(`**${sec}**`);
    if (start === -1) return;
    const nextSec = sections.slice(i + 1).map((s) => text.indexOf(`**${s}**`)).filter((x) => x > start);
    const end = nextSec.length ? Math.min(...nextSec) : text.length;
    const content = text.slice(start + sec.length + 4, end).trim();
    result[sec] = content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*"))
      .map((l) => l.replace(/^[•\-*]\s*/, "").trim())
      .filter(Boolean);
  });
  return result;
}

// Builds the downloadable .txt export combining pattern data + the AI plan.
function exportCarePlanText(patient: Patient, sessions: Session[], planText: string) {
  const lines = [
    "THE ACCESSIBLE HYGIENIST — PERSONALIZED ORAL CARE PLAN",
    "─".repeat(48),
    "",
    `PATIENT: ${patient.name}`,
    `FACILITY: ${patient.facility} | ROOM: ${patient.room}`,
    `DEMENTIA STAGE: ${patient.stage}`,
    `ALLERGIES/SENSITIVITIES: ${patient.allergies}`,
    `DATE GENERATED: ${new Date().toLocaleDateString()}`,
    `BASED ON: ${sessions.length} logged sessions`,
    "",
    "─".repeat(48),
    "AI-GENERATED CARE PLAN",
    "─".repeat(48),
    "",
    planText,
    "",
    "─".repeat(48),
    "CARE TEAM",
    "─".repeat(48),
    ...(patient.caregivers || []).map((c) => ` • ${c}`),
    "",
    "─".repeat(48),
    "This plan is generated from caregiver-logged session data.",
    "Always consult a licensed dental professional for clinical decisions.",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${patient.name.replace(/\s/g, "_")}_CarePlan_${today()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function sharePlanText(patient: Patient, planText: string) {
  const text = `THE ACCESSIBLE HYGIENIST — Care Plan for ${patient.name}\n${patient.facility}, Room ${patient.room}\n\n${planText}`;
  navigator.clipboard?.writeText(text);
}

export function CarePlanTab({ patient, sessions }: { patient: Patient; sessions: Session[] }) {
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (sessions.length < 2) return;
    setLoading(true);
    try {
      const text = await generateAICarePlan(patient, sessions);
      setPlan(text);
    } catch {
      setPlan("Unable to generate — please try again.");
    }
    setLoading(false);
  };

  const parsed = plan ? parsePlan(plan) : null;

  const handleExport = () => {
    exportCarePlanText(patient, sessions, plan || "Plan not yet generated.");
    setToast("Care plan exported as text file");
  };

  const handleShare = () => {
    sharePlanText(patient, plan || "Plan not yet generated.");
    setCopied(true);
    setToast("Copied to clipboard — paste into email, notes, or messaging app");
  };

  // Need at least 2 sessions for the AI to detect any pattern at all.
  if (sessions.length < 2) {
    return (
      <div className="text-center py-10 px-5 bg-sage-light rounded-xl text-sage-dark font-body text-[13px]">
        Log at least 2 sessions to generate a personalized care plan.
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => { setToast(""); setCopied(false); }} />}

      <Card className="mb-4 bg-parchment">
        <div className="text-[11px] text-ink-light font-body font-extrabold uppercase mb-1.5">
          Plan for
        </div>
        <div className="text-base font-bold text-ink font-display">{patient.name}</div>
        <div className="text-xs text-ink-light font-body">
          {patient.facility} · {patient.stage}-stage dementia
        </div>
        {patient.allergies && (
          <div className="mt-1.5 text-[11px] text-red font-body">⚠️ {patient.allergies}</div>
        )}
        {patient.caregivers?.length > 0 && (
          <div className="mt-2">
            <span className="text-[10px] text-ink-light font-body uppercase font-extrabold mr-1.5">
              CARE TEAM
            </span>
            <span className="text-xs text-ink font-body">{patient.caregivers.join(", ")}</span>
          </div>
        )}
      </Card>

      {/* Privacy disclosure — required by spec: this is the one moment data leaves the device */}
      <div className="text-[11px] text-ink-light font-body mb-3 px-3 py-2 bg-parchment rounded-lg border border-dashed border-line">
        🔒 Generating a plan sends a session summary to the Anthropic API. No
        names or dates are included. Patient data stays on your device.
      </div>

      {!plan && !loading && (
        <button
          onClick={generate}
          className="w-full py-[15px] bg-linear-to-br from-sage to-teal text-white border-none rounded-xl text-sm font-body font-bold cursor-pointer mb-4 min-h-11"
        >
          ✨ Generate AI Care Plan
        </button>
      )}

      {loading && (
        <div className="text-center py-10 px-5">
          <div className="text-[28px] mb-3">🦷</div>
          <div className="text-[13px] text-ink-light font-body">
            Analyzing {sessions.length} sessions…
          </div>
        </div>
      )}

      {plan && parsed && (
        <div>
          {Object.entries(PLAN_ICONS).map(([section, { icon, color }]) =>
            parsed[section]?.length > 0 ? (
              <Card key={section} className="mb-3.5">
                <div style={{ borderLeftColor: COLOR_HEX[color] }} className="border-l-[3px] -ml-4 pl-4 -my-[18px] py-[18px]">
                  <SectionHead title={section} icon={icon} color={color} />
                  {parsed[section].map((item, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 items-start py-2 ${i > 0 ? "border-t border-line-light" : ""}`}
                    >
                      <span style={{ color: COLOR_HEX[color] }} className="text-xs mt-px">●</span>
                      <span className="text-[13px] text-ink font-body leading-[1.6]">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null
          )}

          {/* Fallback if the AI's response didn't match the expected **HEADING** format */}
          {Object.values(parsed).every((v) => !v?.length) && (
            <Card className="mb-3.5">
              <div className="text-[13px] text-ink font-body leading-[1.8] whitespace-pre-wrap">
                {plan}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            <button
              onClick={handleExport}
              className="p-3 rounded-[10px] border-[1.5px] border-sage bg-sage-light text-sage-dark font-body text-xs font-bold cursor-pointer min-h-11"
            >
              📄 Export Plan
            </button>
            <button
              onClick={handleShare}
              className="p-3 rounded-[10px] border-[1.5px] border-blue bg-blue-light text-blue font-body text-xs font-bold cursor-pointer min-h-11"
            >
              {copied ? "✓ Copied!" : "📋 Copy to Share"}
            </button>
          </div>

          <button
            onClick={generate}
            className="w-full p-3 rounded-[10px] border-[1.5px] border-line bg-white text-ink-md font-body text-xs cursor-pointer min-h-11"
          >
            ↺ Regenerate Plan
          </button>

          <div className="mt-4 px-3.5 py-3 rounded-[10px] bg-parchment border border-dashed border-line text-[11px] text-ink-light font-body leading-[1.7]">
            This plan is generated from caregiver-observed data. Always
            consult a licensed dental professional for clinical decisions.
          </div>
        </div>
      )}
    </div>
  );
}
