"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import RegistrationStepper from "../../components/RegistrationStepper";

const membershipCategories = [
  "National Member at Large",
  "LCEB Member",
  "NEB Member",
  "Council Scout Executive",
  "Lifetime Member Bronze",
  "Lifetime Member Silver",
  "Lifetime Member Gold",
  "Lifetime Member Platinum",
];

const membershipFees: Record<string, string> = {
  "National Member at Large": "₱500.00",
  "LCEB Member": "₱500.00",
  "Council Scout Executive": "₱500.00",
  "NEB Member": "₱2,000.00",
  "Lifetime Member Bronze": "₱12,000.00",
  "Lifetime Member Silver": "₱25,000.00",
  "Lifetime Member Gold": "₱50,000.00",
  "Lifetime Member Platinum": "₱100,000.00",
};

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

export default function AdultScoutMembershipTypePage() {
  const router = useRouter();
  const [membershipType, setMembershipType] = useState("");
  const [membershipCategory, setMembershipCategory] = useState("");

  useEffect(() => {
    clearAdultScoutDraft();
  }, []);

  useEffect(() => {
    localStorage.setItem("adultScoutMembershipType", membershipType);
    localStorage.setItem("adultScoutMembershipCategory", membershipCategory);
  }, [membershipType, membershipCategory]);

  useEffect(() => {
    if (!membershipCategory) {
      localStorage.removeItem("adultScoutRegistrationFee");
      return;
    }

    const selectedFee = membershipFees[membershipCategory] ?? "";
    if (selectedFee) {
      localStorage.setItem("adultScoutRegistrationFee", selectedFee);
    } else {
      localStorage.removeItem("adultScoutRegistrationFee");
    }
  }, [membershipCategory]);

  const selectedFee = membershipCategory ? membershipFees[membershipCategory] ?? "" : "";

  const onNext = () => {
    if (membershipType === "" || membershipCategory === "" || selectedFee === "") return;

    localStorage.setItem("membershipFlow", "adult_scout");
    router.push("/scout/membership/membership-registration/adult-scout/personal-info");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 text-zinc-900 shadow-xl sm:p-14">
        <button
          type="button"
          onClick={() => router.push("/scout/membership/membership-registration/adult-scout/agreement")}
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
          currentStep={2}
          totalSteps={5}
          currentLabel="Membership Type"
          splitAfterStep={2}
        />

        <div className="mb-6 grid gap-5">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-green-800">
              Membership Type
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-zinc-900 transition hover:border-green-700">
                <input
                  type="radio"
                  name="adult-scout-membership-type"
                  value="new"
                  checked={membershipType === "new"}
                  onChange={(event) => setMembershipType(event.target.value)}
                  className="h-4 w-4 accent-green-800"
                />
                <span>NEW (Adult Scout)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-zinc-900 transition hover:border-green-700">
                <input
                  type="radio"
                  name="adult-scout-membership-type"
                  value="renewal"
                  checked={membershipType === "renewal"}
                  onChange={(event) => setMembershipType(event.target.value)}
                  className="h-4 w-4 accent-green-800"
                />
                <span>RENEWAL (Adult Scout)</span>
              </label>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-green-800">
              Membership Category
            </p>
            <select
              value={membershipCategory}
              onChange={(event) => setMembershipCategory(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-green-700"
              required
            >
              <option value="" disabled>
                Select membership category
              </option>
              {membershipCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-4 sm:px-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-800">
              Registration Fee
            </p>
            <p className="mt-3 text-sm font-medium text-zinc-700">
              Fee shown to the user for this selected category
            </p>
            <p className="mt-2 text-base font-semibold text-zinc-900">
              {selectedFee || "Select a category to view the fee"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 sm:px-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-800">
              Data Privacy Disclaimer
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700 sm:text-base">
              This area is reserved for the adult scout data privacy disclaimer.
              Replace this copy with the final privacy notice before launch.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={membershipType === "" || membershipCategory === "" || selectedFee === ""}
          className="w-full rounded-lg bg-green-800 px-4 py-3.5 text-lg font-medium text-white transition-colors hover:bg-green-900 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}