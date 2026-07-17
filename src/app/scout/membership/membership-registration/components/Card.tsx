//src/app/scout/membership/membership-registration/components/Card.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setPaymentProviderIdAction } from "@/app/actions/payment";
import { verifyScoutPayment } from "@/app/actions/scouts";

export type CardBrand = "Mastercard" | "Visa";

type CardProps = {
  amount: number;
  description: string;
  brand: CardBrand;
  registrationId: string;
  paymentRecordId: string;
};

export default function Card({
  amount,
  description,
  brand,
  registrationId,
  paymentRecordId,
}: CardProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [number, setNumber] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [code, setCode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  const createPaymentIntent = async () => {
    setPaymentStatus("Creating Payment Intent");
    const res = await fetch("/scout/membership/membership-registration/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount * 100,
            payment_method_allowed: ["card"],
            payment_method_options: {
              card: { request_three_d_secure: "any" },
            },
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
        Authorization: `Basic ${Buffer.from(
          process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC as string
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            details: {
              card_number: `${number}`,
              exp_month: parseInt(`${month}`),
              exp_year: parseInt(`${year}`),
              cvc: `${code}`,
            },
            billing: {
              name: `${name}`,
              email: `${email}`,
              phone: `${phone}`,
            },
            type: "card",
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

  const listenToPayment = async (fullClient: string) => {
    const paymentIntentId = fullClient.split("_client")[0];
    for (let i = 5; i > 0; i--) {
      setPaymentStatus(`Listening to Payment in ${i}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (i === 1) {
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
          .then((res) => res.data);

        if (!paymentIntentData) {
          setPaymentStatus("Could not check payment status");
          return;
        }

        if (paymentIntentData.attributes.last_payment_error) {
          setPaymentStatus(
            JSON.stringify(paymentIntentData.attributes.last_payment_error)
          );

          const verifyResult = await verifyScoutPayment(paymentRecordId, "failed");
          if (!verifyResult.success) {
            console.error("Failed to mark payment as failed:", verifyResult.error);
          }

          localStorage.setItem("paymentTransactionId", paymentIntentId);
          localStorage.setItem("paymentMethodLabel", brand);
          router.push("/scout/membership/membership-registration/success?status=failed");
        } else if (paymentIntentData.attributes.status === "succeeded") {
          setPaymentStatus("Payment Success");

          const verifyResult = await verifyScoutPayment(paymentRecordId, "paid");
          if (!verifyResult.success) {
            console.error("Failed to mark payment as paid:", verifyResult.error);
          }

          localStorage.setItem("paymentTransactionId", paymentIntentId);
          localStorage.setItem("paymentMethodLabel", brand);
          router.push("/scout/membership/membership-registration/success?status=success");
        } else {
          i = 5;
        }
      }
    }
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
          setPaymentStatus(status);
          window.open(paymentIntent.attributes.next_action.redirect.url, "_blank");
          listenToPayment(paymentIntent.attributes.client_key);
        } else if (status === "succeeded") {
          setPaymentStatus("Payment Success");

          verifyScoutPayment(paymentRecordId, "paid").then((verifyResult) => {
            if (!verifyResult.success) {
              console.error("Failed to mark payment as paid:", verifyResult.error);
            }
          });

          localStorage.setItem("paymentTransactionId", intent.id);
          localStorage.setItem("paymentMethodLabel", brand);
          router.push("/scout/membership/membership-registration/success?status=success");
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

  return (
    <section>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Card Information</h2>
        <input
          placeholder="Juan Dela Cruz"
          className="border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="user@domain.com"
          className="border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          placeholder="Card Number (4343434343434345)"
          className="border rounded px-3 py-2"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <input
            placeholder="MM"
            className="border rounded px-3 py-2 w-1/3"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />
          <input
            placeholder="YYYY"
            className="border rounded px-3 py-2 w-1/3"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
          <input
            placeholder="CVC"
            className="border rounded px-3 py-2 w-1/3"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="rounded bg-black text-white py-2 px-4">
          Pay
        </button>
        <p>{paymentStatus}</p>
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