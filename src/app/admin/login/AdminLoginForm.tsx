// src/app/admin/login/AdminLoginForm.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import SuccessOverlay from "@/components-general/ui/SuccessOverlay";

export default function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [officerName, setOfficerName] = useState("");

  const handleCouncilLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Ignore network failures
    } finally {
      // Hard redirect replaces browser history entry so back button won't land back on /admin/login
      window.location.replace("/login");
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      setLoading(false);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Invalid username or password.");
        return;
      }

      const data = await res.json();

      setOfficerName(data.fullName ?? "Administrator");
      setShowSuccess(true);

      setTimeout(() => {
        // Hard replace ensures /admin/login is wiped from browser history upon logging into officer account
        window.location.replace("/admin");
      }, 1500);
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
        {/* Top Left Navigation Button */}
        <button
          onClick={handleCouncilLogout}
          type="button"
          className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 cursor-pointer"
        >
          <ArrowLeftIcon className="h-4 w-4 text-zinc-600" />
          Council Logout
        </button>

        {/* Form Container */}
        <form
          onSubmit={onSubmit}
          className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-100 bg-white p-8 text-zinc-900 shadow-lg"
        >
          {/* Header & Logo Branding */}
          <div className="flex flex-col items-center text-center">
            <Image
              src="/escout-logo.svg"
              alt="eScout Logo"
              width={115}
              height={115}
              className="mb-1 h-auto w-[115px] object-contain"
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-green-700">
              <h2>Local Council Administrator</h2>
            </span>
          </div>

          {/* Username Input */}
          <div className="space-y-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 py-2 pr-3 pl-10 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-800"
                required
                autoFocus
              />
              <UserIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 py-2 pr-10 pl-10 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-800"
                required
              />
              <LockClosedIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 cursor-pointer rounded-lg bg-green-800 py-2.5 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Log In"}
          </button>
        </form>
      </div>

      <SuccessOverlay
        open={showSuccess}
        title="Administrator Login Successful"
        subtitle={`Welcome, ${officerName}!`}
        duration={3000}
      />
    </>
  );
}