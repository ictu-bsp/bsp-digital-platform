"use client";
// src/app/payments/method/maya/return/page.tsx
// PayMongo sends the customer here after they authorize (or cancel) on
// Maya's page. Unlike GCash/GrabPay, PayMongo does NOT tell us the result
// via the URL — we have to ask PayMongo directly what happened.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MayaReturnPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const fullClient = localStorage.getItem("paymentIntentClientKey");

      if (!fullClient) {
        // No record of an in-progress Maya payment — bail out safely.
        router.replace("/payments/method");
        return;
      }

      const paymentIntentId = fullClient.split("_client")[0];

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

      localStorage.removeItem("paymentIntentClientKey");

      if (!paymentIntentData) {
        router.replace("/payments/success?status=failed");
        return;
      }

      localStorage.setItem("paymentTransactionId", paymentIntentId);

      if (paymentIntentData.attributes.status === "succeeded") {
        router.replace("/payments/success?status=success");
      } else {
        router.replace("/payments/success?status=failed");
      }
    };

    checkStatus();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
      <p className="text-zinc-500 text-lg">
        {checking ? "Confirming your payment..." : "Redirecting..."}
      </p>
    </div>
  );
}