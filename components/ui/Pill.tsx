"use client";

import { COLOR_HEX, withAlpha } from "@/lib/colors";

export function Pill({
  label,
  selected,
  onClick,
  color = "sage",
  small = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  color?: string;
  small?: boolean;
}) {
  const hex = COLOR_HEX[color] || COLOR_HEX.sage;
  return (
    <button
      type="button"
      onClick={onClick}
      style={
        selected
          ? { borderColor: hex, backgroundColor: withAlpha(hex, "20"), color: hex }
          : undefined
      }
      className={[
        "rounded-full border-[1.5px] font-body transition-colors",
        small ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-[7px] text-xs",
        "leading-snug",
        selected ? "font-bold" : "border-line bg-white text-ink-light font-normal",
      ].join(" ")}
    >
      {label}
    </button>
  );
}