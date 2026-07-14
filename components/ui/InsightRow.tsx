export function InsightRow({
  label,
  count,
  color,
  symbol = "×",
  sub,
}: {
  label: string;
  count: number;
  color: string;
  symbol?: string;
  sub?: string;
}) {
  // Calculate percentage for the progress bar, ensuring it doesn't exceed 100%
  // If the symbol is "%", we treat the count as a percentage and use it directly.
  // Otherwise, we assume `count` is a raw tally and scale it to a percentage (assuming a max of 5)
  const pct = (symbol === "%") ? Math.min(100, count) : Math.min(100, count * 20);
  return (
    <div className="mb-[9px]">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-ink font-body">{label}</span>
        <span className="flex items-baseline gap-1.5">
          {sub && (
            <>
              <span className="text-[10px] text-ink-light font-body">{sub}</span>
              <span className="text-[10px] text-ink-light font-body">·</span>
            </>
          )}
          <span style={{ color }} className="text-[11px] font-bold font-body">
            {count}{symbol}
          </span>
        </span>
      </div>
      <div className="h-[5px] rounded bg-line-light">
        <div
          style={{ background: color, width: `${pct}%` }}
          className="h-full rounded transition-all duration-300"
        />
      </div>
    </div>
  );
}