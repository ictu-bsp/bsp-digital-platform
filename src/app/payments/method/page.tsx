"use client";
// src/app/payments/method/page.tsx
// Icon chips now render real logo images from /public/payments/logos/.
// Drop your logo files into public/payments/logos/ using these exact names:
//   mastercard.png  visa.png
//   maya.png  gcash.png  grabpay.png  shopeepay.png
//   bpi.png  unionbank.png  metrobank.png  landbank.png  bdo.png
//   qrph.png
// If a file is missing, the chip falls back to showing just the label text.

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
  onClick?: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${
        disabled
          ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
          : active
          ? "bg-green-800 text-white border-green-800"
          : "bg-white text-zinc-700 border-zinc-300 hover:border-green-800"
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

  const [amount, setAmount] = useState(null as string | null);
  const [category, setCategory] = useState(
    "" as "card" | "ewallet" | "online_banking" | "qrph" | ""
  );
  const [wallet, setWallet] = useState("" as "gcash" | "grabpay" | "maya" | "");
  const [cardBrand, setCardBrand] = useState("" as "mastercard" | "visa" | "");

  useEffect(() => {
    setAmount(localStorage.getItem("paymentAmount"));
  }, []);

  const onNext = () => {
    let path = "";
    if (category === "card" && cardBrand === "mastercard") path = "/payments/method/card";
    else if (category === "card" && cardBrand === "visa") path = "/payments/method/visa";
    else if (category === "qrph") path = "/payments/method/qrph";
    else if (category === "ewallet" && wallet === "gcash") path = "/payments/method/gcash";
    else if (category === "ewallet" && wallet === "grabpay") path = "/payments/method/grabpay";
    else if (category === "ewallet" && wallet === "maya") path = "/payments/method/maya";
    else return;

    router.push(path);
  };

  const canProceed =
    (category === "card" && cardBrand !== "") ||
    category === "qrph" ||
    (category === "ewallet" && wallet !== "");

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-14 text-zinc-900">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-3xl text-zinc-700 mb-1 self-start"
          aria-label="Go back"
        >
          &lt;
        </button>

        <h1 className="text-4xl font-bold text-green-800 mb-0">eScout</h1>
        <h2 className="text-2xl font-semibold mb-4">Register Membership</h2>

        <div className="flex items-center justify-center gap-3 text-base text-green-800 mb-8">
          <span className="w-8 h-8 rounded-full border-2 border-green-800 flex items-center justify-center">
            1
          </span>
          <span>|</span>
          <span className="w-8 h-8 rounded-full border-2 border-green-800 flex items-center justify-center">
            2
          </span>
          <span>|</span>
          <span className="flex items-center gap-2 bg-green-800 text-white rounded-full px-4 py-1.5">
            <span className="w-6 h-6 rounded-full bg-white text-green-800 flex items-center justify-center text-sm font-semibold">
              3
            </span>
            Payment Method
          </span>
        </div>

        <p className="text-zinc-600 text-lg text-center mb-8">Amount to pay: ₱{amount}</p>

        <div className="flex flex-col gap-3">

          {/* Credit / Debit Card */}
          <div className="border rounded-lg px-5 py-4">
            <label className="flex items-center gap-3 text-lg cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={category === "card"}
                onChange={() => setCategory("card")}
                className="w-5 h-5 accent-green-800"
              />
              Credit / Debit Card
            </label>
            {category === "card" && (
              <div className="flex gap-3 mt-3 ml-8">
                <IconChip
                  label="Mastercard"
                  logoSrc="/payments/logos/mastercard.png"
                  active={cardBrand === "mastercard"}
                  onClick={() => setCardBrand("mastercard")}
                />
                <IconChip
                  label="Visa"
                  logoSrc="/payments/logos/visa.png"
                  active={cardBrand === "visa"}
                  onClick={() => setCardBrand("visa")}
                />
              </div>
            )}
          </div>

          {/* E-Wallets */}
          <div className="border rounded-lg px-5 py-4">
            <label className="flex items-center gap-3 text-lg cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={category === "ewallet"}
                onChange={() => setCategory("ewallet")}
                className="w-5 h-5 accent-green-800"
              />
              E-Wallets
            </label>
            {category === "ewallet" && (
              <div className="flex gap-3 mt-3 ml-8 flex-wrap">
                <IconChip
                  label="Maya"
                  logoSrc="/payments/logos/maya.png"
                  active={wallet === "maya"}
                  onClick={() => setWallet("maya")}
                />
                <IconChip
                  label="GCash"
                  logoSrc="/payments/logos/gcash.png"
                  active={wallet === "gcash"}
                  onClick={() => setWallet("gcash")}
                />
                <IconChip
                  label="GrabPay"
                  logoSrc="/payments/logos/grabpay.png"
                  active={wallet === "grabpay"}
                  onClick={() => setWallet("grabpay")}
                />
                <IconChip label="ShopeePay" logoSrc="/payments/logos/shopeepay.png" disabled />
              </div>
            )}
          </div>

          {/* Online Banking */}
          <div className="border rounded-lg px-5 py-4">
            <label className="flex items-center gap-3 text-lg cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={category === "online_banking"}
                onChange={() => setCategory("online_banking")}
                className="w-5 h-5 accent-green-800"
              />
              Online Banking
            </label>
            {category === "online_banking" && (
              <div className="flex gap-3 mt-3 ml-8 flex-wrap">
                <IconChip label="BPI" logoSrc="/payments/logos/bpi.png" disabled />
                <IconChip label="UnionBank" logoSrc="/payments/logos/unionbank.png" disabled />
                <IconChip label="Metrobank" logoSrc="/payments/logos/metrobank.png" disabled />
                <IconChip label="LandBank" logoSrc="/payments/logos/landbank.png" disabled />
                <IconChip label="BDO" logoSrc="/payments/logos/bdo.png" disabled />
              </div>
            )}
          </div>

          {/* QR Ph */}
          <div className="border rounded-lg px-5 py-4">
            <label className="flex items-center gap-3 text-lg cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={category === "qrph"}
                onChange={() => setCategory("qrph")}
                className="w-5 h-5 accent-green-800"
              />
              QR Ph
            </label>
            {category === "qrph" && (
              <div className="flex gap-3 mt-3 ml-8">
                <IconChip label="QR Ph" logoSrc="/payments/logos/qrph.png" active />
              </div>
            )}
          </div>

        </div>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className="rounded-lg bg-green-800 hover:bg-green-900 transition-colors text-white text-lg font-medium py-3.5 px-4 mt-8 w-full disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
