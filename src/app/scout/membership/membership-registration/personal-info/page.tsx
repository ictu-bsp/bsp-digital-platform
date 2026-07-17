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

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const fieldShellClass = (filled: boolean) =>
  `w-full rounded-lg py-3 text-lg border transition-colors ${
    filled
      ? "border-green-600 bg-green-50 text-zinc-900"
      : "border-zinc-300 bg-white text-zinc-400"
  }`;

// Strips anything that isn't a digit, then caps length at 11
// (PH mobile format: 09XXXXXXXXX). Used on phone-type fields only.
const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, 11);

// Reads a previously-saved value back out of localStorage so that
// navigating back into this step mid-flow doesn't wipe what the user
// already typed. Guarded for SSR since localStorage doesn't exist
// server-side (useState initializers can run during the initial
// render, so this must be safe to call in both environments).
const readSaved = (key: string) => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) ?? "";
};

export default function PersonalInfoPage() {
  const router = useRouter();

  const [bloodType, setBloodType] = useState(() => readSaved("personalBloodType"));
  const [address, setAddress] = useState(() => readSaved("personalAddress"));
  const [telephone, setTelephone] = useState(() => readSaved("personalTelephone"));
  const [emergencyContactName, setEmergencyContactName] = useState(() =>
    readSaved("personalEmergencyContactName")
  );
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState(() =>
    readSaved("personalEmergencyContactRelationship")
  );
  const [emergencyContactNumber, setEmergencyContactNumber] = useState(() =>
    readSaved("personalEmergencyContactNumber")
  );

  const onNext = (event: React.FormEvent) => {
    event.preventDefault();

    localStorage.setItem("personalBloodType", bloodType);
    localStorage.setItem("personalAddress", address);
    localStorage.setItem("personalTelephone", telephone);
    localStorage.setItem("personalEmergencyContactName", emergencyContactName);
    localStorage.setItem(
      "personalEmergencyContactRelationship",
      emergencyContactRelationship
    );
    localStorage.setItem(
      "personalEmergencyContactNumber",
      emergencyContactNumber
    );

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

        <div className="flex items-center justify-center gap-3 text-base text-green-800 mb-4">
          <span className="w-8 h-8 rounded-full border-2 border-green-800 flex items-center justify-center">
            1
          </span>
          <span>|</span>
          <span className="flex items-center gap-2 bg-green-800 text-white rounded-full px-4 py-1.5">
            <span className="w-6 h-6 rounded-full bg-white text-green-800 flex items-center justify-center text-sm font-semibold">
              2
            </span>
            Personal Info
          </span>
          <span>|</span>
          <span className="w-8 h-8 rounded-full border-2 border-green-800 flex items-center justify-center">
            3
          </span>
          <span>|</span>
          <span className="w-8 h-8 rounded-full border-2 border-green-800 flex items-center justify-center">
            4
          </span>
        </div>

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
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
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
            placeholder="Telephone Number (e.g. 09171234567)"
            inputMode="numeric"
            maxLength={11}
            className={`${fieldShellClass(telephone !== "")} pl-4 pr-10`}
            value={telephone}
            onChange={(e) => setTelephone(digitsOnly(e.target.value))}
            required
          />
          {telephone !== "" && (
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
          <div className="relative">
            <input
              placeholder="Relationship"
              className={`${fieldShellClass(emergencyContactRelationship !== "")} pl-4 pr-10`}
              value={emergencyContactRelationship}
              onChange={(e) => setEmergencyContactRelationship(e.target.value)}
              required
            />
            {emergencyContactRelationship !== "" && (
              <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
          </div>

          {/* Emergency Contact Number */}
          <div className="relative">
            <input
              placeholder="Contact Number (e.g. 09171234567)"
              inputMode="numeric"
              maxLength={11}
              className={`${fieldShellClass(emergencyContactNumber !== "")} pl-4 pr-10`}
              value={emergencyContactNumber}
              onChange={(e) => setEmergencyContactNumber(digitsOnly(e.target.value))}
              required
            />
            {emergencyContactNumber !== "" && (
              <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
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