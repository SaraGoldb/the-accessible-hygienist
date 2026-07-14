"use client";

// Home screen — grid of patient cards with name, facility, dementia stage,
// care team, avg completion, and last session summary.
import { Card } from "@/components/ui/Card";
import { avgCompletion, fmtDate, fmtFacilityRoom, pluralize } from "@/lib/utils";
import { COLOR_HEX } from "@/lib/colors";
import type { Patient, Session } from "@/lib/types";

export function PatientList({
  patients,
  sessions,
  onSelect,
  onAdd,
}: {
  patients: Patient[];
  sessions: Session[];
  onSelect: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <div className="mb-6">
        <div className="text-2xl font-display text-ink font-bold mb-3">
          My Patients
        </div>
        <div className="text-sm text-ink-light font-body">
          Tap a patient to view their care tracker
        </div>
      </div>

      {/* On desktop, cards flow into a 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {patients.map((p) => {
          // Only this patient's sessions, newest first (sessions are stored newest-first).
          const ptSessions = sessions.filter((s) => s.patientId === p.id);
          const last = ptSessions[0];
          const avgC = avgCompletion(ptSessions);

          return (
            <Card
              key={p.id}
              className="cursor-pointer hover:border-sage transition-colors"
            >
              <div
                onClick={() => onSelect(p.id)}
                className="flex gap-4 items-center m-1"
              >
                {/* Avatar circle */}
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-sage-light to-blue-light flex items-center justify-center text-3xl shrink-0 border-2 border-line-light">
                  {p.avatar}
                </div>

                {/* Patient info */}
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-ink font-display">
                    {p.name}
                  </div>
                  {/*  
                    display facility if there is one
                    display the dot if both facility and room exist
                    display room if there is one
                  */}
                  <div className="text-sm text-ink-light font-body mt-1">
                    {fmtFacilityRoom(p.facility, p.room)}
                  </div>
                  <div className="text-sm text-mauve font-body mt-2">
                    {p.stage}-stage dementia
                  </div>

                  {/* Care team — shown on the home card so the caregiver
                      can see at a glance who else is on the team. */}
                  {p.caregivers?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {p.caregivers.map((cg) => (
                        <span
                          key={cg}
                          className="inline-block text-[11px] font-body bg-sage-light text-sage-dark rounded-full px-2 py-0.5"
                        >
                          {cg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Avg completion badge */}
                <div className="text-center shrink-0">
                  <div className="text-xl font-extrabold text-sage font-display">
                    {ptSessions.length > 0 ? avgC + "%" : "—"}
                  </div>
                  <div className="text-sm text-sage font-body">avg</div>
                  <div className="text-xs text-ink-light font-body mt-1.5">
                    {pluralize(ptSessions.length, "session")}
                  </div>
                </div>
              </div>

              {/* Last session footer */}
              {last && (
                <div className="m-1 mt-5 pt-2 border-t border-line-light flex justify-between text-sm text-ink-light font-body">
                  <span>Last session: {fmtDate(last.date)}</span>
                  <span
                    style={{
                      color:
                        last.completion === 100
                          ? COLOR_HEX.green
                          : last.completion >= 60
                          ? COLOR_HEX.amber
                          : COLOR_HEX.red,
                    }}
                  >
                    {last.completion === 100
                      ? "Full"
                      : last.completion >= 60
                      ? "Partial"
                      : "Minimal"}
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <button
        onClick={onAdd}
        className="w-full p-4 bg-linear-to-br from-sage to-blue text-white border-none rounded-xl text-base font-body font-bold cursor-pointer"
      >
        + Add New Patient
      </button>

      <div className="mt-5 px-4 py-4 bg-parchment rounded-xl text-sm text-ink-light font-body leading-relaxed border border-dashed border-line">
        🔒 <strong>Privacy note:</strong> All data is stored locally on this
        device only. Nothing is shared with any server except a session summary
        sent to generate care plans.
      </div>
    </div>
  );
}