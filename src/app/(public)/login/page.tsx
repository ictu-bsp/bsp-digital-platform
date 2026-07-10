"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import {
  loginAction,
  type ActionResult,
} from "@/app/actions/auth";

const initialState: ActionResult = {
  success: false,
};

export default function LoginPage() {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state.success) {
      router.push("/scout");
    }
  }, [state.success, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <form
        action={formAction}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-md"
      >
        <Image
          src="/escout-logo.svg"
          alt="eScout Logo"
          width={115}
          height={115}
          className="h-auto w-[115px] object-contain"
        />

        <h2 className="mb-6 text-2xl font-semibold text-green-900">
          Login
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
          name="email"
          type="email"
          placeholder="Email Address"
          required
          autoComplete="email"
          className="mb-4 w-full rounded border border-gray-300 p-3 transition focus:border-green-700 focus:outline-none"
        />

        {state.errors?.email && (
          <p className="mb-4 text-sm text-red-600">
            {state.errors.email[0]}
          </p>
        )}

        <div className="relative mb-6">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            autoComplete="current-password"
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
          <p className="mb-4 text-sm text-red-600">
            {state.errors.password[0]}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-8 w-full rounded bg-green-900 p-3 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Logging In..." : "Log In"}
        </button>

        <p className="my-4 text-center text-sm text-gray-500">
          or
        </p>

        <p className="text-center text-sm text-gray-500">
          Don't have an <Image
          src="/escout-logo.svg"
          alt="eScout Logo"
          width={60}
          height={60}
          className="inline-block mb-1.5"
        /> account yet?
        </p>

        <Link href="/signup">
          <button
            type="button"
            className="mt-3 w-full rounded border border-gray-300 p-3 font-semibold text-green-900 hover:bg-gray-100"
          >
            Sign Up
          </button>
        </Link>
      </form>
    </main>
  );
}