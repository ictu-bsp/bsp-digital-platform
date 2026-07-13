"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmailAction, resendVerificationAction } from "@/app/actions/auth";

// 1. We move the form logic into its own inner component that safely reads parameters
function VerificationFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await verifyEmailAction(email, verificationCode);
    setLoading(false);

    if (!result.success) {
      setError(result.message ?? "Verification failed.");
      return;
    }

    // Now safely executes on a healthy client router context
    router.push(`/signup/create-password?email=${encodeURIComponent(email)}`);
  };

  const handleResendCode = async () => {
    const result = await resendVerificationAction(email);
    if (result.success) {
      alert("A new verification code has been sent.");
    } else {
      alert(result.message ?? "Unable to resend verification code.");
    }
  };

  return (
    <>
      <p className="text-sm leading-relaxed text-gray-500">
        We've sent a verification code to{" "}
        <span className="font-bold text-gray-800">{email}</span>. Enter the 6-digit code below to continue creating your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col justify-between">
        <div className="space-y-3">
          <input
            type="text"
            name="verificationCode"
            placeholder="Enter 6-digit code"
            required
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3.5 text-base outline-none transition-all focus:border-green-900 focus:ring-1 focus:ring-green-900 placeholder:text-gray-400"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleResendCode}
            className="cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-green-800 hover:text-green-950 hover:underline"
          >
            Resend code
          </button>
        </div>

        <div className="mt-auto pt-8 text-center space-y-3">
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Not your email?</p>
            <Link
              href="/signup"
              className="inline-block text-sm font-bold text-green-800 hover:text-green-950 hover:underline"
            >
              Click to edit your email
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-900 py-3.5 text-center font-bold text-white transition-colors hover:bg-green-950 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </div>
      </form>
    </>
  );
}

// 2. Main structural page that encapsulates everything inside a Suspense Boundary
export default function EmailVerificationPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white md:bg-gray-50 md:p-6">
      <div className="flex h-screen w-full max-w-md flex-col bg-white px-6 pb-8 pt-4 md:h-auto md:min-h-[600px] md:rounded-2xl md:border md:border-gray-100 md:shadow-sm">
        
        {/* Top Navigation & Brand Header */}
        <div className="mb-6">
          <Link
            href="/signup"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-green-950 transition-colors hover:bg-gray-100"
            aria-label="Go back to registration"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-green-900">eScout</h1>
          <h2 className="mt-1 text-xl font-bold text-green-900">Email Verification</h2>
        </div>

        {/* Suspense Wrapper catches and prevents client router freezing during hydration */}
        <Suspense fallback={<p className="text-sm text-gray-400">Loading details...</p>}>
          <VerificationFormInner />
        </Suspense>

      </div>
    </main>
  );
}