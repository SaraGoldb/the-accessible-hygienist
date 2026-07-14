export const CAREGIVER_TITLES = [
  "day aide", "night aide", "weekend aide", "caregiver", "daughter", "son", "spouse", 
  "parent", "sibling", "dental hygienist", "dentist", "hospice aide", "other",
];

export const TRIGGERS = [
  "Toothbrush texture","Toothpaste flavor","Gagging reflex","Brush sound",
  "Bright lighting","Reclining position","Time of day","Fatigue","Hunger",
  "Crowded environment","Unfamiliar caregiver","Cold water","Mirror presence",
  "Touch sensitivity","Noise sensitivity","Loss of footing","Time pressure",
];

export const HELPS = [
  "Soft music","Dim lighting","Warm water","Extra-soft bristles",
  "Short sessions (< 2 min)","Calm conversation","Familiar caregiver",
  "Morning routine","Evening routine","Hand-over-hand guidance",
  "Visual picture cues","Preferred toothpaste flavor","Electric toothbrush",
  "Manual toothbrush","Positive verbal cues","Extra rinse time",
  "Sitting upright","Distraction technique","Same sequence each time",
];

export const TOOLS = [
  "Standard manual brush","Soft manual brush","Extra-soft brush",
  "Electric toothbrush","Foam swabs","Finger brush",
  "Water flosser","Traditional floss","Floss picks","Interdental brush",
];

export const VISUAL_FINDINGS = [
  { label:"Food impaction", icon:"🟡", urgency:"watch" as const },
  { label:"Visible plaque buildup", icon:"🟡", urgency:"watch" as const },
  { label:"Calculus / tartar", icon:"🟡", urgency:"watch" as const },
  { label:"Visible decay / dark spot", icon:"🟡", urgency:"watch" as const },
  { label:"Dry mouth / chapping", icon:"🟡", urgency:"watch" as const },
  { label:"Denture sore spot", icon:"🟡", urgency:"watch" as const },
  { label:"Ill-fitting denture", icon:"🟡", urgency:"watch" as const },
  { label:"Coated / discolored tongue", icon:"🟡", urgency:"watch" as const },
  { label:"Red / inflamed gums", icon:"🔴", urgency:"flag" as const },
  { label:"Swollen gum tissue", icon:"🔴", urgency:"flag" as const },
  { label:"Bleeding on contact", icon:"🔴", urgency:"flag" as const },
  { label:"Broken / fractured tooth", icon:"🔴", urgency:"flag" as const },
  { label:"Missing tooth (new)", icon:"🔴", urgency:"flag" as const },
  { label:"Loose tooth", icon:"🔴", urgency:"flag" as const },
  { label:"Ulcer or sore in mouth", icon:"🔴", urgency:"flag" as const },
  { label:"White patch on tissue", icon:"🔴", urgency:"flag" as const },
];

export const PATIENT_COMPLAINTS = [
  "Points to or touches mouth",
  "Pulls away from tooth/area",
  "Verbal pain expression",
  "Increased agitation at mealtimes",
  "Refusing food / chewing differently",
  "Drooling more than usual",
  "Facial grimacing while eating",
  "Holding jaw or cheek",
  "Reduced appetite",
  "Swallowing difficulty noted",
];

// "color" here is a Tailwind color token name (matches tailwind.config.ts),
// used to build class names like `text-${color}` and `border-${color}`.
export const MOODS = [
  { label:"Calm", emoji:"😌", color: "green" },
  { label:"Cooperative", emoji:"🙂", color: "blue" },
  { label:"Anxious", emoji:"😟", color: "amber" },
  { label:"Resistant", emoji:"😤", color: "red" },
  { label:"Fatigued", emoji:"😴", color: "ink-light" },
  { label:"Confused", emoji:"😕", color: "mauve" },
];

export const COMPLETION = [
  { label:"Full", pct:100, icon:"✅", color: "green" },
  { label:"Partial", pct:50, icon:"🔶", color: "amber" },
  { label:"Minimal", pct:10, icon:"❌", color: "red" },
];

export const TIMES = ["Morning","Midday","Afternoon","Evening","Bedtime"];
export const STAGES = ["Early","Middle","Late","Unknown"];

export const PLAN_ICONS: Record<string, { icon: string; color: string }> = {
  "IDEAL ROUTINE": { icon: "🗓️", color: "sage" },
  "ENVIRONMENT SETUP": { icon: "💡", color: "blue" },
  "AVOID": { icon: "⚠️", color: "red" },
  "CAREGIVER TIPS": { icon: "💬", color: "mauve" },
};