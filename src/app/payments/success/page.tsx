"use client";
// src/app/payments/success/page.tsx
// Landing page after PayMongo redirects back from checkout.
// Reads ?status=success|failed and pulls transaction details that were
// stashed in localStorage by the register page (amount/description) and
// by the payment method component (transaction id/method label).

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function formatTransactionId(id: string | null) {
  if (!id) return "—";
  // group into 4s for readability, e.g. pay_L6bawB3A -> 8907 2365 8711 style
  const clean = id.replace(/[^a-zA-Z0-9]/g, "");
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
}

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams?.get("status") === "failed" ? "failed" : "success";

  const [amount, setAmount] = useState("0.00");
  const [methodLabel, setMethodLabel] = useState("—");
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const storedAmount = localStorage.getItem("paymentAmount");
    const storedMethod = localStorage.getItem("paymentMethodLabel");
    const storedTxnId = localStorage.getItem("paymentTransactionId");

    if (storedAmount) setAmount(Number(storedAmount).toFixed(2));
    if (storedMethod) setMethodLabel(storedMethod);
    setTransactionId(storedTxnId);
  }, []);

  const isSuccess = status === "success";

  const onDone = () => {
    // Clear the one-time payment session data, then send them home.
    localStorage.removeItem("paymentAmount");
    localStorage.removeItem("paymentDescription");
    localStorage.removeItem("paymentYears");
    localStorage.removeItem("paymentCouncil");
    localStorage.removeItem("paymentMethodLabel");
    localStorage.removeItem("paymentTransactionId");
    router.push("/payments/agreement");
  };

  return (
    <div className="flex flex-col items-center py-10 px-6 bg-zinc-50 min-h-screen">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-6 text-zinc-900 flex flex-col min-h-[600px]">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="text-2xl text-zinc-800 mb-2 self-start"
        >
          ‹
        </button>

        <h1 className="text-2xl font-bold text-emerald-800">eScout</h1>
        <h2 className="text-lg font-semibold text-emerald-800 mb-8">
          Register Membership
        </h2>

        <div className="flex flex-col items-center flex-1">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
              isSuccess ? "bg-emerald-50" : "bg-red-50"
            }`}
          >
            {isSuccess ? (
              <svg
                viewBox="0 0 24 24"
                className="w-12 h-12 text-emerald-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12.5l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="w-12 h-12 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          <h3
            className={`text-xl font-bold mb-2 ${
              isSuccess ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {isSuccess ? "Payment Successful" : "Payment Failed"}
          </h3>

          <p className="text-sm text-zinc-500 text-center mb-8">
            {isSuccess
              ? "Kindly wait for your application to be approved by the respective Local Council. You'll receive a notification once your account is approved. Salamat, Scout."
              : "Something went wrong while processing your payment. No amount was deducted. Please try again."}
          </p>

          <div className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-zinc-700 mb-1">
              Transaction Details
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Transaction ID</span>
              <span className="font-medium">{formatTransactionId(transactionId)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Date</span>
              <span className="font-medium">{formatToday()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Type of Transaction</span>
              <span className="font-medium">{methodLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Amount Paid</span>
              <span className="font-medium">₱ {amount}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDone}
          className={`rounded py-3 px-4 mt-6 w-full text-white font-medium ${
            isSuccess ? "bg-emerald-800" : "bg-zinc-800"
          }`}
        >
          {isSuccess ? "Done" : "Try Again"}
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessPageContent />
    </Suspense>
  );
}
