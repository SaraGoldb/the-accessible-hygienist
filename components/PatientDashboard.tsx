"use client";

// Patient detail screen — sticky header, 4-tab bar, and the content area
// for whichever tab is active. Also owns the edit/delete patient flow.
import { useEffect, useState } from "react";
import { LogTab } from "@/components/tabs/LogTab";
import { InsightsTab } from "@/components/tabs/InsightsTab";
import { CarePlanTab } from "@/components/tabs/CarePlanTab";
import { HistoryTab } from "@/components/tabs/HistoryTab";
import { Toast } from "@/components/ui/Toast";
import type { Patient, Session } from "@/lib/types";
import { avgCompletion, fmtFacilityRoom } from "@/lib/utils";

const TABS = ["Log", "Insights", "Care Plan", "History"];
// History tab index — used when redirecting after a session save.
const HISTORY_TAB = 3;

export function PatientDashboard({
  patient,
  sessions,
  onAddCaregiverToTeam,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
  onEditPatient,
  onDeletePatient,
  onBack,
}: {
  patient: Patient;
  sessions: Session[];
  onAddCaregiverToTeam: (patientId: string, caregiver: string) => Promise<void>;
  onAddSession: (s: Session) => Promise<void>;
  onUpdateSession: (s: Session) => void;
  onDeleteSession: (id: string) => void;
  onEditPatient: (id: string) => void;   // navigates to edit form
  onDeletePatient: (id: string) => void; // removes patient + sessions, goes home
  onBack: () => void;
}) {
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState(0);
  // Reset scroll to top whenever the active tab changes.
  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, [tab]);
  
  // Whether the "delete patient?" confirmation is visible in the header.
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Only this patient's sessions
  const ptSessions = sessions.filter((s) => s.patientId === patient.id)

  const avgComp = avgCompletion(ptSessions);

  return (
    <div>
      {/* ── Toast message used by LogTab ── */}
      {toast && <Toast msg={`✓ ${toast}`} onDone={() => setToast("")} />}

      {/* ── Sticky header ── */}
      <div className="bg-white border-b border-line sticky top-0 z-10">
        <div className="px-5 md:px-8 pt-4 pb-4 flex items-center gap-3 max-w-5xl mx-auto">

          <button
            onClick={onBack}
            className="bg-transparent border-none cursor-pointer text-2xl p-0 text-ink-light"
          >
            ←
          </button>

          <div className="text-4xl">{patient.avatar}</div>

          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold text-ink font-display">
              {patient.name}
            </div>
            <div className="text-sm text-ink-light font-body pt-1">
              {fmtFacilityRoom(patient.facility, patient.room)}
            </div>
          </div>

          {/* Avg completion badge */}
          <div className="text-right shrink-0">
            <div className="text-xl font-extrabold text-sage font-display">
              {avgComp !== null ? avgComp + "%" : "—"}
            </div>
            <div className="text-xs text-ink-light font-body">avg completion</div>
          </div>

          {/* Edit / Delete patient — small icon buttons in the header */}
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => { setConfirmDelete(false); onEditPatient(patient.id); }}
              className="p-2 rounded-lg border-none bg-transparent text-ink-light hover:text-sage hover:bg-sage-light transition-colors cursor-pointer text-lg"
              title="Edit patient"
            >
              ✏️
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 rounded-lg border-none bg-transparent text-ink-light hover:text-red hover:bg-red-light transition-colors cursor-pointer text-lg"
              title="Delete patient"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Inline delete-patient confirmation — appears below the header row */}
        {confirmDelete && (
          <div className="px-5 md:px-8 pb-3 max-w-5xl mx-auto">
            <div className="bg-red-light border border-red/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-sm font-body text-red">
                Delete {patient.name} and all their sessions? This cannot be undone.
              </span>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg border border-line bg-white text-ink-light font-body text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDeletePatient(patient.id)}
                  className="px-3 py-1.5 rounded-lg bg-red text-white font-body text-sm font-bold border-none cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex border-t border-line-light max-w-5xl mx-auto">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`flex-1 py-3 px-1 border-none bg-transparent cursor-pointer text-sm font-body border-b-[2.5px] transition-colors ${
                tab === i
                  ? "font-extrabold text-sage border-sage"
                  : "font-normal text-ink-light border-transparent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-5 md:px-8 pt-5 pb-14 max-w-5xl mx-auto">
        {tab === 0 && (
          <LogTab
            patient={patient}
            onAddCaregiverToTeam={onAddCaregiverToTeam}
            onSave={async (s) => {
              await onAddSession(s);
              setToast("Session saved!"); // Trigger the toast message
              setTab(HISTORY_TAB);        // Redirect to History tab
            }}
          />
        )}
        {tab === 1 && <InsightsTab sessions={ptSessions} />}
        {tab === 2 && <CarePlanTab patient={patient} sessions={ptSessions} />}
        {tab === 3 && (
          <HistoryTab
            patient={patient}
            sessions={ptSessions}
            onUpdate={onUpdateSession}
            onDelete={onDeleteSession}
          />
        )}
      </div>
    </div>
  );
}