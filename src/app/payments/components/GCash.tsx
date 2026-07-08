"use client";
// src/app/payments/components/GCash.tsx

import { useState } from "react";

type GCashProps = {
  amount: number;
  description: string;
};

export default function GCash({ amount, description }: GCashProps) {
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
            type: "gcash",
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
    localStorage.setItem("paymentMethodLabel", "GCash");

    window.location.href = source.data.attributes.redirect.checkout_url;
  };

  return (
    <section>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Billing Information</h2>
        <input
          placeholder="Juan Dela Cruz"
          className="border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="09xxxxxxxxx"
          className="border rounded px-3 py-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          placeholder="user@domain.com"
          className="border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="rounded bg-black text-white py-2 px-4">
          Pay
        </button>
        <p>{paymentStatus}</p>
        <p>{payProcess}</p>
      </form>
    </section>
  );
}
