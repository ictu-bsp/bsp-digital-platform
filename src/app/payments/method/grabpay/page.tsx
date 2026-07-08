"use client";
// src/app/payments/method/grabpay/page.tsx
// Reached after the user picks "E-Wallets" -> "GrabPay" on /payments/method.
// Reads the amount + description that register/page.tsx saved to
// localStorage, then hands them to the existing GrabPay component.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GrabPay from "../../components/GrabPay";

export default function GrabPayMethodPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | null>(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const storedAmount = localStorage.getItem("paymentAmount");
    const storedDescription = localStorage.getItem("paymentDescription");

    if (!storedAmount) {
      router.replace("/payments/register");
      return;
    }

    setAmount(Number(storedAmount));
    setDescription(storedDescription ?? "Scout Membership Registration");
  }, [router]);

  if (amount === null) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
        <p className="text-zinc-500 text-lg">Loading payment details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-14 text-zinc-900">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-3xl text-zinc-700 mb-4"
          aria-label="Go back"
        >
          &lt;
        </button>
        <h1 className="text-4xl font-bold text-green-800 mb-2">GrabPay</h1>
        <p className="text-zinc-600 text-lg mb-8">Amount to pay: ₱{amount}</p>

        <GrabPay amount={amount} description={description} />
      </div>
    </div>
  );
}