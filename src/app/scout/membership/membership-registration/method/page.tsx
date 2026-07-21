//src/app/scout/membership/membership-registration/method/page.tsx 

"use client";

import ConfirmationModal from "@/components-general/ui/ConfirmationModal";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function IconChip({
  label,
  logoSrc,
  active,
  disabled,
  onClick,
}: {
  label: string;
  logoSrc?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () =>void;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
          : active
          ? "border-green-800 bg-green-800 text-white"
          : "border-zinc-300 bg-white text-zinc-700 hover:border-green-800"
      }`}
    >
      {logoSrc && !imgFailed && (
        <Image
          src={logoSrc}
          alt=""
          width={20}
          height={20}
          className="h-5 w-auto object-contain"
          onError={() => setImgFailed(true)}
        />
      )}

      {label}
    </button>
  );
}

export default function MethodPage() {
  const router = useRouter();

  const [amount, setAmount] = useState<string | null>(null);

  const [category, setCategory] = useState<
    "card" | "ewallet" | "online_banking" | "qrph" | ""
  >("");

  const [wallet, setWallet] = useState<
    "gcash" | "grabpay" | "maya" | "shopeepay" | ""
  >("");

  const [cardBrand, setCardBrand] = useState<
    "mastercard" | "visa" | ""
  >("");

  const [bank, setBank] = useState<
    "bpi" | "unionbank" | "bdo" | "landbank" | "metrobank" | ""
  >("");

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [submitError, setSubmitError] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    setAmount(localStorage.getItem("paymentAmount"));
  }, []);

  const canProceed =
    (category === "card" && cardBrand !== "") ||
    (category === "ewallet" && wallet !== "") ||
    category === "qrph" ||
    (category === "online_banking" && bank !== "");

  const onNext = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError("");

      if (category === "card") {
        localStorage.setItem(
          "paymentCardBrand",
          cardBrand === "mastercard"
            ? "Mastercard"
            : "Visa"
        );

        router.push(
          "/scout/membership/membership-registration/method/card"
        );

        return;
      }

      if (category === "ewallet") {
        const walletTypeMap: Record<string, string> = {
          gcash: "gcash",
          grabpay: "grab_pay",
          maya: "paymaya",
          shopeepay: "shopee_pay",
        };

        localStorage.setItem(
          "paymentWalletType",
          walletTypeMap[wallet]
        );

        router.push(
          "/scout/membership/membership-registration/method/ewallet"
        );

        return;
      }

      if (category === "qrph") {
        router.push(
          "/scout/membership/membership-registration/method/qrph"
        );

        return;
      }

      if (
        category === "online_banking" &&
        bank !== ""
      ) {
        router.push(
          `/scout/membership/membership-registration/method/onlinebanking/${bank}`
        );
      }
    } catch {
      setSubmitError(
        "Unable to continue. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
        <div className="w-full max-w-3xl rounded-2xl bg-white p-14 text-zinc-900 shadow-xl">

          <button
            type="button"
            onClick={() => router.back()}
            className="mb-1 self-start text-3xl text-zinc-700"
            aria-label="Go back"
          >
            &lt;
          </button>

          <h1 className="mb-0 text-4xl font-bold text-green-800">
            <Image
              src="/escout-logo.svg"
              alt="eScout Logo"
              width={115}
              height={115}
              className="h-auto w-[115px] object-contain"
            />
          </h1>

          <h2 className="mb-4 text-2xl font-semibold">
            Register Membership
          </h2>

          <div className="mb-8 flex items-center justify-center gap-3 text-base text-green-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-green-800">
              1
            </span>

            <span>|</span>

            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-green-800">
              2
            </span>

            <span>|</span>

            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-green-800">
              3
            </span>

            <span>|</span>

            <span className="flex items-center gap-2 rounded-full bg-green-800 px-4 py-1.5 text-white">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-semibold text-green-800">
                4
              </span>

              Payment Method
            </span>
          </div>

          <p className="mb-8 text-center text-lg text-zinc-600">
            Amount to pay: ₱{amount}
          </p>
          <div className="flex flex-col gap-3">

  {/* Credit / Debit Card */}
  <div className="rounded-lg border px-5 py-4">
    <label className="flex cursor-pointer items-center gap-3 text-lg">
      <input
        type="radio"
        name="category"
        checked={category === "card"}
        onChange={() => {
          setCategory("card");
          setWallet("");
          setBank("");
        }}
        className="h-5 w-5 accent-green-800"
      />

      Credit / Debit Card
    </label>

    {category === "card" && (
      <div className="ml-8 mt-3 flex gap-3">

        <IconChip
          label="Mastercard"
          logoSrc="/scout/membership/membership-registration/logos/mastercard.png"
          active={cardBrand === "mastercard"}
          onClick={() => setCardBrand("mastercard")}
        />

        <IconChip
          label="Visa"
          logoSrc="/scout/membership/membership-registration/logos/visa.png"
          active={cardBrand === "visa"}
          onClick={() => setCardBrand("visa")}
        />

      </div>
    )}
  </div>

  {/* E-Wallets */}
  <div className="rounded-lg border px-5 py-4">
    <label className="flex cursor-pointer items-center gap-3 text-lg">
      <input
        type="radio"
        name="category"
        checked={category === "ewallet"}
        onChange={() => {
          setCategory("ewallet");
          setCardBrand("");
          setBank("");
        }}
        className="h-5 w-5 accent-green-800"
      />

      E-Wallets
    </label>

    {category === "ewallet" && (
      <div className="ml-8 mt-3 flex flex-wrap gap-3">

        <IconChip
          label="Maya"
          logoSrc="/scout/membership/membership-registration/logos/maya.png"
          active={wallet === "maya"}
          onClick={() => setWallet("maya")}
        />

        <IconChip
          label="GCash"
          logoSrc="/scout/membership/membership-registration/logos/gcash.png"
          active={wallet === "gcash"}
          onClick={() => setWallet("gcash")}
        />

        <IconChip
          label="GrabPay"
          logoSrc="/scout/membership/membership-registration/logos/grabpay.png"
          active={wallet === "grabpay"}
          onClick={() => setWallet("grabpay")}
        />

        <IconChip
          label="ShopeePay"
          logoSrc="/scout/membership/membership-registration/logos/shopeepay.png"
          active={wallet === "shopeepay"}
          onClick={() => setWallet("shopeepay")}
        />

      </div>
    )}
  </div>

  {/* Online Banking */}
  <div className="rounded-lg border bg-zinc-50 px-5 py-4">

    <label className="flex cursor-not-allowed items-center gap-3 text-lg text-zinc-400">

      <input
        type="radio"
        disabled
        className="h-5 w-5 accent-zinc-300"
      />

      Online Banking

      <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-400">
        Coming soon
      </span>

    </label>

    <div className="ml-8 mt-3 flex flex-wrap gap-3">

      <IconChip
        label="BPI"
        logoSrc="/scout/membership/membership-registration/logos/bpi.png"
        disabled
      />

      <IconChip
        label="UnionBank"
        logoSrc="/scout/membership/membership-registration/logos/unionbank.png"
        disabled
      />

      <IconChip
        label="Metrobank"
        logoSrc="/scout/membership/membership-registration/logos/metrobank.png"
        disabled
      />

      <IconChip
        label="LandBank"
        logoSrc="/scout/membership/membership-registration/logos/landbank.png"
        disabled
      />

      <IconChip
        label="BDO"
        logoSrc="/scout/membership/membership-registration/logos/bdo.png"
        disabled
      />

    </div>

  </div>

  {/* QR PH */}
  <div className="rounded-lg border px-5 py-4">

    <label className="flex cursor-pointer items-center gap-3 text-lg">

      <input
        type="radio"
        name="category"
        checked={category === "qrph"}
        onChange={() => {
          setCategory("qrph");
          setWallet("");
          setCardBrand("");
          setBank("");
        }}
        className="h-5 w-5 accent-green-800"
      />

      QR Ph

    </label>

    {category === "qrph" && (
      <div className="ml-8 mt-3 flex gap-3">

        <IconChip
          label="QR Ph"
          logoSrc="/scout/membership/membership-registration/logos/qrph.png"
          active
        />

      </div>
    )}

  </div>

</div>
        {submitError && (
          <p className="mt-4 text-center text-red-600">
            {submitError}
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowConfirmation(true)}
          disabled={!canProceed || isSubmitting}
          className="mt-8 w-full rounded-lg bg-green-800 px-4 py-3.5 text-lg font-medium text-white transition-colors hover:bg-green-900 disabled:opacity-40"
        >
          {isSubmitting ? "Processing..." : "Next"}
        </button>

        <ConfirmationModal
          open={showConfirmation}
          title="Proceed to Payment?"
          message={`You are about to pay ₱${amount ?? "0"} for your Scout Membership Registration.`}
          loading={isSubmitting}
          onCancel={() => setShowConfirmation(false)}
          onConfirm={async () => {
            setShowConfirmation(false);
            await onNext();
          }}
        />

      </div>
    </div>
  </>
);
}