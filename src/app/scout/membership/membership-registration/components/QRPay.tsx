"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type QRPayProps = {
  amount: number;
  description: string;
};

export default function QRPay({ amount, description }: QRPayProps) {
  const router = useRouter();
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const createPaymentIntent = async () => {
    const paymentIntent = await fetch("/scout/membership/membership-registration/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount * 100,
            payment_method_allowed: ["qrph"],
            currency: "PHP",
            description: description,
            statement_descriptor: "descriptor business name",
          },
        },
      }),
    })
      .then((res) => res.json())
      .then((res) => res.body.data);
    return paymentIntent;
  };

  const createPaymentMethod = async () => {
    const paymentMethod = await fetch(
      "https://api.paymongo.com/v1/payment_methods",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC as string
          ).toString("base64")}`,
        },
        body: JSON.stringify({
          data: { attributes: { type: "qrph" } },
        }),
      }
    )
      .then((res) => res.json())
      .then((res) => res.data)
      .catch((err) => {
        setStatus(JSON.stringify(err));
      });
    return paymentMethod;
  };

  const attachIntentMethod = async (intent: any, method: any) => {
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
            payment_method: method.id,
            client_key: intent.attributes.client_key,
          },
        },
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        const paymentIntent = res.data;

        if (!paymentIntent) {
          setStatus("Attach failed. See raw response below.");
          setRawResponse(JSON.stringify(res, null, 2));
          return;
        }

        const nextAction = paymentIntent.attributes.next_action;
        setRawResponse(JSON.stringify(nextAction, null, 2));

        const testUrl = nextAction?.code?.test_url;

        if (testUrl) {
          const generatedQr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
            testUrl
          )}`;
          setQrImage(generatedQr);
          setStatus("Scan this QR (safe test mode) or open the link below it");
        } else {
          setStatus("No test_url found — check raw response below");
        }

        listenToPayment(paymentIntent.id, intent.attributes.client_key);
      })
      .catch((err) => {
        setStatus(JSON.stringify(err));
      });
  };

  const listenToPayment = async (paymentIntentId: string, clientKey: string) => {
    for (let i = 5; i > 0; i--) {
      setStatus(`Waiting for payment... (${i})`);
      await new Promise((r) => setTimeout(r, 1000));
      if (i === 1) {
        const data = await fetch(
          `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}?client_key=${clientKey}`,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(
                process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC as string
              ).toString("base64")}`,
            },
          }
        )
          .then((r) => r.json())
          .then((r) => r.data);

        if (!data) {
          setStatus("Could not check payment status (see raw response above)");
          return;
        }

        if (data.attributes.status === "succeeded") {
          setStatus("Payment Success");
          localStorage.setItem("paymentTransactionId", paymentIntentId);
          localStorage.setItem("paymentMethodLabel", "QR Ph");
          router.push("/membership-registration/success?status=success");
        } else {
          i = 5;
        }
      }
    }
  };

  const handleGenerateQR = async () => {
    setStatus("Creating QR Code...");
    const intent = await createPaymentIntent();
    const method = await createPaymentMethod();
    await attachIntentMethod(intent, method);
  };

  return (
    <div>
      {!qrImage ? (
        <button
          type="button"
          onClick={handleGenerateQR}
          className="rounded bg-black text-white py-2 px-4"
        >
          Generate QR Code
        </button>
      ) : (
        <div>
          <img src={qrImage} alt="Scan to simulate payment" width={250} />
          <p>{status}</p>
        </div>
      )}
      {rawResponse && (
        <details className="mt-4">
          <summary>Raw response (only shows if something's off)</summary>
          <pre className="whitespace-pre-wrap text-xs">{rawResponse}</pre>
        </details>
      )}
    </div>
  );
}
