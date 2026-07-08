"use client";
// src/app/payments/components/GrabPay.tsx

import { useState } from "react";

type GrabPayProps = {
  amount: number;
  description: string;
};

export default function GrabPay({ amount, description }: GrabPayProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [payProcess, setPayProcess] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const publicKey = process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC as string;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const createSource = async () => {
    setPaymentStatus("Creating Source");
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(publicKey).toString("base64")}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount * 100,
            redirect: {
              success: `${baseUrl}/payments/success?status=success`,
              failed: `${baseUrl}/payments/success?status=failed`,
            },
            billing: { name: `${name}`, phone: `${phone}`, email: `${email}` },
            type: "grab_pay",
            currency: "PHP",
            description: description,
          },
        },
      }),
    };
    return fetch("https://api.paymongo.com/v1/sources", options)
      .then((res) => res.json())
      .then((res) => res)
      .catch((err) => {
        setPaymentStatus("Network error: " + JSON.stringify(err));
        return null;
      });
  };

  const listenToPayment = async (sourceId: string) => {
    for (let i = 5; i > 0; i--) {
      setPaymentStatus(`Listening to Payment in ${i}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (i === 1) {
        const sourceData = await fetch(
          "https://api.paymongo.com/v1/sources/" + sourceId,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(publicKey).toString("base64")}`,
            },
          }
        )
          .then((res) => res.json())
          .then((res) => res.data);

        if (sourceData.attributes.status === "failed") {
          setPaymentStatus("Payment Failed");
        } else if (sourceData.attributes.status === "paid") {
          setPaymentStatus("Payment Success");
        } else {
          i = 5;
          setPayProcess(sourceData.attributes.status);
        }
      }
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const source = await createSource();

    if (!source || !source.data) {
      setPaymentStatus(
        "PayMongo rejected the request: " + JSON.stringify(source)
      );
      return;
    }

    localStorage.setItem("paymentTransactionId", source.data.id);
    localStorage.setItem("paymentMethodLabel", "GrabPay");

    window.location.href = source.data.attributes.redirect.checkout_url;
  };

  const isBusy = paymentStatus.startsWith("Creating") || paymentStatus.startsWith("Listening");
  const isError =
    paymentStatus.startsWith("PayMongo rejected") ||
    paymentStatus.startsWith("Network error") ||
    paymentStatus === "Payment Failed";
  const isSuccess = paymentStatus === "Payment Success";

  return (
    <section>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Billing Information</h2>
          <p className="text-sm text-zinc-500 mt-1">
            You'll be redirected to GrabPay to authorize this payment.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Full Name</label>
          <input
            placeholder="Juan Dela Cruz"
            className="border border-zinc-300 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-green-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Mobile Number</label>
          <input
            placeholder="09xxxxxxxxx"
            className="border border-zinc-300 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-green-800"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Email Address</label>
          <input
            placeholder="user@domain.com"
            className="border border-zinc-300 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-green-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isBusy}
          className="rounded-lg bg-green-800 hover:bg-green-900 transition-colors text-white font-medium py-3 px-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBusy ? "Processing..." : `Pay ₱${amount}`}
        </button>

        {paymentStatus && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              isError
                ? "bg-red-50 text-red-700 border border-red-200"
                : isSuccess
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-zinc-50 text-zinc-600 border border-zinc-200"
            }`}
          >
            {paymentStatus}
          </div>
        )}

        {payProcess && (
          <p className="text-xs text-zinc-400">Source status: {payProcess}</p>
        )}
      </form>
    </section>
  );
}