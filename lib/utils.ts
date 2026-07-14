import type { Session } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 9);

// en-CA formats as YYYY-MM-DD, which conveniently matches what <input type="date">
// and Postgres expect. Using Intl instead of toISOString() avoids UTC conversion
// shifting the date by a day for users west of UTC.
export const today = () => new Intl.DateTimeFormat("en-CA").format(new Date());

export const fmtDate = (d: string) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${m}/${day}/${y}`;
};

export const toggle = (arr: string[], v: string) =>
  arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

export const topN = (obj: Record<string, number>, n = 5) =>
  Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);

export const countField = (sessions: Session[], field: keyof Session) => {
  const counts: Record<string, number> = {};
  sessions.forEach((s) => {
    const arr = s[field] as string[] | undefined;
    (arr || []).forEach((v: string) => {
      counts[v] = (counts[v] || 0) + 1;
    });
  });
  return counts;
};

export const pluralize = (n: number, word: string) => `${n} ${word}${n !== 1 ? "s" : ""}`;

// Average of session completion %, rounded. Returns null for an empty array.
export const avgCompletion = (sessions: Session[]): number | null =>
  sessions.length
    ? Math.round(sessions.reduce((a, s) => a + s.completion, 0) / sessions.length)
    : null;

// Combines a caregiver's name + optional title into one display string
// (e.g. "Rosa (day aide)"), or just the name if no title was given.
export const fmtCaregiver = (name: string, title: string) =>
  title.trim() ? `${name.trim()} (${title.trim()})` : name.trim();

// Reverse of fmtCaregiver — splits a stored caregiver string back into
// name/title parts for pre-filling edit forms.
export const parseCaregiver = (s: string) => {
  const i = s.lastIndexOf(" (");
  if (i === -1 || !s.endsWith(")")) return { name: s, title: "" };
  return { name: s.slice(0, i), title: s.slice(i + 2, -1) };
};

// Formats "Facility · Room X" (or just one, or a fallback if both missing).
export const fmtFacilityRoom = (facility: string, room: string) => {
  if (facility && room) return `${facility} · Room ${room}`;
  if (facility) return facility;
  if (room) return `Room ${room}`;
  return "No facility listed";
};