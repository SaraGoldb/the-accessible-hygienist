"use client";

// Pattern-recognition view: stats, best time of day, top triggers/helps/
// tools, recurring visual findings, and a per-caregiver completion
// breakdown — all derived client-side from the session history.
import { Card } from "@/components/ui/Card";
import { SectionHead } from "@/components/ui/SectionHead";
import { StatTile } from "@/components/ui/StatTile";
import { InsightRow } from "@/components/ui/InsightRow";
import { VISUAL_FINDINGS } from "@/lib/constants";
import { COLOR_HEX } from "@/lib/colors";
import { avgCompletion, countField, topN, pluralize } from "@/lib/utils";
import type { Session } from "@/lib/types";

export function InsightsTab({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-10 px-5 text-ink-light font-body text-[13px]">
        Log your first session to start seeing patterns.
      </div>
    );
  }

  const trigC = countField(sessions, "triggers");
  const helpC = countField(sessions, "helps");
  const toolC = countField(sessions, "tools");
  const findC = countField(sessions, "findings");
  const compC = countField(sessions, "complaints");

  const full = sessions.filter((s) => s.completion === 100);
  const avgC = avgCompletion(sessions) ?? 0;
  const avgD = Number((
    sessions.reduce((a, s) => a + s.discomfort, 0) / sessions.length
  ).toFixed(1));

  // Which time of day has the most fully-completed sessions.
  const bestTimeCounts: Record<string, number> = {};
  full.forEach((s) => {
    bestTimeCounts[s.time] = (bestTimeCounts[s.time] || 0) + 1;
  });
  const bestTime = Object.entries(bestTimeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Findings that need dental follow-up (vs. just "watch").
  const flags = Object.entries(findC).filter(
    ([k]) => VISUAL_FINDINGS.find((vf) => vf.label === k)?.urgency === "flag"
  );

  // Average completion per caregiver, to spot who has the smoothest sessions.
  const cgAvg: Record<string, number[]> = {};
  sessions.forEach((s) => {
    if (s.caregiver) {
      if (!cgAvg[s.caregiver]) cgAvg[s.caregiver] = [];
      cgAvg[s.caregiver].push(s.completion);
    }
  });

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <StatTile icon="📋" label="Sessions" value={sessions.length} color={COLOR_HEX.blue} />
        <StatTile icon="✅" label="Avg Completion" value={avgC + "%"} color={COLOR_HEX.sage} />
        <StatTile icon="⭐" label="Full Sessions" value={full.length} color={COLOR_HEX.green} />
        <StatTile icon="💛" label="Avg Discomfort" value={avgD + "/5"} color={COLOR_HEX.amber} 
                  sub={`across ${pluralize(sessions.length, "session")}`}/>
      </div>

      {bestTime && (
        <Card className="mb-4 bg-linear-to-br from-sage-light to-blue-light">
          <div className="text-[11px] text-sage-dark font-body font-extrabold uppercase mb-1.5">
            💡 Best Pattern Identified
          </div>
          <div className="text-[13px] text-ink font-body leading-[1.7]">
            <strong>{bestTime}</strong> sessions have the highest success rate.
            {topN(helpC, 2).length > 0 &&
              ` Consistent helpers: ${topN(helpC, 2).map(([k]) => k).join(", ")}.`}
          </div>
        </Card>
      )}

      {Object.keys(trigC).length > 0 && (
        <Card className="mb-3.5">
          <SectionHead title="Most Common Triggers" icon="⚠️" color="red" />
          {topN(trigC, 6).map(([k, v]) => (
            <InsightRow key={k} label={k} count={v} color={COLOR_HEX.red} />
          ))}
        </Card>
      )}

      {Object.keys(helpC).length > 0 && (
        <Card className="mb-3.5">
          <SectionHead title="What Helps Most" icon="✨" color="green" />
          {topN(helpC, 6).map(([k, v]) => (
            <InsightRow key={k} label={k} count={v} color={COLOR_HEX.green} />
          ))}
        </Card>
      )}

      {Object.keys(toolC).length > 0 && (
        <Card className="mb-3.5">
          <SectionHead title="Preferred Tools" icon="🪥" color="blue" />
          {topN(toolC, 4).map(([k, v]) => (
            <InsightRow key={k} label={k} count={v} color={COLOR_HEX.blue} />
          ))}
        </Card>
      )}

      {Object.keys(findC).length > 0 && (
        <Card
          className="mb-3.5"
          highlight={flags.length > 0}
          highlightColor={flags.length > 0 ? COLOR_HEX.red : undefined}
        >
          {flags.length > 0 && (
            <div className="bg-red-light border border-red/25 rounded-lg px-3 py-2 mb-2.5 text-xs text-red font-body">
              ▶ {pluralize(flags.length, "finding")} flagged for dental follow-up
            </div>
          )}
          <SectionHead title="Visual Findings (recurring)" icon="👁" color="red" />
          {topN(findC, 8).map(([k, v]) => {
            const isFlag = VISUAL_FINDINGS.find((vf) => vf.label === k)?.urgency === "flag";
            return (
              <InsightRow
                key={k}
                label={k}
                count={v}
                color={isFlag ? COLOR_HEX.red : COLOR_HEX.amber}
              />
            );
          })}
        </Card>
      )}

      {Object.keys(compC).length > 0 && (
        <Card className="mb-3.5">
          <SectionHead title="Patient Behavioral Signals" icon="💬" color="mauve" />
          {topN(compC, 6).map(([k, v]) => (
            <InsightRow key={k} label={k} count={v} color={COLOR_HEX.mauve} />
          ))}
        </Card>
      )}

      {Object.keys(cgAvg).length > 1 && (
        <Card className="mb-3.5">
          <SectionHead title="Completion by Caregiver" icon="👥" color="mauve" />
          {Object.entries(cgAvg).map(([cg, vals]) => (
            <InsightRow
              key={cg}
              label={cg}
              sub={`${pluralize(vals.length, "session")}`}
              count={Math.round(vals.reduce((a, v) => a + v, 0) / vals.length)}
              color={COLOR_HEX.mauve}
              symbol="%"
            />
          ))}
        </Card>
      )}
    </div>
  );
}
