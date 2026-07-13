"use client";

import { useActionState, useEffect, useState,} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon,} from "@heroicons/react/24/outline";

import {loginAction,type ActionResult,} from "@/app/actions/auth";

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
    <main className="flex min-h-screen flex-col bg-#f4f6f3 md:flex-row md:items-stretch">
      <section className="w-full md:w-[46%] md:min-h-screen">
        <div className="relative h-[300px] w-full sm:h-[400px] md:h-full">
          <Image
            src="/bsp-landingpage-bg2.svg"
            alt="bsp-landingpage-backdrop"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>
      </section>

      <section className="flex w-full md:flex-1 items-center justify-center px-6 py-8 sm:px-8 md:px-10 lg:px-16">
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/bsp-landingpage-bg2.svg"
          alt="Form Background Backdrop"
          fill
          priority
          className="object-cover object-center blur-md opacity-30 scale-105"
        />
        
        </div>
        <form
          action={formAction}
          className="relative z-10 w-full max-w-md rounded-2xl bg-[#ffffff] p-8 shadow-2xl border border-gray-100"
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

          <div className="relative mb-4">
            <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-900" />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              autoComplete="email"
              className="w-full rounded border border-gray-300 bg-white py-3 pl-10 pr-3 transition focus:border-green-700 focus:outline-none"
            />
          </div>

          {state.errors?.email && (
            <p className="mb-4 text-sm text-red-600">
              {state.errors.email[0]}
            </p>
          )}

          <div className="relative mb-6">
            <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-900" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full rounded border border-gray-300 bg-white py-3 pl-10 pr-12 transition focus:border-green-700 focus:outline-none"
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
                <EyeIcon className="h-5 w-5 text-green-900" />
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

          <p className="my-4 text-center text-sm text-gray-500">or</p>

          <p className="text-center text-sm text-gray-500">
            Don't have an{" "}
            <Image
              src="/escout-logo.svg"
              alt="eScout Logo"
              width={60}
              height={60}
              className="mb-1.5 inline-block"
            />{" "}
            account yet?
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
      </section>
    </main>
  );
}