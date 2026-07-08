"use client";
// src/app/payments/status/page.tsx

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function StatusContent() {
  const searchParams = useSearchParams();
  const status = searchParams?.get("status") ?? null; // null-safe

  const isSuccess = status === "success";
  const isFailed = status === "failed";

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 text-center text-zinc-900">
      {isSuccess && (
        <>
          <h1 className="text-2xl font-bold text-green-800 mb-2">Payment Successful</h1>
          <p className="text-zinc-600 mb-6">Your payment was authorized and completed.</p>
        </>
      )}
      {isFailed && (
        <>
          <h1 className="text-2xl font-bold text-red-700 mb-2">Payment Failed</h1>
          <p className="text-zinc-600 mb-6">The payment was not completed. Please try again.</p>
        </>
      )}
      {!isSuccess && !isFailed && (
        <>
          <h1 className="text-2xl font-bold text-zinc-700 mb-2">Processing...</h1>
          <p className="text-zinc-600 mb-6">Checking your payment status.</p>
        </>
      )}
      <Link
        href="/payments/method"
        className="inline-block rounded-lg bg-green-800 hover:bg-green-900 transition-colors text-white py-3 px-6"
      >
        Back to Payment Methods
      </Link>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
      <Suspense fallback={<div className="text-zinc-500">Loading...</div>}>
        <StatusContent />
      </Suspense>
    </div>
  );
}