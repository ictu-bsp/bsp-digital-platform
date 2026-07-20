//src/components-general/ui/SuccessOverlay.tsx

"use client";

import { useEffect } from "react";
import Image from "next/image";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

import LoadingSpinner from "./LoadingSpinner";

interface SuccessOverlayProps {
  open: boolean;

  title: string;

  message?: string;

  subtitle?: string;

  avatarUrl?: string | null;

  duration?: number;

  onComplete?: () => void;
}

export default function SuccessOverlay({
  open,
  title,
  message,
  subtitle,
  avatarUrl,
  duration = 1800,
  onComplete,
}: SuccessOverlayProps) {
  useEffect(() => {
    if (!open || !onComplete) return;

    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [open, duration, onComplete]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">

        <div className="flex flex-col items-center text-center">

          <CheckCircleIcon className="h-20 w-20 text-emerald-600" />

          {avatarUrl && (
            <div className="relative mt-5 h-20 w-20 overflow-hidden rounded-full ring-4 ring-emerald-100">
              <Image
                src={avatarUrl}
                alt="Avatar"
                fill
                className="object-cover"
              />
            </div>
          )}

          <h2 className="mt-6 text-2xl font-bold text-emerald-800">
            {title}
          </h2>

          {message && (
            <p className="mt-2 text-base text-slate-700">
              {message}
            </p>
          )}

          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          )}

          <LoadingSpinner
            size="md"
            className="mt-8"
          />

        </div>
      </div>
    </div>
  );
}