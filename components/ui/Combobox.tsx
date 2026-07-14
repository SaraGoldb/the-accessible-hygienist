// A combobox is a UI component that combines a text input with a dropdown list
// Used in SessionForm.tsx and CarePlanTab.tsx
// Why this exists instead of <input list="..."> + <datalist>:
// iOS Safari's support for <datalist> is unreliable — suggestions often don't render
// or can't be tapped. This component reimplements the same "type freely OR pick a 
// suggestion" behavior using a plain <input> plus a manually-rendered list of buttons, 
// which works consistently across all mobile browsers.
"use client";

import { useState, useRef, useEffect } from "react";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  inputClassName?: string;
}

export default function Combobox({
  value,
  onChange,
  options,
  placeholder,
  inputClassName,
}: ComboboxProps) {
  // Whether the suggestion list is currently visible
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter suggestions to ones that contain what's typed so far.
  // (Skipped when the field is empty so it doesn't hide everything.)
  const filtered = options.filter((opt) =>
    value.trim() === "" ? true : opt.toLowerCase().includes(value.toLowerCase())
  );

  // Close the dropdown when the user taps/clicks outside of it.
  // We listen on the whole document rather than using onBlur because
  // onBlur fires before a tap on a suggestion button registers,
  // which would close the list before the click can select anything.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
      />

      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              // onMouseDown (not onClick) fires before the input's onBlur,
              // so the value is set before the outside-click handler above
              // has a chance to close the list.
              onMouseDown={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm md:text-xs hover:bg-gray-50 active:bg-gray-100"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}