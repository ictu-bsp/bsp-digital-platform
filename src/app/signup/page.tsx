"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import InputField from "@/components/InputField";

export default function Signup() {

    const router = useRouter();

    function handleSubmit(e: React.FormEvent){

        e.preventDefault();

        alert("Sign Up Successful!");

        router.push("/login");
    }

    return (

        <main className="min-h-screen flex justify-center items-center">

            <form
                onSubmit={handleSubmit}
                className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 w-[400px]"
            >

                <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
                    Create Account
                </h1>

                <InputField
                    label="Full Name"
                    placeholder="Juan Dela Cruz"
                />

                <InputField
                    label="Email"
                    type="email"
                    placeholder="example@email.com"
                />

                <InputField
                    label="Password"
                    type="password"
                />

                <InputField
                    label="Confirm Password"
                    type="password"
                />

                <button
                    className="
                        mt-4
                        w-full
                        rounded-full
                        bg-green-700
                        py-3
                        text-white
                        font-bold
                        hover:bg-green-800
                        transition
                    "
                >
                    Sign Up
                </button>

                <p className="text-center mt-5 text-gray-700">
                    Already have an account?
                </p>

                <Link
                    href="/login"
                    className="block text-center text-green-700 font-semibold hover:underline"
                >
                    Login
                </Link>

            </form>

        </main>

    );

}