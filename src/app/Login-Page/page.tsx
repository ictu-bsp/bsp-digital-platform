"use client";

import { useState } from "react";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <main className="flex min-h-screen items-center justify-center bg-white">
            <div className="w-full max-w-sm p-6">
                <button className="mb-6 text-3xl text-green-900">

                </button>
                <h1 className="text-5xl font-bold text-green-900">
                    eScout
                </h1>
                <h2 className="mb-8 text-2xl font-semibold text-green-900">
                    Login
                </h2>
                <input
                type="email"
                placeholder="Email Address"
                className="mb-4 w-full rounded border border-gray-300 p-3 pr-12"
                />
            <div className="relative mb-6">
                <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full rounded border border-gray-300 p-3 pr-12"
                />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center"
                >
                    {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                        <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                </button>
            </div>
                <button className="mt-16 md:mt-10 lg:mt-8 w-full rounded bg-green-900 p-3 text-white hover:bg-green-700">
                    Log In
                </button>
                <p className="my-4 text-center text-sm text-gray-500">
                    or
                </p>
                <p className="text-center text-sm text-gray-500">
                    Don't have an eScout account yet?
                </p>
                <button className="text-center mt-3 w-full rounded border border-gray-300 p-3 font-semibold text-green-900 hover:bg-gray-100">
                    Sign Up
                </button>
            </div>
        </main>
        );
}