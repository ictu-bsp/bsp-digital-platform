"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import {
  signUpAction,
  type ActionResult,
} from "@/app/actions/auth";

const initialState: ActionResult = {
  success: false,
};

export default function SignupPage() {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialState
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  useEffect(() => {
    if (state.success) {
      alert("Account created successfully!");
      router.push("/login");
    }
  }, [state.success, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <form
        action={formAction}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="text-5xl font-bold text-green-900">
          eScout
        </h1>

        <h2 className="mb-8 text-2xl font-semibold text-green-900">
          Create Account
        </h2>

        {state.message && (
          <div
            className={`mb-5 rounded p-3 text-sm ${
              state.success
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {state.message}
          </div>
        )}

        <input
          name="firstName"
          placeholder="First Name"
          required
          className="mb-2 w-full rounded border border-gray-300 p-3 transition focus:border-green-700 focus:outline-none"
        />

        {state.errors?.firstName && (
          <p className="mb-3 text-sm text-red-600">
            {state.errors.firstName[0]}
          </p>
        )}

        <input
          name="middleName"
          placeholder="Middle Name (Optional)"
          className="mb-2 w-full rounded border border-gray-300 p-3 transition focus:border-green-700 focus:outline-none"
        />

        {state.errors?.middleName && (
          <p className="mb-3 text-sm text-red-600">
            {state.errors.middleName[0]}
          </p>
        )}

        <input
          name="lastName"
          placeholder="Last Name"
          required
          className="mb-2 w-full rounded border border-gray-300 p-3 transition focus:border-green-700 focus:outline-none"
        />

        {state.errors?.lastName && (
          <p className="mb-3 text-sm text-red-600">
            {state.errors.lastName[0]}
          </p>
        )}
        
        <input
            name="suffix"
            placeholder="Suffix (Jr., Sr., II, III)"
            className="mb-2 w-full rounded border border-gray-300 p-3 transition focus:border-green-700 focus:outline-none"
        />

        {state.errors?.suffix && (
          <p className="mb-3 text-sm text-red-600">
            {state.errors.suffix[0]}
          </p>
        )}

        <input
          name="birthdate"
          type="date"
          required
          className="mb-2 w-full rounded border border-gray-300 p-3 transition focus:border-green-700 focus:outline-none"
        />

        {state.errors?.birthdate && (
          <p className="mb-3 text-sm text-red-600">
            {state.errors.birthdate[0]}
          </p>
        )}

        <input
          name="email"
          type="email"
          placeholder="Email Address"
          required
          autoComplete="email"
          className="mb-2 w-full rounded border border-gray-300 p-3 transition focus:border-green-700 focus:outline-none"
        />

        {state.errors?.email && (
          <p className="mb-3 text-sm text-red-600">
            {state.errors.email[0]}
          </p>
        )}

        <div className="relative mb-2">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            autoComplete="new-password"
            className="w-full rounded border border-gray-300 p-3 pr-12 transition focus:border-green-700 focus:outline-none"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute inset-y-0 right-3 flex items-center"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {state.errors?.password && (
          <p className="mb-3 text-sm text-red-600">
            {state.errors.password[0]}
          </p>
        )}

        <div className="relative mb-2">
          <input
            name="confirmPassword"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            placeholder="Confirm Password"
            required
            autoComplete="new-password"
            className="w-full rounded border border-gray-300 p-3 pr-12 transition focus:border-green-700 focus:outline-none"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
            className="absolute inset-y-0 right-3 flex items-center"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {state.errors?.confirmPassword && (
          <p className="mb-4 text-sm text-red-600">
            {state.errors.confirmPassword[0]}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded bg-green-900 p-3 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Creating Account..."
            : "Sign Up"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an eScout account?
        </p>

        <Link href="/login">
          <button
            type="button"
            className="mt-3 w-full rounded border border-gray-300 p-3 font-semibold text-green-900 hover:bg-gray-100"
          >
            Log In
          </button>
        </Link>
      </form>
    </main>
  );
}