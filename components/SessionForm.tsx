// components/SessionForm.tsx
"use client";

import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { SectionHead } from "@/components/ui/SectionHead";
import { MOODS, COMPLETION, TRIGGERS, HELPS, TOOLS, VISUAL_FINDINGS, PATIENT_COMPLAINTS, TIMES, CAREGIVER_TITLES } from "@/lib/constants";
import { COLOR_HEX, withAlpha } from "@/lib/colors";
import { toggle } from "@/lib/utils";
import type { Patient, Session } from "@/lib/types";
import { INPUT_CLASS, LABEL_CLASS } from "@/lib/styles";
import { DiscomfortSlider } from "./ui/DiscomfortSlider";

export type SessionFormData = Omit<Session, "id" | "patientId" | "caregiver">;

const buttonClass = "bg-transparent border-none !text-sm text-sage-muted font-body font-bold cursor-pointer block mt-1.5 px-1";

const colorFor = (key: string) => COLOR_HEX[key] || COLOR_HEX.sage;
const selectedStyle = (hex: string, alpha: string) => ({ borderColor: hex, backgroundColor: withAlpha(hex, alpha), color: hex });

// Section wraps each field group either in its own Card (LogTab style)
// or a plain spaced div (HistoryTab's inline-edit style).
function Section({ useCards, children }: { useCards: boolean; children: React.ReactNode }) {
  return useCards ? (
    <Card className="mb-4">{children}</Card>
  ) : (
    <div className="mt-4">{children}</div>
  );
}

export function SessionForm({
  form,
  setForm,
  patient,
  addingNew,
  setAddingNew,
  useCards = false,
}: {
  form: SessionFormData & { caregiverName: string; caregiverTitle: string };
  setForm: (updater: (f: any) => any) => void;
  patient: Patient;
  addingNew: boolean;
  setAddingNew: (v: boolean) => void;
  useCards?: boolean;
}) {

    // True if any selected finding needs dental follow-up (not just "watch").
  const hasClinicalFlags = form.findings.some(
    (f) => VISUAL_FINDINGS.find((vf) => vf.label === f)?.urgency === "flag"
  );

  const discomfortColor = 
    form.discomfort > 4 ? COLOR_HEX.red 
    : form.discomfort > 3 ? COLOR_HEX.orange 
    : form.discomfort > 1 ? COLOR_HEX.amber 
    : COLOR_HEX.green;

  return (
    <>
      {/* Session info: date, time, caregiver name */}
      <Section useCards={useCards}>
        <SectionHead title="Session Info" />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className={LABEL_CLASS}>Date</label>
            <input 
              type="date" 
              value={form.date}
              onChange={(e) => setForm((f: any) => ({ ...f, date: e.target.value }))}
              className={INPUT_CLASS} 
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Time of Day</label>
            <select value={form.time}
              onChange={(e) => setForm((f: any) => ({ ...f, time: e.target.value }))}
              className={INPUT_CLASS}
            >
              {TIMES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Caregiver: free-text input with dropdown of caregivers 
          & "+ New caregiver" toggle */}
        <label className={LABEL_CLASS}>Caregiver</label>
        {!addingNew ? (
          <>
            <input
              list={`caregivers-${patient.id}`}
              value={form.caregiverName}
              onChange={(e) => setForm((f: any) => ({ ...f, caregiverName: e.target.value }))}
              placeholder="Your name or select from care team"
              className={INPUT_CLASS}
              autoComplete="off"
            />
            <datalist id={`caregivers-${patient.id}`}>
              {(patient.caregivers ?? []).map((name) => (<option key={name} value={name} />))}
            </datalist>
            <button
              type="button"
              onClick={() => {
                setForm((f: any) => ({ ...f, caregiverName: "", caregiverTitle: "" }));
                setAddingNew(true);
              }}
              className={buttonClass}
            >
              + New caregiver
            </button>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  value={form.caregiverName}
                  onChange={(e) => setForm((f: any) => ({ ...f, caregiverName: e.target.value }))}
                  placeholder="Name"
                  className={INPUT_CLASS}
                  autoComplete="off"
                />
              </div>
              <div>
                <input
                  list="caregiver-titles"
                  value={form.caregiverTitle}
                  onChange={(e) => setForm((f: any) => ({ ...f, caregiverTitle: e.target.value }))}
                  placeholder="Relationship to patient"
                  className={INPUT_CLASS}
                  autoComplete="off"
                />
                <datalist id="caregiver-titles">
                  {CAREGIVER_TITLES.map((t) => <option key={t} value={t} />)}
                </datalist>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm((f: any) => ({ ...f, caregiverName: "", caregiverTitle: "" }));
                setAddingNew(false);
              }}
              className={buttonClass}
            >
              ← Select from care team
            </button>
          </>
        )}
      </Section>

      {/* Mood */}
      <Section useCards={useCards}>
        <SectionHead title="Patient Mood at Start" icon="😊" />
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => {
            const hex = colorFor(m.color);
            const selected = form.mood === m.label;
            return (
              <button 
                type="button"
                key={m.label}
                onClick={() => setForm((f: any) => ({ ...f, mood: m.label }))}
                style={selected ? selectedStyle(hex, "22") : undefined}
                className={`px-4 py-2 rounded-full text-sm font-body min-h-11 border-[1.5px] ${selected ? "font-bold" : "border-line text-ink-light"}`}
              >
                {m.emoji} {m.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Completion */}
      <Section useCards={useCards}>
        <SectionHead title="Session Completion" icon="📊" />
        <div className="flex gap-3">
          {COMPLETION.map((c) => {
            const hex = colorFor(c.color);
            const selected = form.completion === c.pct;
            return (
              <button 
                type="button"
                key={c.label}
                onClick={() => setForm((f: any) => ({ ...f, completion: c.pct }))}
                style={selected ? selectedStyle(hex, "18") : undefined}
                className={`flex-1 py-2.5 rounded-xl text-sm font-body text-center min-h-11 border-[1.5px] ${selected ? "font-bold" : "border-line text-ink-light"}`}
              >
                <div className="text-2xl mb-1">
                  {c.icon}
                </div>
                {c.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Tools */}
      <Section useCards={useCards}>
        <SectionHead title="Tools Used" icon="🪥" color="blue" />
        <div className="flex flex-wrap gap-2">
          {TOOLS.map((t) => (
            <Pill 
              key={t} 
              label={t}
              color="blue"
              selected={form.tools.includes(t)}
              onClick={() => setForm((f: any) => ({ ...f, tools: toggle(f.tools, t) }))} 
            />
          ))}
        </div>
      </Section>

      {/* Triggers */}
      <Section useCards={useCards}>
        <SectionHead title="What Caused Difficulty" icon="⚠️" color="red" />
        <div className="flex flex-wrap gap-2">
          {TRIGGERS.map((t) => (
            <Pill 
              key={t} 
              label={t} 
              color="red" 
              selected={form.triggers.includes(t)}
              onClick={() => setForm((f: any) => ({ ...f, triggers: toggle(f.triggers, t) }))} 
            />
          ))}
        </div>
      </Section>

      {/* Helps */}
      <Section useCards={useCards}>
        <SectionHead title="What Made It Better" icon="✨" color="green" />
        <div className="flex flex-wrap gap-2">
          {HELPS.map((h) => (
            <Pill 
              key={h} 
              label={h} 
              color="green" 
              selected={form.helps.includes(h)}
              onClick={() => setForm((f: any) => ({ ...f, helps: toggle(f.helps, h) }))} 
            />
          ))}
        </div>
      </Section>

      {/* Visual findings */}
      <Section useCards={useCards}>
        <SectionHead title="Visual Findings" icon="👁" color="red" />
        {hasClinicalFlags && (
          <div className="bg-red-light border border-red/25 rounded-xl px-3 py-2 mb-2 text-sm text-red font-body">
            ▶ One or more findings require dental professional follow-up.
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {VISUAL_FINDINGS.map((f) => {
            const sel = form.findings.includes(f.label);
            const isFlag = f.urgency === "flag";
            const hex = isFlag ? COLOR_HEX.red : COLOR_HEX.amber;
            return (
              <button 
                type="button"
                key={f.label}
                onClick={() => setForm((fm: any) => ({ ...fm, findings: toggle(fm.findings, f.label) }))}
                style={sel ? selectedStyle(hex, "15") : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body min-h-11 border-[1.5px] ${sel ? "font-bold" : "border-line text-ink-light"}`}
              >
                {f.icon} {f.label}
              </button>
            );
          })}
        </div>
        {form.findings.length > 0 && (
          <div className="mt-3">
            <label className={LABEL_CLASS}>Location / detail</label>
            <input 
              value={form.findingNotes}
              onChange={(e) => setForm((f: any) => ({ ...f, findingNotes: e.target.value }))}
              placeholder="e.g. lower left molar, upper front gum line..."
              className={INPUT_CLASS} 
            />
          </div>
        )}
      </Section>

      {/* Patient complaints */}
      <Section useCards={useCards}>
        <SectionHead title="Patient Complaints / Behavioral Signals" icon="💬" color="mauve" />
        <p className="text-sm text-ink-light font-body mb-3 leading-relaxed">
          Select anything observed — these signals often indicate pain in
          patients who can&apos;t verbalize.
        </p>
        <div className="flex flex-wrap gap-2">
          {PATIENT_COMPLAINTS.map((c) => (
            <Pill 
              key={c} 
              label={c} 
              color="mauve" 
              selected={form.complaints.includes(c)}
              onClick={() => setForm((f: any) => ({ ...f, complaints: toggle(f.complaints, c) }))} 
            />
          ))}
        </div>
      </Section>

      {/* Discomfort */}
      <Section useCards={useCards}>
        <SectionHead title="Discomfort Level Observed" icon="📈" color="amber" />
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-light font-body">None</span>
          <DiscomfortSlider
            value={form.discomfort}
            onChange={(n) => setForm((f: any) => ({ ...f, discomfort: n }))}
            color={discomfortColor}
          />
          <span className="text-sm text-ink-light font-body">Severe</span>
          <span 
            style={{ color: discomfortColor }}
            className="min-w-[30px] text-center font-extrabold text-lg font-display"
          >
            {form.discomfort}
          </span>
        </div>
      </Section>

      {/* Notes */}
      <Section useCards={useCards}>
        <SectionHead title="Caregiver Notes" icon="📝" color="mauve" />
        <textarea 
          value={form.notes}
          onChange={(e) => setForm((f: any) => ({ ...f, notes: e.target.value }))}
          placeholder="What stood out — environment, reactions, anything you tried, what surprised you..."
          rows={3}
          className={`${INPUT_CLASS} resize-y leading-relaxed`} 
        />
      </Section>
    </>
  );
}