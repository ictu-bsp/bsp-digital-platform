"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import RegistrationStepper from "../../components/RegistrationStepper";

const clearAdultScoutDraft = () => {
  if (typeof window === "undefined") return;

  [
    "adultScoutMembershipType",
    "adultScoutMembershipCategory",
    "adultScoutRegistrationFee",
    "adultScoutDataPrivacyAgreed",
    "membershipFlow",
  ].forEach((key) => localStorage.removeItem(key));
};

export default function AdultScoutAgreementPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    clearAdultScoutDraft();
  }, []);

  const onNext = () => {
    if (!agreed) return;

    router.push("/scout/membership/membership-registration/adult-scout/membership-type");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 text-zinc-900 shadow-xl sm:p-14">
        <button
          type="button"
          onClick={() => router.push("/scout/membership")}
          className="mb-4 text-2xl text-zinc-700 sm:text-3xl"
          aria-label="Go back"
        >
          &lt;
        </button>

        <h1 className="mb-2 text-2xl font-bold text-green-800 sm:text-4xl">
          <Image
            src="/escout-logo.svg"
            alt="eScout Logo"
            width={115}
            height={115}
            className="h-auto w-[115px] object-contain"
          />
        </h1>
        <h2 className="mb-6 text-lg font-semibold sm:text-2xl">
          Adult Scout Membership Registration
        </h2>

        <RegistrationStepper
          currentStep={1}
          totalSteps={5}
          currentLabel="Agreement"
          splitAfterStep={2}
        />

        <div className="flex gap-3 sm:gap-5 items-start mb-4">
          <Image
            src="/safe-from-harm.svg"
            alt="Safe from Harm"
            width={100}
            height={100}
            className="w-16 h-16 sm:w-24 sm:h-24 object-contain shrink-0"
          />
          <p className="text-sm sm:text-lg text-zinc-800 leading-relaxed">
            The <strong>Boy Scouts of the Philippines (BSP)</strong> prioritizes the
            safety and security of all members through its National Safeguarding
            Policy. Rooted in the Scout Oath and Law, this
          </p>
        </div>

        <p className="text-sm sm:text-lg text-zinc-800 leading-relaxed mb-4">
          policy protects children and young people from harm while fostering a
          culture of respect, fairness, and dignity for everyone.
        </p>

        <p className="text-sm sm:text-lg text-zinc-800 leading-relaxed mb-4">
          The full text of the National Safeguarding Policy is found{" "}
          <a href="#" className="text-blue-600 underline">
            here
          </a>
          .
        </p>

        <p className="text-sm sm:text-lg text-zinc-800 leading-relaxed mb-6">
          By pursuing this application, I agree to be bound by the National
          Safeguarding Policy and commit to promote a safe and secure Scouting for
          everybody.
        </p>

        <label className="mb-10 flex items-center gap-3 text-sm text-zinc-900 sm:text-lg">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
          Agree
        </label>

        <button
          type="button"
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