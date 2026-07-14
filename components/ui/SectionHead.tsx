import { COLOR_HEX } from "@/lib/colors";

export function SectionHead({
  title,
  color,
  icon,
}: {
  title: string;
  color?: string;
  icon?: string;
}) {
  const hex = color ? COLOR_HEX[color] : undefined;
  return (
    <div className="flex items-center gap-2 mb-[11px]">
      {icon && <span className="text-sm">{icon}</span>}
      <span
        style={{ color: hex || COLOR_HEX["ink-light"] }}
        className="text-[10px] font-extrabold tracking-[0.1em] uppercase font-body"
      >
        {title}
      </span>
    </div>
  );
}