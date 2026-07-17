"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyScoutPayment } from "@/app/actions/scouts";

export default function EWalletReturnPage() {
  const router = useRouter();
  const [statusText, setStatusText] = useState("Confirming your payment...");
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const fullClient = localStorage.getItem("paymentIntentClientKey");
      const paymentRecordId = localStorage.getItem("paymentRecordId");
      if (!fullClient) {
        router.replace("/scout/membership/membership-registration/method");
        return;
      }
      const paymentIntentId = fullClient.split("_client")[0];

      for (let i = 5; i > 0; i--) {
        setStatusText(`Confirming your payment... (${i})`);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const paymentIntentData = await fetch(
          "https://api.paymongo.com/v1/payment_intents/" +
            paymentIntentId +
            "?client_key=" +
            fullClient,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(
                process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC as string
              ).toString("base64")}`,
            },
          }
        )
          .then((res) => res.json())
          .then((res) => res.data)
          .catch(() => null);

        if (!paymentIntentData) {
          continue;
        }

        const status = paymentIntentData.attributes.status;

        if (status === "succeeded") {
          if (paymentRecordId) {
            const verifyResult = await verifyScoutPayment(paymentRecordId, "paid");
            if (!verifyResult.success) {
              console.error("Failed to mark payment as paid:", verifyResult.error);
            }
          } else {
            console.error("No paymentRecordId found in localStorage â€” cannot mark payment as paid.");
          }
          localStorage.removeItem("paymentIntentClientKey");
          localStorage.removeItem("paymentRecordId");
          localStorage.setItem("paymentTransactionId", paymentIntentId);
          router.replace("/scout/membership/membership-registration/success?status=success");
          return;
        }
        if (
          status === "awaiting_payment_method" &&
          paymentIntentData.attributes.last_payment_error
        ) {
          if (paymentRecordId) {
            const verifyResult = await verifyScoutPayment(paymentRecordId, "failed");
            if (!verifyResult.success) {
              console.error("Failed to mark payment as failed:", verifyResult.error);
            }
          }
          localStorage.removeItem("paymentIntentClientKey");
          localStorage.removeItem("paymentRecordId");
          localStorage.setItem("paymentTransactionId", paymentIntentId);
          setRawResponse(JSON.stringify(paymentIntentData, null, 2));
          router.replace("/scout/membership/membership-registration/success?status=failed");
          return;
        }
        if (i === 1) {
          setRawResponse(JSON.stringify(paymentIntentData, null, 2));
        }
      }
      if (paymentRecordId) {
        const verifyResult = await verifyScoutPayment(paymentRecordId, "failed");
        if (!verifyResult.success) {
          console.error("Failed to mark payment as failed:", verifyResult.error);
        }
      }
      localStorage.removeItem("paymentIntentClientKey");
      localStorage.removeItem("paymentRecordId");
      localStorage.setItem("paymentTransactionId", paymentIntentId);
      router.replace("/scout/membership/membership-registration/success?status=failed");
    };

    checkStatus();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen gap-4">
      <p className="text-zinc-500 text-lg">{statusText}</p>
      {rawResponse && (
        <details className="w-full max-w-lg">
          <summary className="text-sm text-zinc-400 cursor-pointer">
            Raw response (only shows if something's off)
          </summary>
          <pre className="whitespace-pre-wrap text-xs bg-white border border-zinc-200 rounded p-3 mt-2">
            {rawResponse}
          </pre>
        </details>
      )}
    </div>
  );
}