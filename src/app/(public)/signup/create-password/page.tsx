"use client";

import Link from "next/link";
import { useState } from "react";
import { createPasswordAction, } from "@/app/actions/auth";
import { useRouter, useSearchParams, } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function CreatePasswordPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

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

    alert(
      "Account created successfully!"
    );

    router.push("/login");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white md:bg-gray-50 md:p-6">
      <div className="w-full max-w-md bg-white px-6 pb-8 pt-4 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm">
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
            eScout
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
  );
}