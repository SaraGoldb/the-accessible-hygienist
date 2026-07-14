// A simple toast notification component 
// that displays a message in a fixed pill at the bottom of the screen 
// and auto-dismisses itself after 2.5 seconds 
// via an internal setTimeout, calling onDone when it's done.
// ✓

"use client";

import { useEffect } from "react";

export function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-sage-dark text-white rounded-full px-[22px] py-[11px] text-[13px] font-body shadow-lg z-[999] whitespace-nowrap">
      {msg}
    </div>
  );
}