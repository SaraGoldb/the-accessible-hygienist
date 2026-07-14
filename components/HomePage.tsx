"use client";

// Root client component — owns all app state (patients, sessions, current
// view) and syncs it to Supabase, scoped per-user via Clerk auth.
//
// V2 note: state used to live in localStorage (see V1's loadState/saveState).
// Now data loads once from Supabase on mount (after Clerk resolves userId),
// and each handler below writes to Supabase first, then updates local state
// to match — the rest of the tree is unchanged since components still just
// receive data as props.
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { PatientList } from "@/components/PatientList";
import { AddPatient } from "@/components/AddPatient";
import { PatientDashboard } from "@/components/PatientDashboard";
import { Toast } from "@/components/ui/Toast";
import { usePatientQueries, useSessionQueries } from "@/lib/supabase/queries";
import type { Patient, Session } from "@/lib/types";
import { ConfirmModal } from "./ui/ConfirmModal";

// view is "home" | "add" | "edit:{patientId}" | a raw patient id (dashboard)
type View = string;

export default function HomePage() {
  // Clerk's userId — needed to scope inserts (RLS handles scoping reads
  // automatically via the JWT, but inserts need it passed explicitly).
  const { userId } = useAuth();
  const patientQueries = usePatientQueries();
  const sessionQueries = useSessionQueries();
 
  // `loaded` gates the first render until the initial Supabase fetch
  // finishes — same purpose as V1's `mounted` flag, just triggered by
  // the async fetch completing instead of localStorage hydration.
  const [loaded, setLoaded] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [view, setView] = useState<View>("home");
  const [toast, setToast] = useState("");
 
  // Fetch patients + sessions once userId is available. Runs again if
  // userId changes (e.g. switching accounts), though in practice that
  // means a full remount in most auth flows.
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [p, s] = await Promise.all([
        patientQueries.getPatients(),
        sessionQueries.getSessions(),
      ]);
      setPatients(p);
      setSessions(s);
      setLoaded(true);
    })();
  }, [userId]);
 
  // Small helper so every handler doesn't repeat the same
  // setToast + setTimeout pair.
  const flashToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  // ── Patient handlers ────────────────────────────────────────────────────────
  // Each handler writes to Supabase first, then updates local state to
  // match once the write succeeds — so the UI reflects confirmed data,
  // not an optimistic guess that could roll back on a failed write.
 
  const addPatient = async (p: Patient) => {
    if (!userId) return;
    // Strip the client-generated id — Postgres assigns the real one
    // (gen_random_uuid()) on insert.
    const { id, ...rest } = p;
    const saved = await patientQueries.addPatient(rest, userId);
    setPatients((prev) => [...prev, saved]);
    flashToast(`${p.name} added`);
    setView("home");
  };
 
  // Holds a pendingRename state so the user can confirm whether to update past session records
  // to reflect the new name/title for any caregivers that were changed.
  const [pendingRename, setPendingRename] = useState<{
    patient: Patient;
    renamed: { old: string; new: string }[];
  } | null>(null);

  // Shared final step for confirming whether to update past session records after a patient edit.
  const finishPatientUpdate = async (p: Patient) => {
    await patientQueries.updatePatient(p);
    setPatients((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    flashToast(`${p.name} updated`);
    setView(p.id);
  };

  // Called by AddPatient when in edit mode — replaces the matching patient.
  // If any caregiver was renamed (detected in AddPatient's handleSave), we pause 
  // and show a confirm modal instead of saving immediately.
  const updatePatient = async (p: Patient, renamed?: { old: string; new: string }[]) => {
    if (renamed && renamed.length > 0) {
      setPendingRename({ patient: p, renamed });
      return; // wait for ConfirmModal's onConfirm/onCancel
    }
    await finishPatientUpdate(p);
  };

  // Called by ConfirmModal's buttons once the user decides whether past
  // sessions should reflect the caregiver's new name/title.
  const confirmRenameHistory = async (updateHistory: boolean) => {
    if (!pendingRename) return;
    const { patient: p, renamed } = pendingRename;

    if (updateHistory) {
      // Bulk-update every past session that used the old caregiver string,
      // one rename at a time (there could be multiple if several care
      // team members were edited in the same save).
      for (const { old, new: updated } of renamed) {
        await sessionQueries.renameCaregiverInSessions(p.id, old, updated);
      }
      // Mirror the same change in local state so History reflects it
      // immediately, without needing a full reload.
      setSessions((prev) =>
        prev.map((s) => {
          const match = renamed.find((r) => r.old === s.caregiver && s.patientId === p.id);
          return match ? { ...s, caregiver: match.new } : s;
        }));
    }
    // If updateHistory is false, old sessions are left untouched —
    // they keep whatever caregiver string was logged at the time.

    await finishPatientUpdate(p);
    setPendingRename(null); // close the modal
  };

  // Called by LogTab when a session is logged with a caregiver who isn't
  // yet on the patient's care team (i.e. the "+ New caregiver" path).
  // Adds them to patient.caregivers so they show up in future dropdown
  // suggestions instead of only existing inside that one session record.
  const addCaregiverToTeam = async (patientId: string, caregiver: string) => {
    const patient = patients.find((p) => p.id === patientId);
    // Guard against duplicates — e.g. if a caregiver is somehow already
    // on the team but the UI still thought they were "new".
    if (!patient || patient.caregivers.includes(caregiver)) return;
    const updated = { ...patient, caregivers: [...patient.caregivers, caregiver] };
    await patientQueries.updatePatient(updated);
    setPatients((prev) => prev.map((p) => (p.id === patientId ? updated : p)));
  };

  // Called by PatientDashboard's delete button. The `sessions` foreign key
  // has ON DELETE CASCADE, so deleting the patient row in Supabase also
  // removes their sessions server-side — we just mirror that locally.
  const deletePatient = async (id: string) => {
    const name = patients.find((p) => p.id === id)?.name ?? "Patient";
    await patientQueries.deletePatient(id);
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setSessions((prev) => prev.filter((s) => s.patientId !== id));
    flashToast(`${name} deleted`);
    setView("home");
  };

  // ── Session handlers ────────────────────────────────────────────────────────

  const addSession = async (s: Session) => {
    if (!userId) return;
    const { id, ...rest } = s;
    const saved = await sessionQueries.addSession(rest, userId);
    setSessions((prev) => [saved, ...prev]);
  };
 
  const updateSession = async (updated: Session) => {
    await sessionQueries.updateSession(updated);
    setSessions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };
 
  const deleteSession = async (id: string) => {
    await sessionQueries.deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // ── View resolution ─────────────────────────────────────────────────────────

  const isEditView = view.startsWith("edit:");
  const editingPatientId = isEditView ? view.slice(5) : null;
  const editingPatient = editingPatientId
    ? patients.find((p) => p.id === editingPatientId)
    : null;
  const selectedPatient =
    !isEditView && view !== "home" && view !== "add"
      ? patients.find((p) => p.id === view)
      : null;
 
  if (!loaded) return null;
  
  return (
    // Full-screen on all devices — no artificial max-width cap.
    // bg-cream on mobile, slightly darker bg on desktop to give the
    // content area visual lift via the white cards.
    <div className="min-h-screen bg-cream md:bg-line-light">
      {toast && <Toast msg={`✓ ${toast}`} onDone={() => setToast("")} />}

      {pendingRename && (
        <ConfirmModal
          title="Update past sessions?"
          message={`You changed ${pendingRename.renamed.map((r) => r.new).join(", ")}. \n Do you want to update past session records to reflect this change, or keep them as originally logged?`}
          confirmLabel="Update history"
          cancelLabel="Keep as logged"
          onConfirm={() => confirmRenameHistory(true)}
          onCancel={() => confirmRenameHistory(false)}
        />
      )}
 
      {/* App header — shown only on the home (patient list) screen */}
      {view === "home" && (
        <div className="bg-white border-b border-line px-5 md:px-8 pt-5 pb-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 max-w-5xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-sage to-blue flex items-center justify-center text-2xl shrink-0">
              🦷
            </div>
            <div className="space-y-2">
              <div className="text-xl font-extrabold text-ink font-display leading-tight">
                The Accessible Hygienist
              </div>
              <div className="text-sm text-ink-light font-body tracking-wide">
                Care Tracker · by Erica Solomon, RDH
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* Content — centred with max-w on desktop for readability */}
      <div className={`max-w-5xl mx-auto ${view === "home" ? "px-5 md:px-8 pt-6 pb-12" : ""}`}>
 
        {view === "home" && (
          <PatientList
            patients={patients}
            sessions={sessions}
            onSelect={(id) => setView(id)}
            onAdd={() => setView("add")}
          />
        )}
 
        {view === "add" && (
          <div className="px-5 md:px-8 pt-6 pb-12">
            <AddPatient onSave={addPatient} onCancel={() => setView("home")} />
          </div>
        )}
 
        {/* Edit mode — AddPatient pre-filled with existing patient data */}
        {isEditView && editingPatient && (
          <div className="px-5 md:px-8 pt-6 pb-12">
            <AddPatient
              initialData={editingPatient}
              onSave={updatePatient}
              onCancel={() => setView(editingPatient.id)}
            />
          </div>
        )}
 
        {selectedPatient && (
          <PatientDashboard
            patient={selectedPatient}
            sessions={sessions}
            onAddCaregiverToTeam={addCaregiverToTeam}
            onAddSession={addSession}
            onUpdateSession={updateSession}
            onDeleteSession={deleteSession}
            onEditPatient={(id) => setView(`edit:${id}`)}
            onDeletePatient={deletePatient}
            onBack={() => setView("home")}
          />
        )}
      </div>
    </div>
  );
}