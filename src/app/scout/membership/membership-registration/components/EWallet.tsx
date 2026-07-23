//src/app/scout/membership/membership-registration/components/EWallet.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ConfirmationModal from "@/components-general/ui/ConfirmationModal";
import SuccessOverlay from "@/components-general/ui/SuccessOverlay";

import { setPaymentProviderIdAction } from "@/app/actions/payment";
import { verifyScoutPayment } from "@/app/actions/scouts";

export type WalletType =
  | "gcash"
  | "grab_pay"
  | "paymaya"
  | "shopee_pay";

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

// Strips non-digits, caps at 11 (PH mobile format: 09XXXXXXXXX).
const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, 11);

// Only accepts full addresses ending in @gmail.com or @yahoo.com.
const EMAIL_PATTERN = /^[^\s@]+@(gmail|yahoo)\.com$/i;

// gcash / grab_pay -> Source workflow.
// paymaya / shopee_pay -> Payment Intent workflow.
const SOURCE_WORKFLOW_TYPES: WalletType[] = [
  "gcash",
  "grab_pay",
];

export default function EWallet({
  amount,
  description,
  walletType,
  registrationId,
  paymentRecordId,
}: EWalletProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [paymentStatus, setPaymentStatus] =
    useState("");

  const [rawResponse, setRawResponse] =
    useState<string | null>(null);

  const [submitError, setSubmitError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const publicKey =
    process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC as string;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const label = WALLET_LABELS[walletType];

  const isSourceWorkflow =
    SOURCE_WORKFLOW_TYPES.includes(walletType);

  const isPhoneValid = phone.length === 11;
  const isEmailValid = EMAIL_PATTERN.test(email);
  const isFormValid = isPhoneValid && isEmailValid && name !== "";
      // ---------- Source workflow (GCash / GrabPay) ----------
  const createSource = async () => {
    setPaymentStatus("Creating Source");

    try {
      const res = await fetch(
        "https://api.paymongo.com/v1/sources",
        {
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
                billing: {
                  name,
                  phone,
                  email,
                },
                type: walletType,
                currency: "PHP",
                description,
                metadata: {
                  registrationId,
                  paymentRecordId,
                },
              },
            },
          }),
        }
      ).then((r) => r.json());

      if (!res?.data) {
        setRawResponse(JSON.stringify(res, null, 2));
        setSubmitError("Unable to create payment source.");
        return null;
      }

      await setPaymentProviderIdAction(
        paymentRecordId,
        res.data.id
      );

      return res.data;
    } catch (err) {
      console.error(err);

      setSubmitError(
        "Unable to create payment source."
      );

      return null;
    }
  };

  // ---------- Payment Intent workflow (Maya / ShopeePay) ----------
  const createPaymentIntent = async () => {
    setPaymentStatus("Creating Payment Intent");

    try {
      const res = await fetch(
        "/scout/membership/membership-registration/create-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              attributes: {
                amount: amount * 100,
                payment_method_allowed: [
                  walletType,
                ],
                currency: "PHP",
                description,
                statement_descriptor:
                  "descriptor business name",
                metadata: {
                  registrationId,
                  paymentRecordId,
                },
              },
            },
          }),
        }
      ).then((r) => r.json());

      if (!res.body) {
        setRawResponse(
          JSON.stringify(res, null, 2)
        );

        setSubmitError(
          "Unable to create Payment Intent."
        );

        return null;
      }

      const intentData = res.body.data;

      if (intentData?.id) {
        await setPaymentProviderIdAction(
          paymentRecordId,
          intentData.id
        );
      }

      return intentData;
    } catch (err) {
      console.error(err);

      setSubmitError(
        "Unable to create Payment Intent."
      );

      return null;
    }
  };
    const createPaymentMethod = async () => {
    setPaymentStatus(
      "Creating Payment Method"
    );

    try {
      const res = await fetch(
        "https://api.paymongo.com/v1/payment_methods",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
            Authorization: `Basic ${Buffer.from(
              publicKey
            ).toString("base64")}`,
          },
          body: JSON.stringify({
            data: {
              attributes: {
                type: walletType,
                billing: {
                  name,
                  email,
                  phone,
                },
              },
            },
          }),
        }
      )
        .then((r) => r.json())
        .catch((err) => ({
          errors: [
            {
              detail: JSON.stringify(err),
            },
          ],
        }));

      if (!res.data) {
        setRawResponse(
          JSON.stringify(res, null, 2)
        );

        setSubmitError(
          "Unable to create Payment Method."
        );

        return null;
      }

      return res.data;
    } catch (err) {
      console.error(err);

      setSubmitError(
        "Unable to create Payment Method."
      );

      return null;
    }
  };

  const attachIntentMethod = async (
    intent: any,
    method: any
  ) => {
    setPaymentStatus(
      "Attaching Intent to Method"
    );

    try {
      const res = await fetch(
        `https://api.paymongo.com/v1/payment_intents/${intent.id}/attach`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
            Authorization: `Basic ${Buffer.from(
              publicKey
            ).toString("base64")}`,
          },
          body: JSON.stringify({
            data: {
              attributes: {
                payment_method: method.id,
                client_key:
                  intent.attributes.client_key,
                return_url: `${baseUrl}/scout/membership/membership-registration/method/ewallet/return`,
              },
            },
          }),
        }
      ).then((r) => r.json());

      const paymentIntent = res.data;

      if (!paymentIntent) {
        setRawResponse(
          JSON.stringify(res, null, 2)
        );

        setSubmitError(
          "Unable to attach the payment method."
        );

        return;
      }

      const status =
        paymentIntent.attributes.status;
              if (
        status ===
        "awaiting_next_action"
      ) {
        setPaymentStatus(
          `Redirecting to ${label}...`
        );

        localStorage.setItem(
          "paymentIntentClientKey",
          paymentIntent.attributes.client_key
        );

        localStorage.setItem(
          "paymentMethodLabel",
          label
        );

        localStorage.setItem(
          "paymentRecordId",
          paymentRecordId
        );

        window.location.href =
          paymentIntent.attributes
            .next_action.redirect.url;

        return;
      }

      if (status === "succeeded") {
        setPaymentStatus(
          "Payment Success"
        );

        const verifyResult =
          await verifyScoutPayment(
            paymentRecordId,
            "paid"
          );

        if (!verifyResult.success) {
          console.error(
            "Failed to mark payment as paid:",
            verifyResult.error
          );
        }

        localStorage.setItem(
          "paymentTransactionId",
          intent.id
        );

        localStorage.setItem(
          "paymentMethodLabel",
          label
        );

        setShowSuccess(true);

        return;
      }

      setPaymentStatus(status);
    } catch (err) {
      console.error(err);

      setSubmitError(
        "Unable to attach payment."
      );
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError("");
      setRawResponse(null);

      if (isSourceWorkflow) {
        const source =
          await createSource();

        if (!source) {
          return;
        }

        localStorage.setItem(
          "paymentTransactionId",
          source.id
        );

        localStorage.setItem(
          "paymentMethodLabel",
          label
        );

        window.location.href =
          source.attributes.redirect
            .checkout_url;

        return;
      }

      const paymentIntent =
        await createPaymentIntent();
              if (!paymentIntent) {
        return;
      }

      const paymentMethod =
        await createPaymentMethod();

      if (!paymentMethod) {
        return;
      }

      await attachIntentMethod(
        paymentIntent,
        paymentMethod
      );
    } catch (err) {
      console.error(err);

      setSubmitError(
        "Unable to process payment."
      );
    } finally {
      setIsSubmitting(false);
    }
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
    <>
      <section>
        <form
          onSubmit={(e) =>
            e.preventDefault()
          }
          className="flex flex-col gap-4"
        >
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              Billing Information
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              You'll be redirected to {label} to
              authorize this payment.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">
              Full Name
            </label>

            <input
              placeholder="Juan Dela Cruz"
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 focus:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-800"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">
              Mobile Number
            </label>

            <input
              placeholder="09xxxxxxxxx"
              inputMode="numeric"
              maxLength={11}
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 focus:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-800"
              value={phone}
              onChange={(e) =>
                setPhone(digitsOnly(e.target.value))
              }
              required
            />
            {phone !== "" && phone.length < 11 && (
              <p className="text-xs text-amber-600">
                Enter a full 11-digit number (e.g. 09171234567)
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">
              Email Address
            </label>

            <input
              placeholder="user@gmail.com"
              type="email"
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 focus:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-800"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
            {email !== "" && !isEmailValid && (
              <p className="text-xs text-amber-600">
                Must be a full @gmail.com or @yahoo.com email address
              </p>
            )}
          </div>
                    {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {paymentStatus && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                isError
                  ? "border border-red-200 bg-red-50 text-red-700"
                  : paymentStatus ===
                    "Payment Success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-zinc-200 bg-zinc-50 text-zinc-600"
              }`}
            >
              {paymentStatus}
            </div>
          )}

          <button
            type="button"
            disabled={isBusy || isSubmitting || !isFormValid}
            onClick={() =>
              setShowConfirmation(true)
            }
            className="mt-2 rounded-lg bg-green-800 px-4 py-3 font-medium text-white transition-colors hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy || isSubmitting
              ? "Processing..."
              : `Pay ₱${amount}`}
          </button>

          {rawResponse && (
            <details>
              <summary>
                Raw response (only shows if
                something's off)
              </summary>

              <pre className="whitespace-pre-wrap text-xs">
                {rawResponse}
              </pre>
            </details>
          )}
        </form>
      </section>

      <ConfirmationModal
        open={showConfirmation}
        title="Proceed with Payment?"
        message={`You are about to pay ₱${amount} using ${label}.`}
        loading={isSubmitting}
        onCancel={() =>
          setShowConfirmation(false)
        }
        onConfirm={async () => {
          setShowConfirmation(false);
          await handleSubmit();
        }}
      />

      <SuccessOverlay
        open={showSuccess}
        title="Payment Successful"
        message="Your Scout Membership payment has been received successfully."
        subtitle="Redirecting..."
        onComplete={() => {
          router.push(
            "/scout/membership/membership-registration/success?status=success"
          );
        }}
      />
    </>
  );
}