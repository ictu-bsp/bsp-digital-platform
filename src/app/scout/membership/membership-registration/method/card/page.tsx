"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card, { CardBrand } from "../../components/Card";

export default function CardMethodPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState<CardBrand | null>(null);

  useEffect(() => {
    const storedAmount = localStorage.getItem("paymentAmount");
    const storedDescription = localStorage.getItem("paymentDescription");
    const storedBrand = localStorage.getItem("paymentCardBrand") as CardBrand | null;

    if (!storedAmount) {
      router.replace("/scout/membership/membership-registration/register");
      return;
    }

    if (!storedBrand || !["Mastercard", "Visa"].includes(storedBrand)) {
      router.replace("/scout/membership/membership-registration/method");
      return;
    }

    setAmount(Number(storedAmount));
    setDescription(storedDescription ?? "Scout Membership Registration");
    setBrand(storedBrand);
  }, [router]);

  if (amount === null || brand === null) {
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
        <h1 className="text-4xl font-bold text-green-800 mb-2">{brand}</h1>
        <p className="text-zinc-600 text-lg mb-8">Amount to pay: ₱{amount}</p>

        <Card amount={amount} description={description} brand={brand} />
      </div>
    </div>
  );
}