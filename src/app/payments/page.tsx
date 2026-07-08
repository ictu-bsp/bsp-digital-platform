"use client";
// src/app/payments/page.tsx

import { useState } from "react";
import CreditCard from "./components/CreditCard";
import GCash from "./components/GCash";
import GrabPay from "./components/GrabPay";
import QRPay from "./components/QRPay";

// TODO: Replace with the real BSP registration fee per year.
// This is a placeholder value for testing only.
const FEE_PER_YEAR = 100;

export default function PaymentsTestPage() {
  const [paymentOption, setPaymentOption] = useState("0");
  const [years, setYears] = useState(1);

  const amount = FEE_PER_YEAR * years;
  const description = `Scout Membership Registration (${years} year${years > 1 ? "s" : ""})`;

  const displayPaymentForm = () => {
    if (paymentOption === "0") {
      return <CreditCard amount={amount} description={description} />;
    } else if (paymentOption === "1") {
      return <GCash amount={amount} description={description} />;
    } else if (paymentOption === "2") {
      return <GrabPay amount={amount} description={description} />;
    } else if (paymentOption === "3") {
      return <QRPay amount={amount} description={description} />;
    } else if (paymentOption === "4") {
      return (
        <div className="border rounded px-4 py-6 text-center text-zinc-500">
          Online Banking — coming soon
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center py-16 px-6 bg-zinc-50 min-h-screen">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 text-zinc-900">
        <h1 className="text-2xl font-semibold mb-1">Payment Test Page</h1>

        <label className="block text-sm font-medium mt-4 mb-1">
          Number of Years
        </label>
        <select
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="border rounded px-3 py-2 w-full mb-2"
        >
          <option value={1}>1 Year</option>
          <option value={2}>2 Years</option>
          <option value={3}>3 Years</option>
          <option value={4}>4 Years</option>
          <option value={5}>5 Years</option>
        </select>

        <p className="text-zinc-600 mb-6">
          Amount to pay: ₱{amount} (₱{FEE_PER_YEAR}/year — placeholder fee)
        </p>

        <form
          onChange={(e) =>
            setPaymentOption((e.target as unknown as HTMLInputElement).value)
          }
          className="flex flex-col gap-2 mb-6"
        >
          <label className="flex items-center gap-2 border rounded px-3 py-2">
            <input type="radio" name="paymentOption" value="0" defaultChecked />
            Credit Card
          </label>
          <label className="flex items-center gap-2 border rounded px-3 py-2">
            <input type="radio" name="paymentOption" value="1" />
            GCash
          </label>
          <label className="flex items-center gap-2 border rounded px-3 py-2">
            <input type="radio" name="paymentOption" value="2" />
            GrabPay
          </label>
          <label className="flex items-center gap-2 border rounded px-3 py-2">
            <input type="radio" name="paymentOption" value="3" />
            QR Ph
          </label>
          <label className="flex items-center gap-2 border rounded px-3 py-2">
            <input type="radio" name="paymentOption" value="4" />
            Online Banking
          </label>
        </form>

        {displayPaymentForm()}
      </div>
    </div>
  );
}