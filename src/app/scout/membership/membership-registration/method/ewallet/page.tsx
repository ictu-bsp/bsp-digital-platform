//src/app/scout/membership/membership-registration/method/ewallet/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components-general/ui/BackButton";
import EWallet, { WalletType } from "../../components/EWallet";
import { createPaymentRecordAction } from "@/app/actions/payment";

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
  const [paymentRecordId, setPaymentRecordId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const setup = async () => {
      const storedAmount = localStorage.getItem("paymentAmount");
      const storedDescription = localStorage.getItem("paymentDescription");
      const storedWalletType = localStorage.getItem("paymentWalletType") as WalletType | null;
      const registrationId = localStorage.getItem("registrationId");

      if (!storedAmount || !registrationId) {
        router.replace("/scout/membership/membership-registration/register");
        return;
      }

      if (
        !storedWalletType ||
        !["gcash", "grab_pay", "paymaya", "shopee_pay"].includes(storedWalletType)
      ) {
        router.replace("/scout/membership/membership-registration/method");
        return;
      }

      setAmount(Number(storedAmount));
      setDescription(storedDescription ?? "Scout Membership Registration");
      setWalletType(storedWalletType);

      const result = await createPaymentRecordAction(registrationId);

      if (!result.success || !result.data) {
        setPaymentError(result.error ?? "Failed to set up payment.");
        return;
      }

      localStorage.setItem("paymentRecordId", result.data.id);
      setPaymentRecordId(result.data.id);
    };

    setup();
  }, [router]);

  if (paymentError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
        <p className="text-red-600 text-lg">{paymentError}</p>
      </div>
    );
  }

  if (amount === null || walletType === null || paymentRecordId === null) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
        <p className="text-zinc-500 text-lg">Loading payment details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-14 text-zinc-900">
        <div className="mb-4">
          <BackButton onClick={() => router.back()} />
        </div>
        <h1 className="text-4xl font-bold text-green-800 mb-2">{WALLET_TITLES[walletType]}</h1>
        <p className="text-zinc-600 text-lg mb-8">Amount to pay: ₱{amount}</p>

        <EWallet
          amount={amount}
          description={description}
          walletType={walletType}
          registrationId={localStorage.getItem("registrationId")!}
          paymentRecordId={paymentRecordId}
        />
      </div>
    </div>
  );
}