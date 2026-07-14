//src/app/scout/membership/membership-registration/components/EWallet.tsx

"use client";

import { useState } from "react";
import { setPaymentProviderIdAction } from "@/app/actions/payment";

export type WalletType = "gcash" | "grab_pay" | "paymaya" | "shopee_pay";

type EWalletProps = {
  amount: number;
  description: string;
  walletType: WalletType;
  registrationId: string;
  paymentRecordId: string;
};

const WALLET_LABELS: Record<WalletType, string> = {
  gcash: "GCash",
  grab_pay: "GrabPay",
  paymaya: "Maya",
  shopee_pay: "ShopeePay",
};

// gcash / grab_pay -> Source workflow. paymaya / shopee_pay -> Payment Intent workflow.
const SOURCE_WORKFLOW_TYPES: WalletType[] = ["gcash", "grab_pay"];

export default function EWallet({
  amount,
  description,
  walletType,
  registrationId,
  paymentRecordId,
}: EWalletProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  const publicKey = process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC as string;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const label = WALLET_LABELS[walletType];
  const isSourceWorkflow = SOURCE_WORKFLOW_TYPES.includes(walletType);

  // ---------- Source workflow (GCash / GrabPay) ----------
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
              success: `${baseUrl}/scout/membership/membership-registration/success?status=success`,
              failed: `${baseUrl}/scout/membership/membership-registration/success?status=failed`,
            },
            billing: { name, phone, email },
            type: walletType, // "gcash" or "grab_pay"
            currency: "PHP",
            description: description,
            metadata: {
              registrationId,
              paymentRecordId,
            },
          },
        },
      }),
    };
    return fetch("https://api.paymongo.com/v1/sources", options)
      .then((res) => res.json())
      .catch((err) => {
        setPaymentStatus("Network error: " + JSON.stringify(err));
        return null;
      });
  };

  // ---------- Payment Intent workflow (Maya / ShopeePay) ----------
  const createPaymentIntent = async () => {
    setPaymentStatus("Creating Payment Intent");
    const res = await fetch("/scout/membership/membership-registration/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount * 100,
            payment_method_allowed: [walletType], // "paymaya" or "shopee_pay"
            currency: "PHP",
            description: description,
            statement_descriptor: "descriptor business name",
            metadata: {
              registrationId,
              paymentRecordId,
            },
          },
        },
      }),
    }).then((r) => r.json());

    if (!res.body) {
      setRawResponse(JSON.stringify(res, null, 2));
      return null;
    }

    const intentData = res.body.data;
    if (intentData?.id) {
      await setPaymentProviderIdAction(paymentRecordId, intentData.id);
    }

    return intentData;
  };

  const createPaymentMethod = async () => {
    setPaymentStatus("Creating Payment Method");
    const res = await fetch("https://api.paymongo.com/v1/payment_methods", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(publicKey).toString("base64")}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: walletType,
            billing: { name, email, phone },
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
        Authorization: `Basic ${Buffer.from(publicKey).toString("base64")}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: `${method.id}`,
            client_key: `${intent.attributes.client_key}`,
            // Both Maya and ShopeePay now come back to the SAME merged
            // return page, which knows how to poll for either one.
            return_url: `${baseUrl}/scout/membership/membership-registration/method/ewallet/return`,
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
          setPaymentStatus(`Redirecting to ${label}...`);
          localStorage.setItem("paymentIntentClientKey", paymentIntent.attributes.client_key);
          localStorage.setItem("paymentMethodLabel", label);
          window.location.href = paymentIntent.attributes.next_action.redirect.url;
        } else if (status === "succeeded") {
          // Rare case: PayMongo confirmed the payment immediately, with
          // no redirect to Maya/ShopeePay needed.
          setPaymentStatus("Payment Success");
          localStorage.setItem("paymentTransactionId", intent.id);
          localStorage.setItem("paymentMethodLabel", label);
          window.location.href = "/scout/membership/membership-registration/success?status=success";
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

    if (isSourceWorkflow) {
      // GCash / GrabPay path
      const source = await createSource();
      if (!source || !source.data) {
        setPaymentStatus("PayMongo rejected the request: " + JSON.stringify(source));
        return;
      }
      await setPaymentProviderIdAction(paymentRecordId, source.data.id);
      localStorage.setItem("paymentTransactionId", source.data.id);
      localStorage.setItem("paymentMethodLabel", label);
      window.location.href = source.data.attributes.redirect.checkout_url;
      return;
    }

    // Maya / ShopeePay path
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
    paymentStatus.includes("failed") ||
    paymentStatus.startsWith("PayMongo rejected") ||
    paymentStatus.startsWith("Network error") ||
    paymentStatus.startsWith("{");

  return (
    <section>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Billing Information</h2>
          <p className="text-sm text-zinc-500 mt-1">
            You'll be redirected to {label} to authorize this payment.
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
                : paymentStatus === "Payment Success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
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