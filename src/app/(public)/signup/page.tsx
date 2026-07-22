//src/app/(public)/signup/page.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/app/actions/auth";

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    birthdate: "",
    gender: "",
    email: "",
    noMiddleName: false,
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const fieldValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
      ...(name === "noMiddleName" && fieldValue
        ? { middleName: "" }
        : {}),
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const submitRegistration = async () => {
    setShowConfirmDialog(false);

    setIsSubmitting(true);
    setErrors({});

    const data = new FormData();

    data.append("firstName", formData.firstName);
    data.append("middleName", formData.middleName);
    data.append("lastName", formData.lastName);
    data.append("suffix", formData.suffix);
    data.append("birthdate", formData.birthdate);
    data.append("gender", formData.gender);
    data.append("email", formData.email);

    const result = await signUpAction(
      { success: false },
      data
    );

    setIsSubmitting(false);

    if (!result.success) {
      setErrors(result.errors ?? {});
      return;
    }

    router.push(
      `/signup/verify?email=${encodeURIComponent(
        formData.email
      )}`
    );
  };

  return (
        <>
      <main className="flex min-h-screen items-center justify-center bg-white md:bg-gray-50 md:p-6">
        <div className="w-full max-w-md bg-white px-6 pb-8 pt-4 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm">
          {/* Top Navigation & Brand Header */}
          <div className="mb-6">
            <Link
              href="/"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </Link>

            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-green-900">
              <Image
                src="/escout-logo.svg"
                alt="eScout Logo"
                width={115}
                height={115}
                className="h-auto w-[115px] object-contain"
              />
            </h1>

            <h2 className="mt-1 text-xl font-bold text-green-900">
              Create New Account
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Enter your information to receive a verification code.
              You'll create your password after verifying your email.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {errors.root && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {errors.root[0]}
              </div>
            )}

            {/* Row 1: Last Name & Suffix Split */}
            <div>
              <div className="flex gap-3">
                <div className="w-[70%]">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border p-3 text-base outline-none transition-all focus:ring-1 placeholder:text-gray-400 ${
                      errors.lastName
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-green-900 focus:ring-green-900"
                    }`}
                  />
                </div>

                <div className="w-[30%]">
                  <select
                    name="suffix"
                    value={formData.suffix}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border bg-white p-3 text-base text-gray-700 outline-none transition-all focus:ring-1 ${
                      errors.suffix
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-green-900 focus:ring-green-900"
                    }`}
                  >
                    <option value="" disabled hidden>
                      Suffix
                    </option>
                    <option value="Jr.">Jr.</option>
                    <option value="Sr.">Sr.</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                </div>
              </div>

              {errors.lastName && (
                <p className="mt-1 pl-1 text-xs text-red-600">
                  {errors.lastName[0]}
                </p>
              )}
            </div>

            {/* First Name */}
            <div>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full rounded-lg border p-3 text-base outline-none transition-all focus:ring-1 placeholder:text-gray-400 ${
                  errors.firstName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-green-900 focus:ring-green-900"
                }`}
              />

              {errors.firstName && (
                <p className="mt-1 pl-1 text-xs text-red-600">
                  {errors.firstName[0]}
                </p>
              )}
            </div>

            {/* Middle Name */}
            <div>
              <input
                type="text"
                name="middleName"
                placeholder="Middle Name"
                disabled={formData.noMiddleName}
                value={formData.middleName}
                onChange={handleInputChange}
                className={`w-full rounded-lg border p-3 text-base outline-none transition-all focus:ring-1 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${
                  errors.middleName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-green-900 focus:ring-green-900"
                }`}
              />

              {errors.middleName && (
                <p className="mt-1 pl-1 text-xs text-red-600">
                  {errors.middleName[0]}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pl-1">
              <input
                type="checkbox"
                id="noMiddleName"
                name="noMiddleName"
                checked={formData.noMiddleName}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 accent-green-900 focus:ring-green-900"
              />

              <label
                htmlFor="noMiddleName"
                className="select-none text-sm text-gray-500"
              >
                I have no middle name
              </label>
            </div>
                        {/* Birthdate & Gender Split */}
            <div>
              <div className="flex gap-3">
                <div className="w-[65%]">
                  <input
                    type="text"
                    name="birthdate"
                    placeholder="Date of Birth"
                    required
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) =>
                      !e.target.value &&
                      (e.target.type = "text")
                    }
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border p-3 text-base outline-none transition-all focus:ring-1 placeholder:text-gray-400 ${
                      errors.birthdate
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-green-900 focus:ring-green-900"
                    }`}
                  />
                </div>

                <div className="w-[35%]">
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border bg-white p-3 text-base text-gray-700 outline-none transition-all focus:ring-1 ${
                      errors.gender
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-green-900 focus:ring-green-900"
                    }`}
                  >
                    <option value="" disabled hidden>
                      Gender
                    </option>
                    <option value="Male">
                      Male
                    </option>
                    <option value="Female">
                      Female
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              {errors.birthdate && (
                <p className="mt-1 pl-1 text-xs text-red-600">
                  {errors.birthdate[0]}
                </p>
              )}

              {errors.gender &&
                !errors.birthdate && (
                  <p className="mt-1 pl-1 text-xs text-red-600">
                    {errors.gender[0]}
                  </p>
                )}
            </div>

            {/* Email Address */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full rounded-lg border p-3 text-base outline-none transition-all focus:ring-1 placeholder:text-gray-400 ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-green-900 focus:ring-green-900"
                }`}
              />

              {errors.email && (
                <p className="mt-1 pl-1 text-xs text-red-600">
                  {errors.email[0]}
                </p>
              )}
            </div>

            <div className="px-4 py-2 text-center text-xs leading-normal text-gray-600">
              By tapping Sign up, you agree with the{" "}
              <Link
                href="/terms"
                className="font-bold text-green-900 hover:underline"
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-bold text-green-900 hover:underline"
              >
                Privacy Notice
              </Link>
            </div>

            <div className="space-y-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-green-900 py-3.5 text-center font-bold text-white transition-colors hover:bg-green-950 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? "Sending Verification Code..."
                  : "Continue"}
              </button>

              <div className="text-center text-sm text-gray-400">
                or
              </div>

              <div className="space-y-3 text-center">
                <p className="text-sm text-gray-500">
                  Already have an eScout account?
                </p>

                <Link
                  href="/login"
                  className="block w-full rounded-lg border border-green-900 bg-white py-3.5 text-center font-bold text-green-900 transition-colors hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-100"
                >
                  Log in
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>
            {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-green-900">
              Confirm Registration
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Are you sure you want to create this account?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isSubmitting}
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitRegistration}
                disabled={isSubmitting}
                className="rounded-lg bg-green-900 px-5 py-2.5 font-bold text-white transition hover:bg-green-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Sending Verification Code..."
                  : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}