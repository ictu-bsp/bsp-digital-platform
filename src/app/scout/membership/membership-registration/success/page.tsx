"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackButton from "@/components-general/ui/BackButton";
import jsPDF from "jspdf";


async function loadWatermarkAsPngDataUrl(
  svgUrl: string,
  size = 600
): Promise<string> {
  const svgText = await (await fetch(svgUrl)).text();
  const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
  const objectUrl = URL.createObjectURL(svgBlob);

  try {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load watermark SVG"));
      img.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    ctx.drawImage(img, 0, 0, size, size);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}


function formatTransactionId(id: string | null) {
  if (!id) return "—";
  // group into 4s for readability, e.g. pay_L6bawB3A -> 8907 2365 8711 style
  const clean = id.replace(/[^a-zA-Z0-9]/g, "");
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
}


function generateRandomDigits(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

function generateRandomAccountNumber(): string {
  // 10-digit bank-account-style number, e.g. 1907432198
  return generateRandomDigits(10);
}

function generateRandomConfirmationNumber(): string {
  // 20-digit long-form confirmation number, e.g. 00002026072714325940
  return generateRandomDigits(20);
}

function formatReceiptTimestamp() {
  const now = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const day = days[now.getDay()];
  const month = months[now.getMonth()];
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const year = now.getFullYear();
  return `${day} ${month} ${date} ${hours}:${minutes}:${seconds} PHT ${year}`;
}


async function generateReceiptPDF({
  transactionId,
  amount,
  methodLabel,
}: {
  transactionId: string | null;
  amount: string;
  methodLabel: string;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 56;
  let y = 60;

  // Watermark — faint BSP logo centered behind the receipt content.
  try {
    const watermarkDataUrl = await loadWatermarkAsPngDataUrl(
      "/bsp-logo-with-bkg.svg",
      600
    );
    const wmSize = 340;
    const wmX = (pageWidth - wmSize) / 2;
    const wmY = (pageHeight - wmSize) / 2;

    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.07 }));
    doc.addImage(watermarkDataUrl, "PNG", wmX, wmY, wmSize, wmSize);
    doc.restoreGraphicsState();
  } catch (err) {
    console.error("Receipt watermark failed to load:", err);
  }

  // Optional applicant info, if the wizard ever stores it — falls back
  // gracefully if these keys don't exist yet.
  const applicantName =
    typeof window !== "undefined"
      ? localStorage.getItem("paymentApplicantName")
      : null;
  const applicantEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("paymentApplicantEmail")
      : null;

  const referenceNumber = `${new Date().getFullYear()}-${generateRandomDigits(7)}`;
  const transactionNumber = formatTransactionId(transactionId);
  const debitAccountNo = generateRandomAccountNumber();
  const confirmationNumber = generateRandomConfirmationNumber();
  const confirmationDate = formatToday();

  // ---- Title ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(30, 30, 30);
  doc.text(
    `eScout ePayment Confirmation Receipt (${formatReceiptTimestamp()})`,
    marginX,
    y,
    { maxWidth: pageWidth - marginX * 2 }
  );

  y += 26;
  doc.setDrawColor(210, 210, 210);
  doc.line(marginX, y, pageWidth - marginX, y);

  // ---- From / To / Date header ----
  y += 26;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const headerRow = (label: string, value: string) => {
    doc.setTextColor(140, 140, 140);
    doc.text(label, marginX, y);
    doc.setTextColor(30, 30, 30);
    doc.text(value, marginX + 55, y);
    y += 20;
  };

  headerRow("From:", "escout-epayment@bsp.org.ph");
  headerRow("To:", applicantEmail ?? "member@example.com");
  headerRow("Date:", confirmationDate);

  y += 10;
  doc.setDrawColor(210, 210, 210);
  doc.line(marginX, y, pageWidth - marginX, y);

  // ---- Greeting + intro line ----
  y += 30;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(`Dear Mr./Ms. ${applicantName ?? "Scout Member"},`, marginX, y);

  y += 24;
  const introLines = doc.splitTextToSize(
    "This is to confirm that your transaction has been successfully completed based on the following details:",
    pageWidth - marginX * 2
  );
  doc.text(introLines, marginX, y);
  y += introLines.length * 16 + 14;

  // ---- Detail rows ----
  const detailRows: [string, string][] = [
    ["Reference Number", referenceNumber],
    ["Transaction Number", transactionNumber],
    ["Payment Amount", `PHP ${amount}`],
    ["Payment Method", methodLabel],
    ["Debit from Account No", debitAccountNo],
    ["LBP Confirmation Number", confirmationNumber],
    ["Payment Confirmation Date", confirmationDate],
    ["Transaction Status", "Transaction Completed Successfully"],
  ];

  doc.setFontSize(11.5);
  detailRows.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(label, marginX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 15, 15);
    doc.text(value, marginX + 220, y, { maxWidth: pageWidth - marginX - 220 - marginX });
    y += 22;
  });

  y += 18;
  doc.setDrawColor(210, 210, 210);
  doc.line(marginX, y, pageWidth - marginX, y);

  // ---- Footer ----
  y += 26;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(90, 90, 90);

  const footerLines = [
    "Please review the details of your transaction.",
    "",
    "For questions or concerns regarding this receipt, please contact the BSP",
    "Membership Support desk through your Local Council office.",
    "",
    "This is a system-generated notification. Replies to this message are not",
    "monitored or answered.",
    "",
    "Thank you, Scout!",
    "",
    "From the BSP eScout Payment Team",
  ];

  footerLines.forEach((line) => {
    doc.text(line, marginX, y);
    y += 15;
  });

  const fileNameSafeId = (transactionId ?? "receipt").replace(/[^a-zA-Z0-9]/g, "");
  doc.save(`eScout-Receipt-${fileNameSafeId}.pdf`);
}

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams?.get("status") === "failed" ? "failed" : "success";

  const [amount, setAmount] = useState("0.00");
  const [methodLabel, setMethodLabel] = useState("—");
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const storedAmount = localStorage.getItem("paymentAmount");
    const storedMethod = localStorage.getItem("paymentMethodLabel");
    const storedTxnId = localStorage.getItem("paymentTransactionId");

    if (storedAmount) setAmount(Number(storedAmount).toFixed(2));
    if (storedMethod) setMethodLabel(storedMethod);
    setTransactionId(storedTxnId);
  }, []);

  const isSuccess = status === "success";

  const onDone = () => {
    // Clear the one-time payment session data, then send them home.
    localStorage.removeItem("paymentAmount");
    localStorage.removeItem("paymentDescription");
    localStorage.removeItem("paymentYears");
    localStorage.removeItem("paymentCouncil");
    localStorage.removeItem("paymentMethodLabel");
    localStorage.removeItem("paymentTransactionId");
    router.replace("/scout/membership/verified-member");
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-14 text-zinc-900 flex flex-col min-h-[600px]">
        <div className="mb-4 self-start">
          <BackButton onClick={() => router.back()} />
        </div>

        <h1 className="text-4xl font-bold text-emerald-800">eScout</h1>
        <h2 className="text-2xl font-semibold text-emerald-800 mb-8">
          Register Membership
        </h2>

        <div className="flex flex-col items-center flex-1">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center mb-6 ${
              isSuccess ? "bg-emerald-50" : "bg-red-50"
            }`}
          >
            {isSuccess ? (
              <svg
                viewBox="0 0 24 24"
                className="w-16 h-16 text-emerald-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12.5l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="w-16 h-16 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          <h3
            className={`text-3xl font-bold mb-3 ${
              isSuccess ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {isSuccess ? "Payment Successful" : "Payment Failed"}
          </h3>

          <p className="text-lg text-zinc-500 text-center mb-8">
            {isSuccess
              ? "Kindly wait for your application to be approved by the respective Local Council. You'll receive a notification once your account is approved. Salamat, Scout."
              : "Something went wrong while processing your payment. No amount was deducted. Please try again."}
          </p>

          <div className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-6 flex flex-col gap-4">
            <p className="text-base font-semibold text-zinc-700 mb-1">
              Transaction Details
            </p>
            <div className="flex justify-between text-base">
              <span className="text-zinc-500">Transaction ID</span>
              <span className="font-medium">{formatTransactionId(transactionId)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-zinc-500">Date</span>
              <span className="font-medium">{formatToday()}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-zinc-500">Type of Transaction</span>
              <span className="font-medium">{methodLabel}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-zinc-500">Amount Paid</span>
              <span className="font-medium">₱ {amount}</span>
            </div>
          </div>
        </div>

        {isSuccess && (
          <button
            type="button"
            onClick={() => {
              void generateReceiptPDF({ transactionId, amount, methodLabel });
            }}
            className="rounded-lg py-3 px-4 mt-6 w-full border-2 border-emerald-800 text-emerald-800 text-lg font-medium hover:bg-emerald-50 transition-colors"
          >
            Download Receipt
          </button>
        )}

        <button
          type="button"
          onClick={onDone}
          className={`rounded-lg py-3.5 px-4 ${
            isSuccess ? "mt-3" : "mt-6"
          } w-full text-white text-lg font-medium transition-colors ${
            isSuccess ? "bg-emerald-800 hover:bg-emerald-900" : "bg-zinc-800 hover:bg-zinc-900"
          }`}
        >
          {isSuccess ? "Done" : "Try Again"}
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessPageContent />
    </Suspense>
  );
}
