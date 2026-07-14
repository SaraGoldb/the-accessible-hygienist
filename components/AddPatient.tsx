"use client";

// Used for both adding a new patient and editing an existing one.
// When `initialData` is passed, the form pre-fills and the title/button
// changes to "Edit Patient" / "Save Changes". The parent (HomePage)
// decides whether to call addPatient or updatePatient based on whether the
// returned patient object already has an id.
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { SectionHead } from "@/components/ui/SectionHead";
import { Pill } from "@/components/ui/Pill";
import Combobox from "@/components/ui/Combobox";
import { CAREGIVER_TITLES, STAGES } from "@/lib/constants";
import { uid, fmtCaregiver, parseCaregiver } from "@/lib/utils";
import type { Patient } from "@/lib/types";
import { INPUT_CLASS, LABEL_CLASS } from "@/lib/styles";

const AVATARS = ["👴", "👵", "🧓", "👨‍🦳", "👩‍🦳", "🧑‍🦳", "🧔‍♂️", "👨", "👩", "🧑", "👨‍🦲", "👩‍🦲"];

// Text fields rendered generically so we don't repeat the label+input pattern.
const FIELDS: [string, string, string][] = [
  ["Full Name", "name", "text"],
  ["Date of Birth", "dob", "date"],
  ["Facility", "facility", "text"],
  ["Room / Unit", "room", "text"],
];

export function AddPatient({
  initialData,
  onSave,
  onCancel,
}: {
  initialData?: Patient; // provided when editing an existing patient
  onSave: (p: Patient, renamed?: { old: string; new: string }[]) => void;
  onCancel: () => void;
}) {
  const isEditing = !!initialData;

  // Pre-fill from initialData when editing, otherwise start blank.
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    dob: initialData?.dob ?? "",
    stage: initialData?.stage ?? "Unknown",
    facility: initialData?.facility ?? "",
    room: initialData?.room ?? "",
    caregivers: initialData?.caregivers?.length
      ? initialData.caregivers.map(parseCaregiver)
      : [{ name: "", title: "" }],
    allergies: initialData?.allergies ?? "None known",
    notes: initialData?.notes ?? "",
    avatar: initialData?.avatar ?? "👴",
  });

  const addCaregiver = () =>
    setForm((f) => ({ ...f, caregivers: [...f.caregivers, { name: "", title: "" }] }));

  const setCg = (i: number, field: "name" | "title", v: string) =>
    setForm((f) => ({
      ...f,
      caregivers: f.caregivers.map((c, j) => (j === i ? { ...c, [field]: v } : c)),
    }));

  const handleSave = () => {
    // Detect renamed/re-titled caregivers by matching old→new at the same index.
    const renamed: { old: string; new: string }[] = [];    
    if (initialData?.caregivers) {
      initialData.caregivers.forEach((old, i) => {
        const c = form.caregivers[i];
        if (!c) return; // caregiver was removed, not renamed
        const updated = fmtCaregiver(c.name, c.title);
        if (updated && updated !== old) renamed.push({ old, new: updated });
      });
    }
    const newCaregivers = form.caregivers
    .filter((c) => c.name.trim())
    .map((c) => (fmtCaregiver(c.name, c.title)));

    onSave({ 
      ...form, 
      // Preserve existing id when editing; generate a new one when adding.
      id: initialData?.id ?? uid(), 
      caregivers: newCaregivers 
    }, renamed);
  };

  const canSave = !!form.name.trim();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onCancel}
          className="bg-transparent border-none cursor-pointer text-2xl p-0 text-ink-light"
        >
          ←
        </button>
        <span className="text-xl font-display font-bold text-ink">
          {isEditing ? "Edit Patient" : "New Patient"}
        </span>
      </div>

      {/* Avatar picker */}
      <Card className="mb-4">
        <SectionHead title="Avatar" />
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setForm((f) => ({ ...f, avatar: a }))}
              className={`aspect-square w-full rounded-full flex items-center justify-center cursor-pointer border-2 transition-colors @container ${
                form.avatar === a
                  ? "border-sage bg-sage-light"
                  : "border-line bg-transparent"
              }`}
            >
              {/* fill 60% of the button's width */}
              <span style={{ fontSize: "60cqw", lineHeight: 1 }}>{a}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Patient info fields */}
      <Card className="mb-4">
        <SectionHead title="Patient Info" />
        {FIELDS.map(([lbl, key, type]) => (
          <div key={key} className="mb-4">
            <label className={LABEL_CLASS}>{lbl}</label>
            <input
              type={type}
              value={(form as Record<string, unknown>)[key] as string}
              onChange={(e) =>
                setForm((f) => ({ ...f, [key]: e.target.value }))
              }
              className={INPUT_CLASS}
            />
          </div>
        ))}
        <div className="mb-2">
          <label className={LABEL_CLASS}>Dementia Stage</label>
          <div className="flex gap-2 flex-wrap">
            {STAGES.map((s) => (
              <Pill
                key={s}
                label={s}
                selected={form.stage === s}
                onClick={() => setForm((f) => ({ ...f, stage: s }))}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Care team */}
      <Card className="mb-4">
        <SectionHead title="Care Team" icon="👥" />
        {form.caregivers.map((c, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label className={LABEL_CLASS}>Name</label>
              <input
                value={c.name}
                onChange={(e) => setCg(i, "name", e.target.value)}
                placeholder={`Caregiver ${i + 1}`}
                className={`${INPUT_CLASS} mb-2`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Relationship to patient</label>
              <Combobox
                value={c.title}
                onChange={(v) => setCg(i, "title", v)}
                options={CAREGIVER_TITLES}
                placeholder="e.g. day aide"
                inputClassName={`${INPUT_CLASS} mb-2`}
              />
            </div>
          </div>
        ))}
        <button
          onClick={addCaregiver}
          className="bg-transparent border-none text-sage cursor-pointer text-sm font-body font-bold p-0"
        >
          + Add another caregiver
        </button>
      </Card>

      {/* Notes and sensitivities */}
      <Card className="mb-6">
        <SectionHead title="Notes & Sensitivities" />
        <div className="mb-4">
          <label className={LABEL_CLASS}>Allergies / Sensitivities</label>
          <input
            value={form.allergies}
            onChange={(e) =>
              setForm((f) => ({ ...f, allergies: e.target.value }))
            }
            className={INPUT_CLASS}
          />
        </div>
        <label className={LABEL_CLASS}>General Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Known preferences, important history, what to know before the first session..."
          rows={3}
          className={`${INPUT_CLASS} resize-y`}
        />
      </Card>

      <button
        onClick={handleSave}
        disabled={!canSave}
        className={`w-full p-4 border-none rounded-xl text-base font-body font-bold ${
          !canSave
            ? "bg-line text-ink-light cursor-not-allowed"
            : "bg-linear-to-br from-sage to-blue text-white cursor-pointer"
        }`}
      >
        {isEditing ? "Save Changes →" : "Save Patient Profile →"}
      </button>
    </div>
  );
}