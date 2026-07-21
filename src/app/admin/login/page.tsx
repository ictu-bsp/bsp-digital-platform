// src/app/admin/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import SuccessOverlay from "@/components-general/ui/SuccessOverlay";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [officerName, setOfficerName] =
    useState("");

  const onSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const res = await fetch(
      "/api/admin/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    setLoading(false);

    if (!res.ok) {
      const data = await res
        .json()
        .catch(() => ({}));

      setError(
        data.message ??
          "Invalid username or password."
      );

      return;
    }

    const data = await res.json();

    setOfficerName(
      data.fullName ?? "Administrator"
    );

    setShowSuccess(true);

    setTimeout(() => {
      router.push("/admin");
    }, 2200);
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">

        <form
          onSubmit={onSubmit}
          className="flex w-full max-w-sm flex-col gap-3 rounded-xl bg-white p-6 text-zinc-900 shadow-lg"
        >

          <h1 className="mb-0 text-3xl font-bold text-green-800">
            eScout
          </h1>

          <h2 className="mb-4 text-lg font-semibold">
            Administrator Login
          </h2>

          <input
            type="text"
            placeholder="Officer Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
            className="rounded-lg border px-3 py-2"
            required
            autoFocus
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="rounded-lg border px-3 py-2"
            required
          />

          {error && (
            <p className="-mt-1 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-green-800 py-2.5 font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Signing In..."
              : "Log In"}
          </button>

        </form>

      </div>

      <SuccessOverlay
        open={showSuccess}
        title="Administrator Login Successful"
        subtitle={`Welcome, ${officerName}!`}
      />
    </>
  );
}