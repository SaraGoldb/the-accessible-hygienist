// Wraps localStorage with try/catch so the app never crashes if storage is
// disabled (private browsing, some mobile webviews, etc). V1-only —
// once Supabase is wired in, this gets replaced by real database calls.
import type { Patient, Session } from "./types";

const LS_KEY = "accessible_hygienist_v1";

interface StoredState {
  patients: Patient[];
  sessions: Session[];
}

export const loadState = (): StoredState | null => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveState = (state: StoredState) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable — fail silently, app still works in-memory.
  }
};
