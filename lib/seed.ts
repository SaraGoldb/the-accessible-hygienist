// Sample patient + sessions shown on first load, so the app isn't empty
// before a caregiver adds their own data. Safe to delete once real data exists.
import type { Patient, Session } from "./types";

export const SEED_PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "Margaret T.",
    dob: "1938-04-12",
    stage: "Middle",
    facility: "Sunrise Memory Care",
    room: "114B",
    caregivers: ["Diane (daughter)", "Rosa (day aide)"],
    allergies: "None known",
    notes: "Responds well to classical music. Dislikes mint.",
    avatar: "👵",
  },
];

export const SEED_SESSIONS: Session[] = [
  {
    id: "s1", patientId: "p1", date: "2026-05-20", time: "Morning",
    mood: "Anxious", completion: 60,
    triggers: ["Bright lighting", "Toothbrush texture"],
    helps: ["Dim lighting", "Short sessions (< 2 min)"],
    tools: ["Extra-soft brush"],
    findings: [], findingNotes: "", complaints: [],
    discomfort: 2,
    notes: "Got through upper front teeth. Stopped when she pulled away. Dimming the lights helped.",
    caregiver: "Rosa (day aide)",
  },
  {
    id: "s2", patientId: "p1", date: "2026-05-23", time: "Morning",
    mood: "Resistant", completion: 20,
    triggers: ["Time pressure", "Unfamiliar caregiver"],
    helps: [], tools: ["Standard manual brush"],
    findings: [], findingNotes: "", complaints: [],
    discomfort: 3,
    notes: "Difficult session — new aide on shift. Kept turning head away.",
    caregiver: "New aide",
  },
  {
    id: "s3", patientId: "p1", date: "2026-05-26", time: "Evening",
    mood: "Cooperative", completion: 100, triggers: [],
    helps: ["Soft music", "Familiar caregiver", "Warm water", "Same sequence each time"],
    tools: ["Extra-soft brush", "Foam swabs"],
    findings: [], findingNotes: "", complaints: [],
    discomfort: 0,
    notes: "Best session in weeks. Jazz on the speaker. She even held the brush briefly.",
    caregiver: "Rosa (day aide)",
  },
  {
    id: "s4", patientId: "p1", date: "2026-05-29", time: "Evening",
    mood: "Calm", completion: 100, triggers: [],
    helps: ["Soft music", "Dim lighting", "Warm water", "Familiar caregiver"],
    tools: ["Extra-soft brush"],
    findings: [], findingNotes: "", complaints: [],
    discomfort: 0,
    notes: "Smooth from start to finish. Evening + Rosa + jazz = winning combo.",
    caregiver: "Rosa (day aide)",
  },
];
