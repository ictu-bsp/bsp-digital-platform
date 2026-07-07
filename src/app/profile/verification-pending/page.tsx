"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function VerificationPendingPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-white md:bg-gray-50 md:p-6">
      <div className="flex min-h-screen w-full max-w-md flex-col bg-white px-6 pb-8 pt-4 md:min-h-[650px] md:rounded-2xl md:border md:border-gray-100 md:shadow-sm">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-green-950 transition-colors hover:bg-gray-100"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-green-900">
            eScout
          </h1>
          <h2 className="mt-1 text-xl font-bold text-green-900">
            Membership Verification
          </h2>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
          <Image
            src="/sand-clock 1.svg"
            alt="Verification pending"
            width={36}
            height={36}
            className="mb-5"
          />

          <h3 className="text-2xl font-bold text-green-900">Almost there!</h3>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
            Your membership verification is in progress. This typically takes 12-24 hours. You'll receive a notification as soon as your account is fully verified.
          </p>
        </div>

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-lg border border-green-900 bg-white py-3.5 text-center font-bold text-green-900 transition-colors hover:bg-green-50"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
