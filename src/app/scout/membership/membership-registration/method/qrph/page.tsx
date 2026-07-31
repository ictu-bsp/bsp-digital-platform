//src/app/scout/membership/membership-registration/method/qrph/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components-general/ui/BackButton";
import QRPay from "../../components/QRPay";
import { submitApplicationAndCreatePaymentAction } from "@/app/actions/payment";
import { SubmitApplicationInput } from "@/services/application.service";

export default function QRPhMethodPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [paymentRecordId, setPaymentRecordId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const setup = async () => {
      const storedAmount = localStorage.getItem("paymentAmount");
      const storedDescription = localStorage.getItem("paymentDescription");
      const storedPayload = localStorage.getItem("pendingApplicationPayload");

      if (!storedAmount || !storedPayload) {
        router.replace("/scout/membership/membership-registration/register");
        return;
      }

      setAmount(Number(storedAmount));
      setDescription(storedDescription ?? "Scout Membership Registration");

      const payload: SubmitApplicationInput = JSON.parse(storedPayload);
      const result = await submitApplicationAndCreatePaymentAction(payload);

      if (!result.success || !result.data) {
        setPaymentError(result.error ?? "Failed to set up payment.");
        return;
      }

      localStorage.setItem("registrationId", result.data.applicationId);
      localStorage.setItem("paymentRecordId", result.data.paymentRecord.id);
      localStorage.removeItem("pendingApplicationPayload");

      setRegistrationId(result.data.applicationId);
      setPaymentRecordId(result.data.paymentRecord.id);
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

  if (amount === null || registrationId === null || paymentRecordId === null) {
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
        <h1 className="text-4xl font-bold text-green-800 mb-2">QR Ph</h1>
        <p className="text-zinc-600 text-lg mb-8">Amount to pay: ₱{amount}</p>

        <QRPay
          amount={amount}
          description={description}
          registrationId={registrationId}
          paymentRecordId={paymentRecordId}
        />
      </div>
    </div>
  );
}