//src/app/(public)/signup/page.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components-general/ui/BackButton";
import { signUpAction } from "@/app/actions/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "", middleName: "", lastName: "", suffix: "",
    birthdate: "", sex: "", email: "", noMiddleName: false,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const policyScrollRef = useRef<HTMLDivElement | null>(null);
  const [role, setRole] = useState<"VISITOR" | "SCOUT" | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(true);

  // Calculates user age in years relative to the current date
  const calculateAge = (birthdateStr: string): number => {
    if (!birthdateStr) return 0;
    const birthDate = new Date(birthdateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  // Handles text and checkbox changes while clearing validation errors for active field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
      ...(name === "noMiddleName" && fieldValue ? { middleName: "" } : {}),
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Triggers role dialog if missing or opens policy modal before registration execution
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!role) {
      setShowRoleDialog(true);
      return;
    }
    setShowPolicyModal(true);
  };

  // Tracks scroll position inside the policy modal container
  const handlePolicyScroll = () => {
    if (policyScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = policyScrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) setHasScrolledToBottom(true);
    }
  };

  // Checks on modal mount if policy text fits container without needing scroll
  useEffect(() => {
    if (showPolicyModal && policyScrollRef.current) {
      const { scrollHeight, clientHeight } = policyScrollRef.current;
      if (scrollHeight <= clientHeight) setHasScrolledToBottom(true);
    }
  }, [showPolicyModal]);

  // Submits form data to server action and redirects to verification page with calculated age
  const submitRegistration = async () => {
    setShowPolicyModal(false);
    setIsSubmitting(true);
    setErrors({});
    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("middleName", formData.middleName);
    data.append("lastName", formData.lastName);
    data.append("suffix", formData.suffix);
    data.append("birthdate", formData.birthdate);
    data.append("sex", formData.sex);
    data.append("email", formData.email);
    data.append("role", role ?? "");

    const result = await signUpAction({ success: false }, data);
    setIsSubmitting(false);

    if (!result.success) {
      setErrors(result.errors ?? (result.message ? { root: [result.message] } : {}));
      return;
    }

    // Redirect to verify page with email and calculated age search params
    const age = calculateAge(formData.birthdate);
    router.push(`/signup/verify?email=${encodeURIComponent(formData.email)}&age=${age}`);
  };

  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-white md:bg-gray-50 md:p-6">
        <div className="w-full max-w-md bg-white px-6 pb-8 pt-4 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm">
          <div className="mb-6">
            <BackButton onClick={() => router.push("/")} />
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-green-900">
              <Image src="/escout-logo.svg" alt="eScout Logo" width={115} height={115} className="h-auto w-[115px] object-contain" />
            </h1>
            <h2 className="mt-1 text-xl font-bold text-green-900">Create New Account</h2>
            <p className="mt-2 text-sm text-gray-500">
              Enter your information to receive a verification code. You'll create your password after verifying your email.
            </p>
            {role && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900">
                <span>Registering as: <strong>{role === "SCOUT" ? "Existing Scout" : "New to Scouting"}</strong></span>
                <button type="button" onClick={() => setShowRoleDialog(true)} className="font-bold underline hover:no-underline">Change</button>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.root && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{errors.root[0]}</div>
            )}
            <div>
              <div className="flex gap-3">
                <div className="w-[70%]">
                  <input type="text" name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleInputChange} className={`w-full rounded-lg border p-3 text-base outline-none transition-all focus:ring-1 placeholder:text-gray-400 ${errors.lastName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-green-900 focus:ring-green-900"}`} />
                </div>
                <div className="w-[30%]">
                  <select name="suffix" value={formData.suffix} onChange={handleInputChange} className={`w-full rounded-lg border bg-white p-3 text-base text-gray-700 outline-none transition-all focus:ring-1 ${errors.suffix ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-green-900 focus:ring-green-900"}`}>
                    <option value="" disabled hidden>Suffix</option>
                    <option value="Jr.">Jr.</option>
                    <option value="Sr.">Sr.</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                </div>
              </div>
              {errors.lastName && <p className="mt-1 pl-1 text-xs text-red-600">{errors.lastName[0]}</p>}
            </div>
            <div>
              <input type="text" name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleInputChange} className={`w-full rounded-lg border p-3 text-base outline-none transition-all focus:ring-1 placeholder:text-gray-400 ${errors.firstName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-green-900 focus:ring-green-900"}`} />
              {errors.firstName && <p className="mt-1 pl-1 text-xs text-red-600">{errors.firstName[0]}</p>}
            </div>
            <div>
              <input type="text" name="middleName" placeholder="Middle Name" disabled={formData.noMiddleName} value={formData.middleName} onChange={handleInputChange} className={`w-full rounded-lg border p-3 text-base outline-none transition-all focus:ring-1 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${errors.middleName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-green-900 focus:ring-green-900"}`} />
              {errors.middleName && <p className="mt-1 pl-1 text-xs text-red-600">{errors.middleName[0]}</p>}
            </div>
            <div className="flex items-center gap-2 pl-1">
              <input type="checkbox" id="noMiddleName" name="noMiddleName" checked={formData.noMiddleName} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 accent-green-900 focus:ring-green-900" />
              <label htmlFor="noMiddleName" className="select-none text-sm text-gray-500">I have no middle name</label>
            </div>
            <div>
              <div className="flex gap-3">
                <div className="w-[65%]">
                  <input type="text" name="birthdate" placeholder="Date of Birth" required onFocus={(e) => (e.target.type = "date")} onBlur={(e) => !e.target.value && (e.target.type = "text")} value={formData.birthdate} onChange={handleInputChange} className={`w-full rounded-lg border p-3 text-base outline-none transition-all focus:ring-1 placeholder:text-gray-400 ${errors.birthdate ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-green-900 focus:ring-green-900"}`} />
                </div>
                <div className="w-[35%]">
                  <select name="sex" required value={formData.sex} onChange={handleInputChange} className={`w-full rounded-lg border bg-white p-3 text-base text-gray-700 outline-none transition-all focus:ring-1 ${errors.sex ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-green-900 focus:ring-green-900"}`}>
                    <option value="" disabled hidden>Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              {errors.birthdate && <p className="mt-1 pl-1 text-xs text-red-600">{errors.birthdate[0]}</p>}
            </div>
            <div>
              <input type="email" name="email" placeholder="Email Address" required value={formData.email} onChange={handleInputChange} className={`w-full rounded-lg border p-3 text-base outline-none transition-all focus:ring-1 placeholder:text-gray-400 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-green-900 focus:ring-green-900"}`} />
              {errors.email && <p className="mt-1 pl-1 text-xs text-red-600">{errors.email[0]}</p>}
            </div>
            <div className="space-y-4 pt-4">
              <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-green-900 py-3.5 text-center font-bold text-white transition-colors hover:bg-green-950 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? "Sending Verification Code..." : "Continue"}
              </button>
              <div className="text-center text-sm text-gray-400">or</div>
              <div className="space-y-3 text-center">
                <p className="text-sm text-gray-500">Already have an eScout account?</p>
                <Link href="/login" className="block w-full rounded-lg border border-green-900 bg-white py-3.5 text-center font-bold text-green-900 transition-colors hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-100">Log in</Link>
              </div>
            </div>
          </form>
        </div>
      </main>

      {showRoleDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-green-900">Welcome to eScout</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">Before we get started, tell us a bit about yourself.</p>
            <div className="mt-6 space-y-3">
              <button type="button" onClick={() => { setRole("VISITOR"); setShowRoleDialog(false); }} className="w-full rounded-lg border border-green-900 bg-white px-4 py-3.5 text-left transition-colors hover:bg-green-50">
                <span className="block font-bold text-green-900">I'm new to Scouting</span>
                <span className="mt-0.5 block text-sm text-gray-500">I don't have a Scout membership yet and want to join.</span>
              </button>
              <button type="button" onClick={() => { setRole("SCOUT"); setShowRoleDialog(false); }} className="w-full rounded-lg border border-green-900 bg-white px-4 py-3.5 text-left transition-colors hover:bg-green-50">
                <span className="block font-bold text-green-900">I'm already a Scout</span>
                <span className="mt-0.5 block text-sm text-gray-500">I have an existing Scout membership but I'm new to this app.</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-green-900">Safe from Harm & Privacy Policy</h2>
            <p className="mt-1 text-xs text-gray-500">Please read through the policy below before proceeding.</p>
            <div ref={policyScrollRef} onScroll={handlePolicyScroll} className="mt-4 max-h-[350px] space-y-3 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-700">
              <h3 className="text-sm font-bold text-gray-900">1. Safe from Harm Commitment</h3>
              <p>eScout is committed to preventing all forms of abuse, harassment, neglect, and exploitation within Scouting activities. Every participant has the right to a safe, supportive, and respectful environment.</p>
              <h3 className="text-sm font-bold text-gray-900">2. Code of Conduct</h3>
              <p>Users agree to interact responsibly and refrain from any behavior that compromises physical, emotional, or digital safety. Any misconduct or suspected breach of safety guidelines will result in account review or immediate suspension.</p>
              <h3 className="text-sm font-bold text-gray-900">3. Privacy & Data Handling</h3>
              <p>We handle personal information (names, birthdates, and emails) strictly for account management, membership verification, and safeguarding purposes. Your data is protected in accordance with applicable data privacy regulations.</p>
              <h3 className="text-sm font-bold text-gray-900">4. Parental Consent</h3>
              <p>Applicants under 18 years of age require parental or legal guardian notification and approval during account verification.</p>
            </div>
            {!hasScrolledToBottom && <p className="mt-2 text-center text-xs font-semibold text-amber-600">↓ Scroll to the bottom to unlock agreement</p>}
            <div className="mt-4 flex items-start gap-2.5">
              <input type="checkbox" id="acceptPolicy" checked={hasAcceptedPolicy} disabled={!hasScrolledToBottom} onChange={(e) => setHasAcceptedPolicy(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-green-900 focus:ring-green-900 disabled:cursor-not-allowed" />
              <label htmlFor="acceptPolicy" className={`select-none text-xs ${hasScrolledToBottom ? "text-gray-700" : "text-gray-400"}`}>
                I have read, understood, and agree to the <strong>Safe from Harm Policy</strong> and <strong>Privacy Terms</strong>.
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowPolicyModal(false)} disabled={isSubmitting} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed">Cancel</button>
              <button type="button" onClick={submitRegistration} disabled={!hasAcceptedPolicy || isSubmitting} className="rounded-lg bg-green-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-green-950 disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? "Sending Code..." : "Agree & Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}