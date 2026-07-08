"use client";
// src/app/payments/components/Maya.tsx

import { useState } from "react";

type MayaProps = {
  amount: number;
  description: string;
};

export default function Maya({ amount, description }: MayaProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const createPaymentIntent = async () => {
    setPaymentStatus("Creating Payment Intent");
    const res = await fetch("/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount * 100,
            payment_method_allowed: ["paymaya"],
            currency: "PHP",
            description: description,
            statement_descriptor: "descriptor business name",
          },
        },
      }),
    }).then((r) => r.json());

    if (!res.body) {
      setRawResponse(JSON.stringify(res, null, 2));
      return null;
    }
    return res.body.data;
  };

  const createPaymentMethod = async () => {
    setPaymentStatus("Creating Payment Method");
    const res = await fetch("https://api.paymongo.com/v1/payment_methods", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC as string
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: "paymaya",
            billing: {
              name: `${name}`,
              email: `${email}`,
              phone: `${phone}`,
            },
          },
        },
      }),
    })
      .then((r) => r.json())
      .catch((err) => ({ errors: [{ detail: JSON.stringify(err) }] }));

    if (!res.data) {
      setRawResponse(JSON.stringify(res, null, 2));
      return null;
    }
    return res.data;
  };

  const attachIntentMethod = async (intent: any, method: any) => {
    setPaymentStatus("Attaching Intent to Method");
    fetch(`https://api.paymongo.com/v1/payment_intents/${intent.id}/attach`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC as string
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: `${method.id}`,
            client_key: `${intent.attributes.client_key}`,
            return_url: `${baseUrl}/payments/method/maya/return`,
          },
        },
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        const paymentIntent = res.data;
        if (!paymentIntent) {
          setRawResponse(JSON.stringify(res, null, 2));
          setPaymentStatus("Attach failed — see raw response below");
          return;
        }
        const status = paymentIntent.attributes.status;
        if (status === "awaiting_next_action") {
          setPaymentStatus("Redirecting to Maya...");

          // Stash what the return page will need, since this tab is
          // about to navigate away entirely (full redirect, not a popup).
          localStorage.setItem(
            "paymentIntentClientKey",
            paymentIntent.attributes.client_key
          );
          localStorage.setItem("paymentMethodLabel", "Maya");

          window.location.href = paymentIntent.attributes.next_action.redirect.url;
        } else {
          setPaymentStatus(status);
        }
      })
      .catch((err) => {
        setPaymentStatus(JSON.stringify(err));
      });
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setRawResponse(null);

    const paymentIntent = await createPaymentIntent();
    if (!paymentIntent) {
      setPaymentStatus("Payment Intent creation failed — see raw response below");
      return;
    }

    const paymentMethod = await createPaymentMethod();
    if (!paymentMethod) {
      setPaymentStatus("Payment Method creation failed — see raw response below");
      return;
    }

    await attachIntentMethod(paymentIntent, paymentMethod);
  };

  const isBusy =
    paymentStatus.startsWith("Creating") ||
    paymentStatus.startsWith("Attaching") ||
    paymentStatus.startsWith("Redirecting");
  const isError =
    paymentStatus.includes("failed") || paymentStatus.startsWith("{");

  return (
    <section>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Billing Information</h2>
          <p className="text-sm text-zinc-500 mt-1">
            You'll be redirected to Maya to authorize this payment.
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
                : "bg-zinc-50 text-zinc-600 border border-zinc-200"
            }`}
          >
            {paymentStatus}
          </div>
        )}

        {rawResponse && (
          <details>
            <summary>Raw response (only shows if something's off)</summary>
            <pre className="whitespace-pre-wrap text-xs">{rawResponse}</pre>
          </details>
        )}
      </form>
    </section>
  );
}