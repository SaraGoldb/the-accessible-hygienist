"use client";

import { useRef } from "react";

// Custom discomfort slider (0–5). Built from plain divs instead of a
// native <input type="range"> because we need a colored fill, tick
// marks, and a thumb that darkens independently of the track — hard
// to get consistently across browsers with a native range input.
export function DiscomfortSlider({
  value,
  onChange,
  color,
}: {
  value: number;
  onChange: (n: number) => void;
  color: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const max = 5;
  const thumbSize = 18;

  const valueFromPosition = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return value;
    const rect = track.getBoundingClientRect();
    const trackStart = rect.left + thumbSize / 2;
    const trackWidth = rect.width - thumbSize;
    const pct = Math.min(1, Math.max(0, (clientX - trackStart) / trackWidth));
    return Math.round(pct * max);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onChange(valueFromPosition(e.clientX));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return;
    onChange(valueFromPosition(e.clientX));
  };

  // Shared position formula — every element (fill width, thumb, each
  // tick) derives from this so nothing can visually drift apart.
  // fraction: 0 to 1, representing how far along the track a point is.
  const positionCalc = (fraction: number) =>
    `calc(${thumbSize / 2}px + (100% - ${thumbSize}px) * ${fraction})`;

  const fillFraction = value / max;

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      className="relative flex-1 h-[18px] flex items-center cursor-pointer touch-none"
    >
      {/* Background track */}
      <div
        className="absolute h-1 rounded bg-line"
        style={{ left: thumbSize / 2, right: thumbSize / 2 }}
      />
      {/* Filled portion, from the start up to the current value */}
      <div
        className="absolute h-1 rounded"
        style={{
          left: thumbSize / 2,
          width: `calc(${positionCalc(fillFraction)} - ${thumbSize / 2}px)`,
          background: color,
        }}
      />
      {/* Tick marks — each individually centered on its position with
          translateX(-50%), same technique as the thumb below, so they
          land exactly where the thumb would sit at that value. */}
      {Array.from({ length: max + 1 }, (_, n) => (
        <div
          key={n}
          className="absolute w-2.5 h-2.5 rounded-full"
          style={{
            left: positionCalc(n / max),
            transform: "translateX(-50%)",
            background: n <= value ? color : "var(--color-line)",
          }}
        />
      ))}
      {/* Thumb */}
      <div
        className="absolute rounded-full"
        style={{
          width: thumbSize,
          height: thumbSize,
          left: positionCalc(fillFraction),
          transform: "translateX(-50%)",
          background: color,
        }}
      />
    </div>
  );
}