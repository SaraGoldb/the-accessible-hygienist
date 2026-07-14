"use client";

// The form caregivers fill out after each oral care session.
// Required fields: caregiver name, mood, completion level, and at least
// one tool used. On successful save, the parent (PatientDashboard) routes
// to the History tab so the logged session is immediately visible.
import { useState } from "react";
import { SessionForm } from "@/components/SessionForm";
import { uid, today, fmtCaregiver } from "@/lib/utils";
import type { Patient, Session } from "@/lib/types";

// -1 means "not yet chosen" — distinguishes from a real 0% completion.
const EMPTY_FORM = {
  date: today(),
  time: "Morning",
  mood: "",
  completion: -1,
  triggers: [] as string[],
  helps: [] as string[],
  tools: [] as string[],
  findings: [] as string[],
  complaints: [] as string[],
  findingNotes: "",
  discomfort: 0,
  notes: "",
  caregiverName: "",
  caregiverTitle: "",
};

export function LogTab({
  patient,
  onAddCaregiverToTeam,
  onSave,
}: {
  patient: Patient;
  onAddCaregiverToTeam: (patientId: string, caregiver: string) => Promise<void>;
  // onSave is called after validation; PatientDashboard redirects to History.
  onSave: (s: Session) => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, date: today() });
  const [addingNew, setAddingNew] = useState(false);

  // All four fields must be filled before the Save button is enabled.
  const canSubmit =
    !!form.caregiverName.trim() &&
    !!form.mood &&
    form.completion !== -1 &&
    form.tools.length > 0;

  const submit = async () => {
    if (!canSubmit) return;
    // Combine caregiver name + title into a single string for storage.
    const caregiver = fmtCaregiver(form.caregiverName, form.caregiverTitle);

    // If this is a new caregiver, add them to the patient's care team.
    if (addingNew) { onAddCaregiverToTeam(patient.id, caregiver); }

    // Strip caregiverName/caregiverTitle from form — Session/the DB only knows about
    // the single composed `caregiver` string, not the two form-only fields.
    const { caregiverName, caregiverTitle, ...rest } = form;
    await onSave({ ...rest, caregiver, id: uid(), patientId: patient.id } as Session);
    setForm({ ...EMPTY_FORM, date: today() })
    // setAddingNew(false); // reset back to "select from team" mode for next entry
    // Redirect to History is handled by PatientDashboard's onSave wrapper.
  };

  return (
    <div>
      <SessionForm
        form={form}
        setForm={setForm}
        patient={patient}
        addingNew={addingNew}
        setAddingNew={setAddingNew}
        useCards
      />

      {/* Missing-field hint — only shows once the user has started filling
          in the form, so it doesn't look like an error on a fresh load. */}
      {!canSubmit &&
        (form.mood || form.completion !== -1 || form.caregiverName || form.tools.length > 0) && (
          <div className="text-sm text-ink-light font-body text-center mb-3">
            {!form.caregiverName.trim() && "Caregiver name required  · "}
            {!form.mood && " Mood required  · "}
            {form.completion === -1 && " Completion required · "}
            {form.tools.length === 0 && " Tool required"}
          </div>
        )}

      <button
        onClick={submit}
        disabled={!canSubmit}
        className={`w-full py-4 border-none rounded-xl text-base font-body font-bold min-h-11 ${
          !canSubmit
            ? "bg-line text-ink-light cursor-not-allowed"
            : "bg-linear-to-br from-sage to-blue text-white cursor-pointer"
        }`}
      >
        Save Session →
      </button>
    </div>
  );
}