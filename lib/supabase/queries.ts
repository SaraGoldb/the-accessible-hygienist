import { useSupabaseClient } from "./client";
import type { Patient, Session } from "@/lib/types";

// Row shapes as they exist in Postgres (snake_case)
type PatientRow = Omit<Patient, "dob"> & { dob: string; user_id: string };
type SessionRow = {
  id: string;
  user_id: string;
  patient_id: string;
  date: string;
  time: string;
  mood: string;
  completion: number;
  triggers: string[];
  helps: string[];
  tools: string[];
  findings: string[];
  finding_notes: string;
  complaints: string[];
  discomfort: number;
  notes: string;
  caregiver: string;
};

const toSession = (r: SessionRow): Session => ({
  id: r.id,
  patientId: r.patient_id,
  date: r.date,
  time: r.time,
  mood: r.mood,
  completion: r.completion,
  triggers: r.triggers,
  helps: r.helps,
  tools: r.tools,
  findings: r.findings,
  findingNotes: r.finding_notes,
  complaints: r.complaints,
  discomfort: r.discomfort,
  notes: r.notes,
  caregiver: r.caregiver,
});

export function usePatientQueries() {
  const supabase = useSupabaseClient();

  return {
    async getPatients(): Promise<Patient[]> {
      const { data, error } = await supabase.from("patients").select();
      if (error) throw error;
      return data as Patient[];
    },

    async addPatient(p: Omit<Patient, "id">, userId: string): Promise<Patient> {
      const { data, error } = await supabase
        .from("patients")
        .insert({ ...p, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data as Patient;
    },

    async updatePatient(p: Patient): Promise<void> {
      const { id, ...rest } = p;
      const { error } = await supabase.from("patients").update(rest).eq("id", id);
      if (error) throw error;
    },

    async deletePatient(id: string): Promise<void> {
      const { error } = await supabase.from("patients").delete().eq("id", id);
      if (error) throw error;
    },
  };
}

export function useSessionQueries() {
  const supabase = useSupabaseClient();

  return {
    async getSessions(): Promise<Session[]> {
      const { data, error } = await supabase
        .from("sessions")
        .select()
        .order("date", { ascending: false });
      if (error) throw error;
      return (data as SessionRow[]).map(toSession);
    },

    async addSession(s: Omit<Session, "id">, userId: string): Promise<Session> {
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          patient_id: s.patientId,
          date: s.date,
          time: s.time,
          mood: s.mood,
          completion: s.completion,
          triggers: s.triggers,
          helps: s.helps,
          tools: s.tools,
          findings: s.findings,
          finding_notes: s.findingNotes,
          complaints: s.complaints,
          discomfort: s.discomfort,
          notes: s.notes,
          caregiver: s.caregiver,
          user_id: userId,
        })
        .select()
        .single();
      if (error) throw error;
      return toSession(data as SessionRow);
    },

    async updateSession(s: Session): Promise<void> {
      const { id, patientId, findingNotes, ...rest } = s;
      const { error } = await supabase
        .from("sessions")
        .update({ ...rest, patient_id: patientId, finding_notes: findingNotes })
        .eq("id", id);
      if (error) throw error;
    },

    async deleteSession(id: string): Promise<void> {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw error;
    },

    // Bulk-renames a caregiver string across all of a patient's past
    // sessions — used when AddPatient edits a caregiver's name/title
    // and the user opts to update historical records to match.
    async renameCaregiverInSessions(patientId: string, oldName: string, newName: string): Promise<void> {
      const { error } = await supabase
        .from("sessions")
        .update({ caregiver: newName })
        .eq("patient_id", patientId)
        .eq("caregiver", oldName);
      if (error) throw error;
    },
  };
}