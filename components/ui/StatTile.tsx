export function StatTile({
  icon,
  label,
  value,
  color,
  sub,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-line px-3 py-3.5 text-center">
      <div className="text-[22px] mb-1">{icon}</div>
      <div style={{ color }} className="text-xl font-extrabold font-display">
        {value}
      </div>
      <div className="text-[11px] text-ink-light font-body mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-ink-light/70 font-body mt-0.5">{sub}</div>}
    </div>
  );
}