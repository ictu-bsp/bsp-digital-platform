//src/app/scout/components/VerifyPasswordModal.tsx

"use client";

import { useState } from "react";
import { verifyCurrentPasswordAction } from "@/app/actions/auth";

interface VerifyPasswordModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function VerifyPasswordModal({
  onSuccess,
  onClose,
}: VerifyPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const result =
      await verifyCurrentPasswordAction(password);

    setLoading(false);

    if (!result.success) {
      setError(result.message ?? "Incorrect password.");
      return;
    }

    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">

        <h2 className="text-2xl font-bold text-green-900">
          Verify Password
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Please enter your current password before editing your account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Current Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full rounded-xl border px-4 py-3 pr-16"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-3 text-sm text-green-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border py-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-green-900 py-3 font-semibold text-white"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}