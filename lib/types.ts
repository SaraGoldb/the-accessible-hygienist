export interface Patient {
  id: string;
  name: string;
  dob: string;
  stage: string;
  facility: string;
  room: string;
  caregivers: string[];
  allergies: string;
  notes: string;
  avatar: string;
}

export interface Session {
  id: string;
  patientId: string;
  date: string;
  time: string;
  mood: string;
  completion: number;
  triggers: string[];
  helps: string[];
  tools: string[];
  findings: string[];
  findingNotes: string;
  complaints: string[];
  discomfort: number;
  notes: string;
  caregiver: string;
}