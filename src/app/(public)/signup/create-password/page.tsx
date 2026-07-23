//src/app/(public)/signup/create-password/page.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { createPasswordAction } from "@/app/actions/auth";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

export default function CreatePasswordPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const email =
    searchParams.get("email") ?? "";

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    showConfirmDialog,
    setShowConfirmDialog,
  ] = useState(false);

  const [
    showSuccessDialog,
    setShowSuccessDialog,
  ] = useState(false);

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const createAccount = async () => {
    setShowConfirmDialog(false);

    setLoading(true);
    setError("");

    const result =
      await createPasswordAction(
        email,
        password,
        confirmPassword
      );

    setLoading(false);

    if (!result.success) {
      setError(
        result.message ??
          "Unable to create account."
      );
      return;
    }

    setShowSuccessDialog(true);
  };

  const continueToLogin = () => {
    setShowSuccessDialog(false);
    router.push("/login");
  };

  return (
        <>
      <main className="flex min-h-screen items-center justify-center bg-white md:bg-gray-50 md:p-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white px-6 pb-8 pt-4 md:shadow-sm">
          <div className="mb-6">
            <Link
              href="/signup/verify"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-green-950 transition-colors hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </Link>

            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-green-900">
              <Image
                src="/escout-logo.svg"
                alt="eScout Logo"
                width={115}
                height={115}
                className="h-auto w-[115px] object-contain"
              />
            </h1>

            <h2 className="mt-1 text-xl font-bold text-green-900">
              Create Password
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Your email has been verified.
              Create a password to finish
              setting up your account.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                required
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 p-3 pr-12 text-base outline-none transition-all focus:border-green-900 focus:ring-1 focus:ring-green-900"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm Password"
                required
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 p-3 pr-12 text-base outline-none transition-all focus:border-green-900 focus:ring-1 focus:ring-green-900"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-900 py-3.5 font-bold text-white transition-colors hover:bg-green-950 disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>
        </div>
      </main>
            {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-green-900">
              Confirm Account Creation
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Are you sure you want to create your account?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowConfirmDialog(false)
                }
                disabled={loading}
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createAccount}
                disabled={loading}
                className="rounded-lg bg-green-900 px-5 py-2.5 font-bold text-white transition hover:bg-green-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating..."
                  : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-green-900">
              Welcome to eScout!
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Your account has been created successfully.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={continueToLogin}
                className="rounded-lg bg-green-900 px-5 py-2.5 font-bold text-white transition hover:bg-green-950"
              >
                Continue to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}