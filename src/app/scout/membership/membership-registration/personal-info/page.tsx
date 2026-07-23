"use client";
// src/app/scout/membership/membership-registration/personal-info/page.tsx
// Step 2 of the registration wizard: Personal & Emergency Contact Info.
// DOB, sex, and email are NOT collected here — they already exist on the
// `users` table from signup. This page only collects fields that don't
// exist anywhere in the schema yet (blood type, address, telephone,
// emergency contact). These get stashed in localStorage and picked up
// by register/page.tsx's onNext, which merges them into the
// submitApplicationAction call (serialized into scoutApplications.remarks
// as a temporary workaround until Reuben adds real columns).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useWizard } from "../WizardContext";
import RegistrationStepper from "../components/RegistrationStepper";

const fieldShellClass = (filled: boolean) =>
  `w-full rounded-lg py-3 text-lg border transition-colors ${
    filled
      ? "border-green-600 bg-green-50 text-zinc-900"
      : "border-zinc-300 bg-white text-zinc-400"
  }`;

// Strips anything that isn't a digit, then caps length at 11
// (PH mobile format: 09XXXXXXXXX). Used on phone-type fields only.


const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, 11);

const RELATIONSHIP_OPTIONS = [
  "Parent",
  "Legal Guardian",
  "Sibling",
  "Spouse",
  "Partner",
  "Extended Family Member",
  "Friend",
  "Child",
  "Other",
];

export default function PersonalInfoPage() {
  const router = useRouter();
  const [isAdultScoutFlow, setIsAdultScoutFlow] = useState(false);

  useEffect(() => {
    setIsAdultScoutFlow(localStorage.getItem("membershipFlow") === "adult_scout");
  }, []);

  const {
    bloodType,
    setBloodType,
    address,
    setAddress,
    telephone,
    setTelephone,
    emergencyContactName,
    setEmergencyContactName,
    emergencyContactRelationship,
    setEmergencyContactRelationship,
    emergencyContactNumber,
    setEmergencyContactNumber,
  } = useWizard();

  // Warn the user before they reload/close the tab if they've started
  // filling out this step — prevents silent loss of entered info.
  useEffect(() => {
    const hasUnsavedData =
      bloodType !== "" ||
      address !== "" ||
      telephone !== "" ||
      emergencyContactName !== "" ||
      emergencyContactRelationship !== "" ||
      emergencyContactNumber !== "";

    if (!hasUnsavedData) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    bloodType,
    address,
    telephone,
    emergencyContactName,
    emergencyContactRelationship,
    emergencyContactNumber,
  ]);

  const onNext = (event: React.FormEvent) => {
    event.preventDefault();
    // Fields already live in WizardContext via the setters above —
    // nothing to persist here. register/page.tsx reads them straight
    // from the same context at final submit.
    router.push("/scout/membership/membership-registration/register");
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
      <form
        onSubmit={onNext}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-14 text-zinc-900 flex flex-col gap-5"
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="text-3xl text-zinc-700 mb-1 self-start"
          aria-label="Go back"
        >
          &lt;
        </button>

        <h1 className="text-4xl font-bold text-green-800 mb-0">
          <Image
            src="/escout-logo.svg"
            alt="eScout Logo"
            width={115}
            height={115}
            className="h-auto w-[115px] object-contain"
          />
        </h1>
        <h2 className="text-2xl font-semibold mb-4">Register Membership</h2>

        <RegistrationStepper
          currentStep={isAdultScoutFlow ? 3 : 2}
          totalSteps={isAdultScoutFlow ? 5 : 4}
          currentLabel="Personal Info"
          splitAfterStep={isAdultScoutFlow ? 2 : undefined}
        />

        {/* Blood Type */}
        <div className="relative">
          <select
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            className={`${fieldShellClass(bloodType !== "")} appearance-none pl-4 pr-16`}
            required
          >
            <option value="" disabled className="text-zinc-400">
              Blood Type
            </option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "N/A"].map((bt) => (
              <option key={bt} value={bt} className="text-zinc-900">
                {bt}
              </option>
            ))}
          </select>
          {bloodType !== "" && (
            <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>

        {/* Address */}
        <div className="relative">
          <input
            placeholder="Address"
            className={`${fieldShellClass(address !== "")} pl-4 pr-10`}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          {address !== "" && (
            <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>

        {/* Telephone Number */}
        <div className="relative">
          <input
            placeholder="Contact Number"
            inputMode="numeric"
            maxLength={11}
            className={`${fieldShellClass(telephone.length === 11)} pl-4 pr-10`}
            value={telephone}
            onChange={(e) => setTelephone(digitsOnly(e.target.value))}
            required
          />
          {telephone.length === 11 && (
            <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>
        {telephone !== "" && telephone.length < 11 && (
          <p className="text-xs text-amber-600 -mt-3">
            Enter a full 11-digit number (e.g. 09171234567)
          </p>
        )}

        <hr className="my-2" />
        <label className="block text-lg font-medium -mb-2">
          Emergency Contact
        </label>

        {/* Emergency Contact Name */}
        <div className="relative">
          <input
            placeholder="Emergency Contact Name"
            className={`${fieldShellClass(emergencyContactName !== "")} pl-4 pr-10`}
            value={emergencyContactName}
            onChange={(e) => setEmergencyContactName(e.target.value)}
            required
          />
          {emergencyContactName !== "" && (
            <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Emergency Contact Relationship */}
        <div>
          <div className="relative">
            <select
              value={emergencyContactRelationship}
              onChange={(e) => setEmergencyContactRelationship(e.target.value)}
              className={`${fieldShellClass(emergencyContactRelationship !== "")} appearance-none pl-4 pr-16`}
              required
            >
              <option value="" disabled className="text-zinc-400">
                Relationship
              </option>
              {RELATIONSHIP_OPTIONS.map((rel) => (
                <option key={rel} value={rel} className="text-zinc-900">
                  {rel}
                </option>
              ))}
            </select>
            {emergencyContactRelationship !== "" && (
              <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
          </div>
          {emergencyContactRelationship === "Extended Family Member" && (
            <p className="text-xs text-zinc-500 mt-1">
              e.g., Uncle, Aunt, Cousin, Grandparent, etc.
            </p>
          )}
        </div>

          {/* Emergency Contact Number */}
        <div>
          <div className="relative">
            <input
              placeholder="Contact Number"
              inputMode="numeric"
              maxLength={11}
              className={`${fieldShellClass(emergencyContactNumber.length === 11)} pl-4 pr-10`}
              value={emergencyContactNumber}
              onChange={(e) => setEmergencyContactNumber(digitsOnly(e.target.value))}
              required
            />
            {emergencyContactNumber.length === 11 && (
              <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
          </div>
          {emergencyContactNumber !== "" && emergencyContactNumber.length < 11 && (
            <p className="text-xs text-amber-600 mt-1">
              Enter a full 11-digit number (e.g. 09171234567)
            </p>
          )}
        </div>
        </div>

       

        <button
          type="submit"
          className="rounded-lg bg-green-800 hover:bg-green-900 transition-colors text-white text-lg font-medium py-3.5 px-4 mt-2"
        >
          Next
        </button>
      </form>
    </div>
  );
}