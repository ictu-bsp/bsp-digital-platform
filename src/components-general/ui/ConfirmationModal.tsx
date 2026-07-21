//src/components-general/ui/ConfirmationModal.tsx

"use client";

import { useEffect } from "react";
import {
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface ConfirmationModalProps {
  open: boolean;

  title: string;

  message: string;

  confirmText?: string;

  cancelText?: string;

  loadingText?: string;

  confirmColor?:
    | "green"
    | "red"
    | "amber";

  loading?: boolean;

  onConfirm: () => void;

  onCancel: () => void;
}

export default function ConfirmationModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loadingText = "Processing...",
  confirmColor = "green",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!open || loading) return;

    function handleKeyDown(
      e: KeyboardEvent
    ) {
      if (e.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [open, loading, onCancel]);

  if (!open) return null;

  const confirmClasses = {
    green:
      "bg-emerald-700 hover:bg-emerald-800 text-white",

    red:
      "bg-red-600 hover:bg-red-700 text-white",

    amber:
      "bg-amber-500 hover:bg-amber-600 text-white",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">

      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl">

        <div className="px-8 pt-8 text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <ExclamationTriangleIcon className="h-10 w-10 text-amber-600" />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {message}
          </p>

        </div>

        <div className="mt-8 flex gap-3 border-t border-slate-200 p-6">

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl py-3 font-semibold transition disabled:opacity-60 ${confirmClasses[confirmColor]}`}
          >
            {loading
              ? loadingText
              : confirmText}
          </button>

        </div>

      </div>

    </div>
  );
}