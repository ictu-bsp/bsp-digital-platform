//src/app/scout/components/VerifyPasswordModal.tsx

"use client";

import { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

import { verifyCurrentPasswordAction } from "@/app/actions/auth";

interface VerifyPasswordModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function VerifyPasswordModal({
  onSuccess,
  onClose,
}: VerifyPasswordModalProps) {

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result =
        await verifyCurrentPasswordAction(
          password
        );

      if (!result.success) {
        setError(
          result.message ??
            "Incorrect password."
        );
        return;
      }

      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">

        <h2 className="text-2xl font-bold text-green-900">
          Verify Password
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          For your security, please confirm your
          current password before you can edit your
          profile.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Current Password
            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
                autoFocus
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-green-900 focus:ring-1 focus:ring-green-900"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-green-900"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>

            </div>
                        {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}

          </div>

          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-300 py-3 font-semibold transition hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                password.trim() === ""
              }
              className="flex-1 rounded-xl bg-green-900 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Verifying..."
                : "Continue"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}