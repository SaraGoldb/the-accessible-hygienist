"use client";

import { Card } from "@/components/ui/Card";

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-5">
      <Card className="max-w-sm w-full">
        <div className="text-center text-xl font-display font-bold text-ink mb-4">
          {title}
        </div>
        <div className="text-center text-base text-ink-md font-body leading-relaxed mb-7">
          {message}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-body font-bold border-[1.5px] border-line text-ink-light min-h-11"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-body font-bold bg-linear-to-br from-sage to-blue text-white min-h-11"
          >
            {confirmLabel}
          </button>
        </div>
      </Card>
    </div>
  );
}