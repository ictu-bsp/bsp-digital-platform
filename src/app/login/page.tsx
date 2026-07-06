"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import InputField from "@/components/InputField";

export default function Login() {

    const router = useRouter();

    function handleLogin(e: React.FormEvent){

        e.preventDefault();

        alert("Login Successful!");

        router.push("/dashboard");

    }

    return (

        <main className="min-h-screen flex justify-center items-center">

            <form
                onSubmit={handleLogin}
                className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 w-[400px]"
            >

                <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
                    Login
                </h1>

                <InputField
                    label="Email"
                    type="email"
                />

                <InputField
                    label="Password"
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
                    Login
                </button>

                <p className="text-center mt-5 text-gray-700">
                    Don't have an account?
                </p>

                <Link
                    href="/register"
                    className="block text-center text-green-700 font-semibold hover:underline"
                >
                    Sign Up
                </Link>

            </form>

        </main>

    );

}