"use client";
// src/app/payments/agreement/page.tsx
// Step 1 of the registration wizard: Safe from Harm.
// Image expected at: public/safe-from-harm.png

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AgreementPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const onNext = () => {
    if (!agreed) return;
    router.push("/payments/register");
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-14 text-zinc-900">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-3xl text-zinc-700 mb-4"
          aria-label="Go back"
        >
          &lt;
        </button>

        <h1 className="text-4xl font-bold text-green-800 mb-2">eScout</h1>
        <h2 className="text-2xl font-semibold mb-6">Register Membership</h2>

        <div className="flex items-center justify-center gap-3 text-base text-green-800 mb-8">
          <span className="flex items-center gap-2 bg-green-800 text-white rounded-full px-4 py-1.5">
            <span className="w-6 h-6 rounded-full bg-white text-green-800 flex items-center justify-center text-sm font-semibold">
              1
            </span>
            Safe from Harm
          </span>
          <span>|</span>
          <span className="w-8 h-8 rounded-full border-2 border-green-800 flex items-center justify-center">
            2
          </span>
          <span>|</span>
          <span className="w-8 h-8 rounded-full border-2 border-green-800 flex items-center justify-center">
            3
          </span>
        </div>

        <div className="flex gap-5 items-start mb-4">
          <Image
            src="/safe-from-harm.png"
            alt="Safe from Harm"
            width={100}
            height={100}
            className="w-24 h-24 object-contain shrink-0"
          />
          <p className="text-lg text-zinc-800 leading-relaxed">
            The <strong>Boy Scouts of the Philippines (BSP)</strong> prioritizes the
            safety and security of all members through its National Safeguarding
            Policy. Rooted in the Scout Oath and Law, this
          </p>
        </div>

        <p className="text-lg text-zinc-800 leading-relaxed mb-4">
          policy protects children and young people from harm while fostering a
          culture of respect, fairness, and dignity for everyone.
        </p>

        <p className="text-lg text-zinc-800 leading-relaxed mb-4">
          The full text of the National Safeguarding Policy is found{" "}
          <a href="#" className="text-blue-600 underline">
            here
          </a>
          .
        </p>

        <p className="text-lg text-zinc-800 leading-relaxed mb-6">
          By pursuing this application, I agree to be bound by the National
          Safeguarding Policy and commit to promote a safe and secure Scouting for
          everybody.
        </p>

        <label className="flex items-center gap-3 text-lg text-zinc-900 mb-10">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5"
          />
          Agree
        </label>

        <button
          onClick={onNext}
          disabled={!agreed}
          className="rounded-lg bg-green-800 hover:bg-green-900 transition-colors text-white text-lg font-medium py-3.5 px-4 w-full disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}