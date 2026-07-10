"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import OnlineBanking from "../../../components/OnlineBanking";

const BANK_LABELS: Record<string, string> = {
  bpi: "BPI",
  unionbank: "UnionBank",
  bdo: "BDO",
  landbank: "LandBank",
  metrobank: "Metrobank",
};

type Bank = "bpi" | "unionbank" | "bdo" | "landbank" | "metrobank";

export default function OnlineBankingMethodPage() {
  const router = useRouter();
  const params = useParams<{ bank: string }>();
  const bank = params?.bank ?? "";

  const [amount, setAmount] = useState<number | null>(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!BANK_LABELS[bank]) {
      router.replace("/payments/method");
      return;
    }

    const storedAmount = localStorage.getItem("paymentAmount");
    const storedDescription = localStorage.getItem("paymentDescription");

    if (!storedAmount) {
      router.replace("/payments/register");
      return;
    }

    setAmount(Number(storedAmount));
    setDescription(storedDescription ?? "Scout Membership Registration");
  }, [router, bank]);

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
        <h1 className="text-4xl font-bold text-green-800 mb-2">{BANK_LABELS[bank]}</h1>
        <p className="text-zinc-600 text-lg mb-8">Amount to pay: ₱{amount}</p>

        <OnlineBanking amount={amount} description={description} bank={bank as Bank} />
      </div>
    </div>
  );
}