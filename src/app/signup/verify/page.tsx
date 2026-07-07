"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EmailVerificationPage() {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted Verification Code:", verificationCode);

    alert("Verification Successful!");
    router.push("/login"); // Directs them to login or dashboard once verified
  };

  const handleResendCode = () => {
    alert("A new 6-digit verification code has been sent!");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white md:bg-gray-50 md:p-6">
      {/* Outer Card Wrapper - Standard full mobile screen, scales into a clean card layout on PC */}
      <div className="flex h-screen w-full max-w-md flex-col bg-white px-6 pb-8 pt-4 md:h-auto md:min-h-[600px] md:rounded-2xl md:shadow-sm md:border md:border-gray-100">
        
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
          
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-green-900">
            eScout
          </h1>
          <h2 className="mt-1 text-xl font-bold text-green-900">
            Email Verification
          </h2>
        </div>

        {/* Informational Subtext */}
        <p className="text-sm leading-relaxed text-gray-500">
          We&apos;ve sent an email to <span className="font-bold text-gray-800">juandelacruz@scouts.com</span> containing a 6-digit code. Please also check your junk or spam folders.
        </p>

        {/* Verification Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col justify-between">
          
          {/* Top Form Field Area */}
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
            
            <button
              type="button"
              onClick={handleResendCode}
              className="block text-sm font-bold text-green-800 hover:text-green-950 hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Resend code
            </button>
          </div>

          {/* Bottom Pinned Footer Actions */}
          <div className="mt-auto pt-8 text-center space-y-3">
            <div className="space-y-0.5">
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
              className="w-full rounded-lg bg-green-900 py-3.5 text-center font-bold text-white transition-colors hover:bg-green-950 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              Next
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}