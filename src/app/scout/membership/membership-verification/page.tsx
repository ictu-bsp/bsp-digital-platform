"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MembershipVerificationPage() {
  const router = useRouter();
  const [scoutId, setScoutId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted Scout ID:", scoutId);

    alert("Verification processing...");
    router.push("/scout/membership/verification-pending");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] md:p-6">
      <div className="flex h-screen w-full max-w-md flex-col bg-white px-6 pb-8 pt-4 md:h-auto md:min-h-[600px] md:rounded-2xl md:border md:border-gray-100 md:shadow-sm">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/scout/profile")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-green-950 transition-colors hover:bg-gray-100"
            aria-label="Go back to profile"
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
          </button>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-green-900">
            <Image
              src="/escout-logo.svg"
              alt="Verification pending"
              width={115}
              height={115}
              className="inline-block"
            />
          </h1>
          <h2 className="mt-1 text-xl font-bold text-green-900">
            Membership Verification
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-gray-500">
          Enter your scout ID to verify your membership and unlock other features. Don't worry if you don't have it handy—you can have this on your membership card ID or request it from your local council.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col justify-between">
          <div className="space-y-3">
            <input
              type="text"
              name="scoutId"
              placeholder="Enter Scout ID"
              required
              value={scoutId}
              onChange={(e) => setScoutId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3.5 text-base outline-none transition-all focus:border-green-900 focus:ring-1 focus:ring-green-900 placeholder:text-gray-400"
            />
          </div>

          <div className="mt-auto pt-8">

            <button
              type="submit"
              className="w-full rounded-lg bg-green-900 py-3.5 text-center font-bold text-white transition-colors hover:bg-green-950 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
