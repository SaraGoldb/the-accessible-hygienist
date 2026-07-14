"use client";

// Scrollable audit trail of every past session, newest first.
// Each card supports three modes:
//   • Summary (default) — compact read-only view with ✏️ and 🗑️ buttons
//   • Edit mode — full inline form pre-filled with session data; on save
//     the card scrolls itself back into view
//   • Delete confirm — inline prompt before removal
import { useState} from "react";
import { Card } from "@/components/ui/Card";
import { SessionForm } from "@/components/SessionForm";
import {
  MOODS,
  COMPLETION
} from "@/lib/constants";
import { COLOR_HEX } from "@/lib/colors";
import { fmtDate, fmtCaregiver, parseCaregiver } from "@/lib/utils";
import type { Patient, Session } from "@/lib/types";

const cancelBtnClass = "flex-1 py-3 rounded-xl border-[1.5px] border-line bg-white text-ink-light font-body text-sm cursor-pointer min-h-11";

// ── Inline edit form ──────────────────────────────────────────────────────────
// Renders inside the history card; mirrors LogTab's field set so edits feel
// consistent with the original log experience.
function EditForm({
  patient,
  session,
  onSave,
  onCancel,
}: {
  patient: Patient;
  session: Session;
  onSave: (s: Session) => void;
  onCancel: () => void;
}) {
  // For editing purposes, we need to parse the existing caregivers back into name/title fields.
  const parsed = parseCaregiver(session.caregiver ?? "");

  const [form, setForm] = useState({
    ...session,
    caregiverName: parsed.name,
    caregiverTitle: parsed.title,
  });
  const [addingNew, setAddingNew] = useState(false);

  const canSave = !!form.caregiverName.trim() && !!form.mood && form.tools.length > 0;
  const handleSave = () => {
    const caregiver = fmtCaregiver(form.caregiverName, form.caregiverTitle);
    const { caregiverName, caregiverTitle, ...rest } = form; // Strip caregiverName/caregiverTitle from form
    onSave({ ...rest, caregiver } as Session);
  };

  return (
    <div className="mt-4 pt-4 border-t border-line-light space-y-4">
      <SessionForm
        form={form}
        setForm={setForm}
        patient={patient}
        addingNew={addingNew}
        setAddingNew={setAddingNew}
      />

      {/* Save / Cancel */}
      <div className="flex gap-3 pt-1">
        <button onClick={onCancel}
          className={cancelBtnClass}>
          Cancel
        </button>
        <button onClick={(handleSave)}
          disabled={!canSave}
          className={`flex-1 py-3 rounded-xl text-sm font-body font-bold min-h-11 border-none ${
            !canSave
              ? "bg-line text-ink-light cursor-not-allowed"
              : "bg-linear-to-br from-sage to-blue text-white cursor-pointer"
          }`}>
          Save Changes →
        </button>
      </div>
    </div>
  );
}

// ── Inline delete confirmation ─────────────────────────────────────────────────
function DeleteConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-4 pt-4 border-t border-line-light">
      <p className="text-sm text-ink font-body mb-4">
        Delete this session? This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className={cancelBtnClass}>
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-red text-white font-body text-sm font-bold border-none cursor-pointer min-h-11">
          Delete Session
        </button>
      </div>
    </div>
  );
}

// ── Main HistoryTab ────────────────────────────────────────────────────────────
export function HistoryTab({
  patient,
  sessions,
  onUpdate,
  onDelete,
}: {
  patient: Patient;
  sessions: Session[];
  onUpdate: (s: Session) => void;
  onDelete: (id: string) => void;
}) {
  // Only one card can be in edit or delete-confirm mode at a time.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savedScroll, setSavedScroll] = useState(0); // was: computed on every render

  const handleSave = (updated: Session) => {
    onUpdate(updated);
    setEditingId(null);
    window.scrollTo({top: savedScroll}); // restore scroll position
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeletingId(null);
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 px-5 text-ink-light font-body text-sm">
        No sessions logged yet.
      </div>
    );
  }

  return (
    <div>
      {sessions.map((s) => {
        const mood = MOODS.find((m) => m.label === s.mood);
        const comp = COMPLETION.find((c) => c.pct === s.completion);
        const isEditing = editingId === s.id;
        const isDeleting = deletingId === s.id;

        return (
          <Card key={s.id} className="mb-3 overflow-hidden">
            <div className="relative">
              {/* ── Summary header ── */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-base font-bold text-ink font-display">
                    {fmtDate(s.date)}
                  </span>
                  <span className="text-sm text-ink-light font-body ml-2">
                    {s.time}
                  </span>
                  {s.caregiver && (
                    <div className="text-sm text-mauve font-body mt-0.5">
                      {s.caregiver}
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 items-center">
                  {mood && <span className="text-lg">{mood.emoji}</span>}
                  {comp && (
                    <span
                      style={{ color: COLOR_HEX[comp.color] }}
                      className="text-sm font-bold font-body"
                    >
                      {comp.label}
                    </span>
                  )}
                  {s.discomfort > 0 && (
                    <span
                      className={`text-sm font-body ${s.discomfort > 3 ? "text-red" : "text-amber"}`}
                    >
                      😣{s.discomfort}
                    </span>
                  )}

                  {/* Edit / delete icons — hidden while a mode is already active */}
                  {!isEditing && !isDeleting && (
                    <>
                      <button
                        onClick={() => { setSavedScroll(window.scrollY); setEditingId(s.id); setDeletingId(null); }}
                        className="ml-1 p-1.5 rounded-lg border-none bg-transparent text-ink-light hover:text-sage hover:bg-sage-light transition-colors cursor-pointer"
                        title="Edit session"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => { setSavedScroll(window.scrollY); setDeletingId(s.id); setEditingId(null); }}
                        className="p-1.5 rounded-lg border-none bg-transparent text-ink-light hover:text-red hover:bg-red-light transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ── Read-only summary data ── */}
              {!isEditing && !isDeleting && (
                <>
                  {s.triggers.length > 0 && (
                    <div className="mb-1.5">
                      <span className="text-xs text-red font-body font-extrabold">TRIGGERS </span>
                      <span className="text-sm text-ink-light font-body">{s.triggers.join(", ")}</span>
                    </div>
                  )}
                  {s.helps.length > 0 && (
                    <div className="mb-1.5">
                      <span className="text-xs text-green font-body font-extrabold">HELPED </span>
                      <span className="text-sm text-ink-light font-body">{s.helps.join(", ")}</span>
                    </div>
                  )}
                  {s.tools.length > 0 && (
                    <div className="mb-1.5">
                      <span className="text-xs text-blue font-body font-extrabold">TOOLS </span>
                      <span className="text-sm text-ink-light font-body">{s.tools.join(", ")}</span>
                    </div>
                  )}
                  {s.findings?.length > 0 && (
                    <div className="mt-2 px-3 py-2.5 bg-red-light rounded-xl">
                      <span className="text-xs text-red font-body font-extrabold">FINDINGS </span>
                      <span className="text-sm text-ink-md font-body">{s.findings.join(", ")}</span>
                      {s.findingNotes && (
                        <div className="text-sm text-ink-light font-body mt-1">{s.findingNotes}</div>
                      )}
                    </div>
                  )}
                  {s.complaints?.length > 0 && (
                    <div className="mt-2 px-3 py-2.5 bg-mauve-light rounded-xl">
                      <span className="text-xs text-mauve font-body font-extrabold">SIGNALS </span>
                      <span className="text-sm text-ink-md font-body">{s.complaints.join(", ")}</span>
                    </div>
                  )}
                  {s.notes && (
                    <div className="mt-2 px-3 py-2.5 bg-parchment rounded-xl text-sm font-body text-ink-md italic">
                      &ldquo;{s.notes}&rdquo;
                    </div>
                  )}
                </>
              )}

              {/* ── Inline edit form ── */}
              <div
                className={`transition-opacity duration-150 ${
                  isEditing
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none absolute inset-0"
                }`}
              >
                {isEditing && (
                  <EditForm
                    patient={patient}
                    session={s}
                    onSave={handleSave}
                    onCancel={() => {
                      setEditingId(null);
                      window.scrollTo({top: savedScroll});
                    }}
                  />
                )}
              </div>

              {/* ── Inline delete confirmation ── */}
              {isDeleting && (
                <DeleteConfirm
                  onConfirm={() => handleDelete(s.id)}
                  onCancel={() => setDeletingId(null)}
                />
              )}
            </div> {/* relative */}
          </Card>
        );
      })}
    </div>
  );
}