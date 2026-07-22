"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import RegistrationStepper from "../../components/RegistrationStepper";

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
  onClick?: () => void;
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

export default function AdultScoutMethodPage() {
  const router = useRouter();
  const [isAdultScoutFlow, setIsAdultScoutFlow] = useState(false);
  const [amount, setAmount] = useState<string | null>(null);
  const [category, setCategory] = useState<"card" | "ewallet" | "online_banking" | "qrph" | "">("" );
  const [wallet, setWallet] = useState<"gcash" | "grabpay" | "maya" | "shopeepay" | "">("");
  const [cardBrand, setCardBrand] = useState<"mastercard" | "visa" | "">("");
  const [bank, setBank] = useState<"bpi" | "unionbank" | "bdo" | "landbank" | "metrobank" | "">("");

  useEffect(() => {
    setAmount(localStorage.getItem("paymentAmount"));
    setIsAdultScoutFlow(localStorage.getItem("membershipFlow") === "adult_scout");
  }, []);

  const onNext = () => {
    if (category === "card" && cardBrand !== "") {
      localStorage.setItem("paymentCardBrand", cardBrand === "mastercard" ? "Mastercard" : "Visa");
      router.push("/scout/membership/membership-registration/method/card");
      return;
    }

    if (category === "ewallet" && wallet !== "") {
      const walletTypeMap: Record<string, string> = {
        gcash: "gcash",
        grabpay: "grab_pay",
        maya: "paymaya",
        shopeepay: "shopee_pay",
      };
      localStorage.setItem("paymentWalletType", walletTypeMap[wallet]);
      router.push("/scout/membership/membership-registration/method/ewallet");
      return;
    }

    if (category === "qrph") {
      router.push("/scout/membership/membership-registration/method/qrph");
      return;
    }

    if (category === "online_banking" && bank !== "") {
      router.push(`/scout/membership/membership-registration/method/onlinebanking/${bank}`);
      return;
    }
  };

  const canProceed =
    (category === "card" && cardBrand !== "") ||
    category === "qrph" ||
    (category === "ewallet" && wallet !== "") ||
    (category === "online_banking" && bank !== "");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 text-zinc-900 shadow-xl sm:p-14">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-2xl text-zinc-700 sm:text-3xl"
          aria-label="Go back"
        >
          &lt;
        </button>

        <h1 className="mb-2 text-2xl font-bold text-green-800 sm:text-4xl">
          <Image
            src="/escout-logo.svg"
            alt="eScout Logo"
            width={115}
            height={115}
            className="h-auto w-[115px] object-contain"
          />
        </h1>
        <h2 className="mb-6 text-lg font-semibold sm:text-2xl">Adult Scout Registration</h2>

        <RegistrationStepper
          currentStep={isAdultScoutFlow ? 5 : 5}
          totalSteps={5}
          currentLabel="Payment Method"
          splitAfterStep={2}
        />

        <p className="mb-8 text-center text-lg text-zinc-600">Amount to pay: ₱{amount}</p>

        <div className="flex flex-col gap-3">
          <div className="rounded-lg border px-5 py-4">
            <label className="flex cursor-pointer items-center gap-3 text-lg">
              <input
                type="radio"
                name="category"
                checked={category === "card"}
                onChange={() => setCategory("card")}
                className="h-5 w-5 accent-green-800"
              />
              Credit / Debit Card
            </label>
            {category === "card" && (
              <div className="ml-8 mt-3 flex gap-3">
                <IconChip label="Mastercard" logoSrc="/scout/membership/membership-registration/logos/mastercard.png" active={cardBrand === "mastercard"} onClick={() => setCardBrand("mastercard")} />
                <IconChip label="Visa" logoSrc="/scout/membership/membership-registration/logos/visa.png" active={cardBrand === "visa"} onClick={() => setCardBrand("visa")} />
              </div>
            )}
          </div>

          <div className="rounded-lg border px-5 py-4">
            <label className="flex cursor-pointer items-center gap-3 text-lg">
              <input
                type="radio"
                name="category"
                checked={category === "ewallet"}
                onChange={() => setCategory("ewallet")}
                className="h-5 w-5 accent-green-800"
              />
              E-Wallets
            </label>
            {category === "ewallet" && (
              <div className="ml-8 mt-3 flex flex-wrap gap-3">
                <IconChip label="Maya" logoSrc="/scout/membership/membership-registration/logos/maya.png" active={wallet === "maya"} onClick={() => setWallet("maya")} />
                <IconChip label="GCash" logoSrc="/scout/membership/membership-registration/logos/gcash.png" active={wallet === "gcash"} onClick={() => setWallet("gcash")} />
                <IconChip label="GrabPay" logoSrc="/scout/membership/membership-registration/logos/grabpay.png" active={wallet === "grabpay"} onClick={() => setWallet("grabpay")} />
                <IconChip label="ShopeePay" logoSrc="/scout/membership/membership-registration/logos/shopeepay.png" active={wallet === "shopeepay"} onClick={() => setWallet("shopeepay")} />
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-zinc-50 px-5 py-4">
            <label className="flex cursor-not-allowed items-center gap-3 text-lg text-zinc-400">
              <input type="radio" name="category" disabled className="h-5 w-5 accent-zinc-300" />
              Online Banking
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-400">Coming soon</span>
            </label>
          </div>

          <div className="rounded-lg border px-5 py-4">
            <label className="flex cursor-pointer items-center gap-3 text-lg">
              <input
                type="radio"
                name="category"
                checked={category === "qrph"}
                onChange={() => setCategory("qrph")}
                className="h-5 w-5 accent-green-800"
              />
              QR Ph
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="mt-8 w-full rounded-lg bg-green-800 px-4 py-3.5 text-lg font-medium text-white transition-colors hover:bg-green-900 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
