"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EWallet, { WalletType } from "../../components/EWallet";

const WALLET_TITLES: Record<WalletType, string> = {
  gcash: "GCash",
  grab_pay: "GrabPay",
  paymaya: "Maya",
  shopee_pay: "ShopeePay",
};

export default function EWalletMethodPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [walletType, setWalletType] = useState<WalletType | null>(null);

  useEffect(() => {
    const storedAmount = localStorage.getItem("paymentAmount");
    const storedDescription = localStorage.getItem("paymentDescription");
    const storedWalletType = localStorage.getItem("paymentWalletType") as WalletType | null;

    if (!storedAmount) {
      router.replace("/scout/membership/membership-registration/register");
      return;
    }

    if (
      !storedWalletType ||
      !["gcash", "grab_pay", "paymaya", "shopee_pay"].includes(storedWalletType)
    ) {
      // No wallet chosen (or a stale/invalid value) — send back to the
      // method picker instead of guessing.
      router.replace("/scout/membership/membership-registration/method");
      return;
    }

    setAmount(Number(storedAmount));
    setDescription(storedDescription ?? "Scout Membership Registration");
    setWalletType(storedWalletType);
  }, [router]);

  if (amount === null || walletType === null) {
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
        <h1 className="text-4xl font-bold text-green-800 mb-2">{WALLET_TITLES[walletType]}</h1>
        <p className="text-zinc-600 text-lg mb-8">Amount to pay: ₱{amount}</p>

        <EWallet amount={amount} description={description} walletType={walletType} />
      </div>
    </div>
  );
}