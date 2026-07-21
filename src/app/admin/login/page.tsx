"use client";
// src/app/admin/login/page.tsx
// Generic admin login page. Hardcoded credentials checked server-side
// in /api/admin/login/route.ts — nothing sensitive lives in this file.

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Invalid username or password.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-zinc-50 min-h-screen">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white rounded-lg shadow p-6 text-zinc-900 flex flex-col gap-3"
      >
        <h1 className="text-2xl font-bold text-green-800 mb-0">eScout</h1>
        <h2 className="text-lg font-semibold mb-4">Admin Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded px-3 py-2"
          required
          autoFocus
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />

        {error && (
          <p className="text-sm text-red-600 -mt-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-green-800 text-white py-2 px-4 mt-2 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}