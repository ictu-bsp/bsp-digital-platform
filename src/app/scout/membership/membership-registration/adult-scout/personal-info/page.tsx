"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import BackButton from "@/components-general/ui/BackButton";
import { useWizard } from "../../WizardContext";
import RegistrationStepper from "../../components/RegistrationStepper";

const fieldShellClass = (filled: boolean) =>
  `w-full rounded-lg py-3 text-lg border transition-colors ${
    filled
      ? "border-green-600 bg-green-50 text-zinc-900"
      : "border-zinc-300 bg-white text-zinc-400"
  }`;

const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, 11);

export default function AdultScoutPersonalInfoPage() {
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

  const onNext = (event: React.FormEvent) => {
    event.preventDefault();
    router.push("/scout/membership/membership-registration/adult-scout/register");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-6 sm:px-6 sm:py-10">
      <form
        onSubmit={onNext}
        className="w-full max-w-3xl rounded-2xl bg-white p-6 text-zinc-900 shadow-xl sm:p-14"
      >
        <div className="mb-4">
          <BackButton onClick={() => router.back()} />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-green-800 sm:text-4xl">
          <Image
            src="/escout-logo.svg"
            alt="eScout Logo"
            width={115}
            height={115}
            className="h-auto w-[115px] object-contain"
          />
        </h1>
        <h2 className="mb-6 text-lg font-semibold sm:text-2xl">Adult Scout Registration</h2>

        <RegistrationStepper
          currentStep={isAdultScoutFlow ? 3 : 3}
          totalSteps={5}
          currentLabel="Personal Info"
          splitAfterStep={2}
        />

        <div className="mb-6 flex flex-col gap-4">
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
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                <option key={bt} value={bt} className="text-zinc-900">
                  {bt}
                </option>
              ))}
            </select>
            {bloodType !== "" && (
              <CheckCircleIcon className="pointer-events-none absolute right-9 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
          </div>

          <div className="relative">
            <input
              placeholder="Address"
              className={`${fieldShellClass(address !== "")} pl-4 pr-10`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            {address !== "" && (
              <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
          </div>

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
              <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
          </div>
          {telephone !== "" && telephone.length < 11 && (
            <p className="-mt-2 text-xs text-amber-600">
              Enter a full 11-digit number (e.g. 09171234567)
            </p>
          )}

          <hr className="my-2" />
          <label className="-mb-2 block text-lg font-medium">Emergency Contact</label>

          <div className="relative">
            <input
              placeholder="Emergency Contact Name"
              className={`${fieldShellClass(emergencyContactName !== "")} pl-4 pr-10`}
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
              required
            />
            {emergencyContactName !== "" && (
              <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <input
                placeholder="Relationship"
                className={`${fieldShellClass(emergencyContactRelationship !== "")} pl-4 pr-10`}
                value={emergencyContactRelationship}
                onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                required
              />
              {emergencyContactRelationship !== "" && (
                <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
              )}
            </div>

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
                <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-green-800 px-4 py-3.5 text-lg font-medium text-white transition-colors hover:bg-green-900"
        >
          Next
        </button>
      </form>
    </div>
  );
}
