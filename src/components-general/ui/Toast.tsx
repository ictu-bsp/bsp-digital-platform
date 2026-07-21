//src/components-general/ui/Toast.tsx

"use client";

import { useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info";

interface ToastProps {
  open: boolean;

  type?: ToastType;

  title: string;

  message?: string;

  duration?: number;

  onClose: () => void;
}

export default function Toast({
  open,
  type = "success",
  title,
  message,
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  const styles = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      icon: (
        <CheckCircleIcon className="h-7 w-7 text-emerald-600" />
      ),
    },

    error: {
      bg: "bg-red-50",
      border: "border-red-300",
      icon: (
        <XCircleIcon className="h-7 w-7 text-red-600" />
      ),
    },

    warning: {
      bg: "bg-amber-50",
      border: "border-amber-300",
      icon: (
        <ExclamationTriangleIcon className="h-7 w-7 text-amber-600" />
      ),
    },

    info: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      icon: (
        <InformationCircleIcon className="h-7 w-7 text-blue-600" />
      ),
    },
  };

  const style = styles[type];

  return (
    <div className="fixed right-5 top-5 z-[9999] animate-[slideIn_.25s_ease-out]">

      <div
        className={`flex w-96 items-start gap-4 rounded-2xl border p-4 shadow-xl ${style.bg} ${style.border}`}
      >

        {style.icon}

        <div className="flex-1">

          <h3 className="font-semibold text-slate-900">
            {title}
          </h3>

          {message && (
            <p className="mt-1 text-sm text-slate-600">
              {message}
            </p>
          )}

        </div>

        <button
          onClick={onClose}
          className="rounded-full p-1 hover:bg-black/5"
        >
          <XMarkIcon className="h-5 w-5 text-slate-500" />
        </button>

      </div>

    </div>
  );
}