export function Card({
  children,
  className = "",
  highlight = false,
  highlightColor,
}: {
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
  highlightColor?: string;
}) {
  return (
    <div
      style={highlight && highlightColor ? { borderColor: highlightColor, borderWidth: 1.5 } : undefined}
      className={`bg-white rounded-2xl border border-line px-4 py-[18px] ${className}`}
    >
      {children}
    </div>
  );
}