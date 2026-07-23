//src/app/scout/membership/membership-registration/components/Card.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ConfirmationModal from "@/components-general/ui/ConfirmationModal";
import SuccessModal from "@/components-general/ui/SuccessOverlay";

import { setPaymentProviderIdAction } from "@/app/actions/payment";
import { verifyScoutPayment } from "@/app/actions/scouts";

export type CardBrand = "Mastercard" | "Visa";

// Strips non-digits, caps at 11 (PH mobile format: 09XXXXXXXXX).
const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, 11);

// Only accepts full addresses ending in @gmail.com or @yahoo.com.
const EMAIL_PATTERN = /^[^\s@]+@(gmail|yahoo)\.com$/i;

// Generic digit-stripper with a custom max length, for card fields.
const digitsOnlyMax = (value: string, max: number) =>
  value.replace(/\D/g, "").slice(0, max);

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

  const [paymentStatus, setPaymentStatus] =
    useState("");

  const [rawResponse, setRawResponse] =
    useState<string | null>(null);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const createPaymentIntent = async () => {
    setPaymentStatus("Creating Payment Intent");

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
              payment_method_allowed: ["card"],
              payment_method_options: {
                card: {
                  request_three_d_secure: "any",
                },
              },
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
      return null;
    }

    const intent = res.body.data;

    if (intent?.id) {
      await setPaymentProviderIdAction(
        paymentRecordId,
        intent.id
      );
    }

    return intent;
  };
  
  const createPaymentMethod = async () => {
    setPaymentStatus("Creating Payment Method");

    const res = await fetch(
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
          data: {
            attributes: {
              details: {
                card_number: number,
                exp_month: parseInt(month),
                exp_year: parseInt(year),
                cvc: code,
              },
              billing: {
                name,
                email,
                phone,
              },
              type: "card",
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
      return null;
    }

    return res.data;
  };

  const listenToPayment = async (
    clientKey: string
  ) => {
    const paymentIntentId =
      clientKey.split("_client")[0];

    for (let i = 5; i > 0; i--) {
      setPaymentStatus(
        `Waiting for payment (${i})`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      if (i !== 1) continue;

      const paymentIntent = await fetch(
        `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}?client_key=${clientKey}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              process.env
                .NEXT_PUBLIC_PAYMONGO_PUBLIC as string
            ).toString("base64")}`,
          },
        }
      )
        .then((r) => r.json())
        .then((r) => r.data);

      if (!paymentIntent) {
        setPaymentStatus(
          "Unable to verify payment."
        );
        return;
      }

      if (
        paymentIntent.attributes
          .last_payment_error
      ) {
        await verifyScoutPayment(
          paymentRecordId,
          "failed"
        );

        localStorage.setItem(
          "paymentTransactionId",
          paymentIntentId
        );

        localStorage.setItem(
          "paymentMethodLabel",
          brand
        );

        router.push(
          "/scout/membership/membership-registration/success?status=failed"
        );

        return;
      }

      if (
        paymentIntent.attributes.status ===
        "succeeded"
      ) {
        await verifyScoutPayment(
          paymentRecordId,
          "paid"
        );

        localStorage.setItem(
          "paymentTransactionId",
          paymentIntentId
        );

        localStorage.setItem(
          "paymentMethodLabel",
          brand
        );

        setPaymentStatus(
          "Payment Successful"
        );

        setShowSuccess(true);

        return;
      }

      i = 5;
    }
  };
  
  const attachIntentMethod = async (
    intent: any,
    method: any
  ) => {
    setPaymentStatus(
      "Attaching Payment Method"
    );

    fetch(
      `https://api.paymongo.com/v1/payment_intents/${intent.id}/attach`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type":
            "application/json",
          Authorization: `Basic ${Buffer.from(
            process.env
              .NEXT_PUBLIC_PAYMONGO_PUBLIC as string
          ).toString("base64")}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: method.id,
              client_key:
                intent.attributes.client_key,
            },
          },
        }),
      }
    )
      .then((r) => r.json())
      .then(async (res) => {
        const paymentIntent = res.data;

        if (!paymentIntent) {
          setRawResponse(
            JSON.stringify(res, null, 2)
          );

          setSubmitError(
            "Unable to attach payment method."
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
            "Waiting for authentication..."
          );

          window.open(
            paymentIntent.attributes
              .next_action.redirect.url,
            "_blank"
          );

          await listenToPayment(
            paymentIntent.attributes
              .client_key
          );

          return;
        }

        if (status === "succeeded") {
          const verifyResult =
            await verifyScoutPayment(
              paymentRecordId,
              "paid"
            );

          if (!verifyResult.success) {
            console.error(
              verifyResult.error
            );
          }

          localStorage.setItem(
            "paymentTransactionId",
            intent.id
          );

          localStorage.setItem(
            "paymentMethodLabel",
            brand
          );

          setPaymentStatus(
            "Payment Successful"
          );

          setShowSuccess(true);

          return;
        }

        setPaymentStatus(status);
      })
      .catch((err) => {
        setSubmitError(
          "Payment failed."
        );

        setPaymentStatus(
          JSON.stringify(err)
        );
      });
  };

    const isPhoneValid = phone.length === 11;
  const isEmailValid = EMAIL_PATTERN.test(email);
  const isCardNumberValid = number.length === 16;
  const isMonthValid =
    month.length === 2 && Number(month) >= 1 && Number(month) <= 12;
  const isYearValid = year.length === 4;
  const isCvcValid = code.length === 3;
  const isFormValid =
    isPhoneValid &&
    isEmailValid &&
    isCardNumberValid &&
    isMonthValid &&
    isYearValid &&
    isCvcValid &&
    name !== "";

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError("");
      setRawResponse(null);

      const paymentIntent =
        await createPaymentIntent();

      if (!paymentIntent) {
        setSubmitError(
          "Unable to create the payment."
        );
        return;
      }

      const paymentMethod =
        await createPaymentMethod();

      if (!paymentMethod) {
        setSubmitError(
          "Unable to create the payment method."
        );
        return;
      }

      await attachIntentMethod(
        paymentIntent,
        paymentMethod
      );
    } catch (error) {
      console.error(error);

      setSubmitError(
        "An unexpected error occurred while processing your payment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-3"
      >
        <h2 className="text-lg font-semibold">
          Card Information
        </h2>

        <input
          placeholder="Juan Dela Cruz"
          className="rounded border px-3 py-2"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          required
        />

        <input
          placeholder="user@gmail.com"
          type="email"
          className="rounded border px-3 py-2"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />
        {email !== "" && !isEmailValid && (
          <p className="text-xs text-amber-600 -mt-2">
            Must be a full @gmail.com or @yahoo.com email address
          </p>
        )}

        <input
          placeholder="09xxxxxxxxx"
          inputMode="numeric"
          maxLength={11}
          className="rounded border px-3 py-2"
          value={phone}
          onChange={(e) =>
            setPhone(digitsOnly(e.target.value))
          }
          required
        />
        {phone !== "" && phone.length < 11 && (
          <p className="text-xs text-amber-600 -mt-2">
            Enter a full 11-digit number (e.g. 09171234567)
          </p>
        )}

        <input
          placeholder="Card Number (4343434343434345)"
          inputMode="numeric"
          maxLength={16}
          className="rounded border px-3 py-2"
          value={number}
          onChange={(e) =>
            setNumber(digitsOnlyMax(e.target.value, 16))
          }
          required
        />
        {number !== "" && number.length < 16 && (
          <p className="text-xs text-amber-600 -mt-2">
            Card number must be 16 digits
          </p>
        )}

        <div className="flex gap-2">
          <input
            placeholder="MM"
            inputMode="numeric"
            maxLength={2}
            className="w-1/3 rounded border px-3 py-2"
            value={month}
            onChange={(e) =>
              setMonth(digitsOnlyMax(e.target.value, 2))
            }
            required
          />

          <input
            placeholder="YYYY"
            inputMode="numeric"
            maxLength={4}
            className="w-1/3 rounded border px-3 py-2"
            value={year}
            onChange={(e) =>
              setYear(digitsOnlyMax(e.target.value, 4))
            }
            required
          />

          <input
            placeholder="CVC"
            inputMode="numeric"
            maxLength={3}
            className="w-1/3 rounded border px-3 py-2"
            value={code}
            onChange={(e) =>
              setCode(digitsOnlyMax(e.target.value, 3))
            }
            required
          />

        </div>
        {month !== "" && !isMonthValid && (
          <p className="text-xs text-amber-600 -mt-2">
            Month must be 01–12
          </p>
        )}
        {year !== "" && year.length < 4 && (
          <p className="text-xs text-amber-600 -mt-2">
            Enter a full 4-digit year (e.g. 2027)
          </p>
        )}
        {code !== "" && code.length < 3 && (
          <p className="text-xs text-amber-600 -mt-2">
            CVC must be 3 digits
          </p>
        )}

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <button
          type="button"
          disabled={isSubmitting || !isFormValid}
          onClick={() => setShowConfirmation(true)}
          className="rounded bg-black px-4 py-2 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Processing..."
            : `Pay ₱${amount}`}
        </button>

        {paymentStatus && (
          <p className="text-sm text-zinc-600">
            {paymentStatus}
          </p>
        )}

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

      <ConfirmationModal
        open={showConfirmation}
        title="Proceed with Payment?"
        message={`You are about to pay ₱${amount} using ${brand}.`}
        loading={isSubmitting}
        onCancel={() =>
          setShowConfirmation(false)
        }
        onConfirm={async () => {
          setShowConfirmation(false);
          await onSubmit();
        }}
      />

      <SuccessModal
        open={showSuccess}
        title="Payment Successful"
        message="Your Scout Membership payment has been received successfully."
        subtitle="Continue"
        onComplete={() => {
          router.push(
            "/scout/membership/membership-registration/success?status=success"
          );
        }}
      />
    </section>
  );
}