// src/app/scout/membership/verified-member/VerifiedMemberCard.tsx
"use client";

import PageLayout from "../../../components/PageLayout";
import MembershipCertificateModal from "@/app/scout/components/MembershipCertificateModal";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useRouter } from "next/navigation";

export type VerifiedMemberData = {
  firstName: string;
  middleInitial: string;
  lastName: string;
  designation: string;
  council: string;
  idNumber: string;
  validUntil: string;
  validUntilRaw: string | null;
  status: string;
  dob: string;
  sex: string;
  bloodType: string;
  sponsoringInst: string;
  address: string;
  telephone: string;
  email: string;
  emergencyContact: string;
  emergencyRelationship: string;
  emergencyContactNum: string;
};

type CardVariant = "live" | "capture";

// Standard CR80 ID Card dimensions (mm & pixels at ~300 DPI equivalent)
const CAPTURE_WIDTH = 1012; // 85.6mm at 300 DPI equivalent
const CAPTURE_HEIGHT = 638; // 53.98mm at 300 DPI equivalent

// Helper component to scale down long string values dynamically to fit inside ID card boundaries
function ShrinkToFit({
  text,
  maxFontSize,
  minFontSize,
  className,
}: {
  text: string;
  maxFontSize: number;
  minFontSize?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);
  const floor = minFontSize ?? maxFontSize * 0.55;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let size = maxFontSize;
    el.style.fontSize = `${size}px`;
    // Step down font size iteratively if content overflows width
    while (el.scrollWidth > el.clientWidth && size > floor) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
    setFontSize(size);
  }, [text, maxFontSize, floor]);

  return (
    <span
      ref={ref}
      style={{ fontSize }}
      className={`${className ?? ""} block overflow-hidden whitespace-nowrap`}
    >
      {text}
    </span>
  );
}

// Renders the front face of the ID card with member photo, council details, and ID number
function CardFront({
  userData,
  avatarUrl,
  variant = "live",
}: {
  userData: VerifiedMemberData;
  avatarUrl?: string;
  variant?: CardVariant;
}) {
  // Scaling factors for live UI view vs export-quality capture
  const fs =
    variant === "capture"
      ? {
          org: 22,
          addr: 16,
          valid: 18,
          data: 24,
          label: 14,
          nophoto: 20,
          title: 30,
          id: 34,
          avatar: 220,
        }
      : {
          org: 9,
          addr: 7,
          valid: 7,
          data: 10,
          label: 5,
          nophoto: 8,
          title: 12,
          id: 14,
          avatar: 80,
        };

  return (
    <div className="relative w-full h-full rounded-2xl bg-[#F1F7EC] p-4 shadow-md border border-gray-200 overflow-hidden flex flex-col justify-between pl-9 select-none">
      <div className="absolute top-0 left-0 bottom-0 w-6 flex flex-row">
        <div className="h-full w-1/2 bg-red-600" />
        <div className="h-full w-1/2 bg-blue-800" />
      </div>
      <div className="flex items-center gap-2">
        {variant === "capture" ? (
          <img
            src="/bsp-logo-with-bkg.svg"
            alt="BSP Logo"
            style={{ width: fs.avatar * 0.4, height: fs.avatar * 0.4 }}
            className="shrink-0 object-contain"
          />
        ) : (
          <Image
            src="/bsp-logo-with-bkg.svg"
            alt="BSP Logo"
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 object-contain"
          />
        )}
        <div
          style={{ fontSize: fs.org }}
          className="uppercase leading-tight font-bold text-blue-900 tracking-wide"
        >
          <p>Boy Scouts of the Philippines</p>
          <p className="font-normal text-gray-600">National Office</p>
          <p
            style={{ fontSize: fs.addr }}
            className="font-light normal-case text-gray-400"
          >
            181 Natividad Almeda-Lopez St., Ermita, Manila
          </p>
        </div>
      </div>
      <div className="text-center">
        <h3
          style={{ fontSize: fs.title }}
          className="font-bold text-red-500 uppercase tracking-widest leading-none"
        >
          Membership Card
        </h3>
        <span
          style={{ fontSize: fs.valid }}
          className="font-bold text-blue-900 uppercase block mt-0.5"
        >
          Valid Until: {userData.validUntil}
        </span>
      </div>
      <div className="grid grid-cols-3 items-end gap-2">
        <div
          style={{ fontSize: fs.data }}
          className="col-span-2 space-y-2 pb-1"
        >
          <div className="flex flex-col">
            <span className="font-bold text-blue-900 border-b border-blue-900/40 pb-0.5 leading-none truncate">
              {userData.lastName}, {userData.firstName} {userData.middleInitial}
            </span>
            <span
              style={{ fontSize: fs.label }}
              className="text-gray-400 uppercase font-bold tracking-tight pt-0.5 block"
            >
              Name
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-blue-900 border-b border-blue-900/40 pb-0.5 leading-none truncate">
              {userData.designation}
            </span>
            <span
              style={{ fontSize: fs.label }}
              className="text-gray-400 uppercase font-bold tracking-tight pt-0.5 block"
            >
              Designation
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-blue-900 border-b border-blue-900/40 pb-0.5 leading-none truncate">
              {userData.council}
            </span>
            <span
              style={{ fontSize: fs.label }}
              className="text-gray-400 uppercase font-bold tracking-tight pt-0.5 block"
            >
              Council
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-end">
          <div
            style={{ height: fs.avatar, width: fs.avatar }}
            className="relative overflow-hidden border border-gray-400 bg-gray-200 shadow-sm mb-2.5 flex items-center justify-center"
          >
            {avatarUrl ? (
              variant === "capture" ? (
                <img
                  src={avatarUrl}
                  alt={`${userData.firstName} ${userData.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={avatarUrl}
                  alt={`${userData.firstName} ${userData.lastName}`}
                  fill
                  className="object-cover"
                  sizes={`${fs.avatar}px`}
                />
              )
            ) : (
              <div
                style={{ fontSize: fs.nophoto }}
                className="flex h-full w-full items-center justify-center bg-gray-300 text-gray-500 text-center p-1 font-medium"
              >
                No Photo
              </div>
            )}
          </div>
          <div
            style={{ width: fs.avatar }}
            className="border-t border-blue-900 pt-1 text-center"
          >
            <span
              style={{ fontSize: fs.label }}
              className="block font-bold text-blue-900/70 uppercase tracking-tight leading-none"
            >
              Signature of Member
            </span>
          </div>
        </div>
      </div>
      <div
        style={{ fontSize: fs.valid }}
        className="flex justify-between items-end text-blue-900 pb-0.5"
      >
        <div className="flex flex-col items-center">
          <div
            style={{ width: fs.avatar }}
            className="border-t border-blue-900 pt-0.5 text-center"
          >
            <span
              style={{ fontSize: fs.label }}
              className="block uppercase font-medium text-blue-900/80 tracking-tight"
            >
              Council Chairperson
            </span>
          </div>
        </div>
        <div
          style={{ fontSize: fs.id }}
          className="text-right font-serif font-bold text-red-600 tracking-tight leading-none"
        >
          № <span className="tracking-normal">{userData.idNumber}</span>
        </div>
      </div>
    </div>
  );
}

// Renders the back face of the ID card with correct field-to-label alignment and safe fallbacks
function CardBack({
  userData,
  variant = "live",
}: {
  userData: VerifiedMemberData;
  variant?: CardVariant;
}) {
  const fs =
    variant === "capture"
      ? { data: 20, label: 13, micro: 12 }
      : { data: 8, label: 5, micro: 4.5 };
  // Formats empty or "N/A" data strings safely for rendering
  const displayVal = (val?: string) =>
    val && val.trim() !== "" && val.toUpperCase() !== "N/A" ? val : "—";

  return (
    <div className="relative w-full h-full rounded-2xl bg-[#f4f7f4] p-4 shadow-md border border-gray-200 overflow-hidden flex flex-col justify-between pr-8 select-none">
      <div className="absolute top-0 right-0 bottom-0 w-6 flex flex-row">
        <div className="h-full w-1/2 bg-blue-800" />
        <div className="h-full w-1/2 bg-red-600" />
      </div>
      <div
        style={{ fontSize: fs.data }}
        className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-blue-950 pt-1"
      >
        <div className="space-y-1">
          <div className="flex flex-col">
            <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
              {userData.lastName}, {userData.firstName} {userData.middleInitial}
            </span>
            <span
              style={{ fontSize: fs.label }}
              className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block"
            >
              Name of Scout
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
              {displayVal(userData.sponsoringInst)}
            </span>
            <span
              style={{ fontSize: fs.label }}
              className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block"
            >
              Sponsoring Institution
            </span>
          </div>
          <div className="flex flex-col">
            <ShrinkToFit
              text={displayVal(userData.address)}
              maxFontSize={fs.data}
              className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 leading-none"
            />
            <span
              style={{ fontSize: fs.label }}
              className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block"
            >
              Address
            </span>
          </div>
          <div className="pt-0.5">
            <span
              style={{ fontSize: fs.micro }}
              className="block font-bold text-blue-900/80 uppercase tracking-tighter italic"
            >
              In case of emergency, please contact:
            </span>
            <div className="flex flex-col mt-0.5">
              <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                {displayVal(userData.emergencyContact)}
              </span>
              <span
                style={{ fontSize: fs.label }}
                className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block"
              >
                Name
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex flex-col">
            <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
              {displayVal(userData.dob)}
            </span>
            <span
              style={{ fontSize: fs.label }}
              className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block"
            >
              Date of Birth
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                {displayVal(userData.sex)}
              </span>
              <span
                style={{ fontSize: fs.label }}
                className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block"
              >
                Sex
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                {displayVal(userData.bloodType)}
              </span>
              <span
                style={{ fontSize: fs.label }}
                className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block"
              >
                Blood Type
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
              {displayVal(userData.telephone)}
            </span>
            <span
              style={{ fontSize: fs.label }}
              className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block"
            >
              Telephone Number
            </span>
          </div>
          <div className="flex flex-col pt-1.5">
            <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
              {displayVal(userData.emergencyRelationship)}
            </span>
            <span
              style={{ fontSize: fs.label }}
              className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block"
            >
              Relationship
            </span>
          </div>
        </div>
      </div>
      <div
        style={{ fontSize: fs.data }}
        className="grid grid-cols-2 gap-x-4 items-end text-blue-950 pb-0.5"
      >
        <div className="flex flex-col">
          <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
            {displayVal(userData.email)}
          </span>
          <span
            style={{ fontSize: fs.label }}
            className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block"
          >
            E-mail
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
            {displayVal(userData.emergencyContactNum)}
          </span>
          <span
            style={{ fontSize: fs.label }}
            className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block"
          >
            Contact Number
          </span>
        </div>
      </div>
      <div className="flex justify-between items-end mt-1 text-center">
        <p
          style={{ fontSize: fs.micro }}
          className="text-blue-900/60 font-medium italic tracking-tighter w-7/12 text-left leading-tight pb-0.5"
        >
          Member is entitled to all the benefits provided under the BSP
          Financial Assistance Program
        </p>
        <div className="w-28 border-t border-blue-900 pt-1 flex flex-col items-center">
          <span
            style={{ fontSize: fs.micro }}
            className="block font-bold text-blue-900 uppercase tracking-tighter leading-none"
          >
            Name & Signature of Institutional Head
          </span>
        </div>
      </div>
    </div>
  );
}

// Main page view managing flip interactions, modal visibility, and PDF generation
export default function VerifiedMemberCard({
  userName,
  avatarUrl,
  userData,
}: {
  userName: string;
  avatarUrl?: string;
  userData: VerifiedMemberData;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isStillValidOpen, setIsStillValidOpen] = useState(false);
  const router = useRouter();

  const frontCaptureRef = useRef<HTMLDivElement>(null);
  const backCaptureRef = useRef<HTMLDivElement>(null);

  const qrPayload = JSON.stringify({
    idNumber: userData.idNumber,
    name: `${userData.lastName}, ${userData.firstName} ${userData.middleInitial}`,
    status: userData.status,
  });

  const isExpired = userData.validUntilRaw
    ? new Date(userData.validUntilRaw).getTime() < Date.now()
    : true;

  // Captures hidden high-resolution card faces for PDF exports using html2canvas
  const captureBothFaces = async () => {
    if (!frontCaptureRef.current || !backCaptureRef.current) return null;
    const canvasOptions = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
    };
    const [frontCanvas, backCanvas] = await Promise.all([
      html2canvas(frontCaptureRef.current, canvasOptions),
      html2canvas(backCaptureRef.current, canvasOptions),
    ]);
    return { frontCanvas, backCanvas };
  };

  // Generates a 2-page landscape PDF file sized to standard physical ID specs (CR80)
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const captured = await captureBothFaces();
      if (!captured) return;
      const { frontCanvas, backCanvas } = captured;
      const cardWidthMm = 85.6;
      const cardHeightMm = 53.98;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [cardWidthMm, cardHeightMm],
      });
      pdf.addImage(
        frontCanvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        cardWidthMm,
        cardHeightMm,
      );
      pdf.addPage([cardWidthMm, cardHeightMm], "landscape");
      pdf.addImage(
        backCanvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        cardWidthMm,
        cardHeightMm,
      );
      pdf.save(`${userData.idNumber}-membership-card.pdf`);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Something went wrong generating the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <PageLayout userName={userName} avatarUrl={undefined}>
      <div className="mx-auto w-full max-w-md flex-1 p-5 space-y-6">
        <div className="space-y-2">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full aspect-[1.58/1] [perspective:1000px] cursor-pointer group select-none"
          >
            <div
              className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* FRONT FACE (Default 0deg, hides when flipped away) */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(0deg)]">
                <CardFront
                  userData={userData}
                  avatarUrl={avatarUrl}
                  variant="live"
                />
              </div>

              {/* BACK FACE (Rotated 180deg by default, becomes visible when card container flips) */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <CardBack userData={userData} variant="live" />
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 italic">
            {isFlipped ? "Tap to view front layout" : "Tap to flip"}
          </p>
        </div>
        <div className="rounded-xl border border-green-800/20 bg-green-50 p-4 text-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-green-900">
            Membership Status
          </h4>
          <p className="my-1 text-5xl font-black tracking-wider text-green-950">
            {userData.status}
          </p>
          <p className="text-xs text-gray-400">
            Valid Until: {userData.validUntil}
          </p>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setIsQrOpen(true)}
            className="w-full rounded-xl border border-gray-300 bg-white py-3.5 text-center text-sm font-bold text-green-900 shadow-sm transition-colors hover:bg-gray-50"
          >
            Show QR Code
          </button>

          <button
            type="button"
            onClick={() => setIsCertOpen(true)}
            className="w-full rounded-xl border border-gray-300 bg-white py-3.5 text-center text-sm font-bold text-green-900 shadow-sm transition-colors hover:bg-gray-50"
          >
            View & Download Membership Certificate
          </button>

          <button
            type="button"
            onClick={() => setIsCertOpen(true)}
            className="w-full rounded-xl border border-gray-300 bg-white py-3.5 text-center text-sm font-bold text-green-900 shadow-sm transition-colors hover:bg-gray-50"
          >
            Validate Membership
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isExpired) {
                setIsStillValidOpen(true);
                return;
              }
              localStorage.setItem("paymentIsRenewal", "true");
              localStorage.setItem("paymentRenewalReason", "id_expired");
              localStorage.setItem("paymentRenewalIdNumber", userData.idNumber);
              router.push("/scout/membership/membership-registration/register");
            }}
            className="w-full rounded-xl border border-gray-300 bg-white py-3.5 text-center text-sm font-bold text-green-900 shadow-sm transition-colors hover:bg-gray-50"
          >
            Renew Membership
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="w-full rounded-xl border border-gray-300 bg-white py-3.5 text-center text-sm font-bold text-green-900 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isDownloading ? "Preparing PDF..." : "Download PDF"}
          </button>
        </div>
      </div>
      <div className="fixed top-0 left-[-9999px] pointer-events-none z-[-1]">
        <div
          ref={frontCaptureRef}
          style={{ width: `${CAPTURE_WIDTH}px`, height: `${CAPTURE_HEIGHT}px` }}
        >
          <CardFront
            userData={userData}
            avatarUrl={avatarUrl}
            variant="capture"
          />
        </div>
        <div
          ref={backCaptureRef}
          style={{ width: `${CAPTURE_WIDTH}px`, height: `${CAPTURE_HEIGHT}px` }}
        >
          <CardBack userData={userData} variant="capture" />
        </div>
      </div>
      {isQrOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
          onClick={() => setIsQrOpen(false)}
        >
          <div
            className="relative w-full max-w-xs overflow-hidden rounded-3xl bg-[#d1d5db] shadow-2xl border border-white/20 flex flex-col items-center pt-9 pb-8 px-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsQrOpen(false)}
              className="absolute top-3 right-3 rounded-full bg-black/10 p-1.5 text-gray-600 hover:bg-black/20 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="w-full flex items-center justify-center">
              <QRCodeCanvas
                value={qrPayload}
                size={240}
                level="M"
                marginSize={2}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
            <p className="mt-4 text-[10px] uppercase font-bold tracking-widest text-gray-500">
              ID Verification
            </p>
          </div>
        </div>
      )}

      {isCertOpen && (
        <MembershipCertificateModal
          isOpen={isCertOpen}
          onClose={() => setIsCertOpen(false)}
          member={userData}
        />
      )}

      {/* Modal: ID Still Valid */}
      {isStillValidOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
          onClick={() => setIsStillValidOpen(false)}
        >
          <div
            className="relative w-full max-w-xs overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-200 flex flex-col items-center pt-9 pb-8 px-7 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsStillValidOpen(false)}
              className="absolute top-3 right-3 rounded-full bg-black/10 p-1.5 text-gray-600 hover:bg-black/20 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-7 h-7 text-green-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>

            <h4 className="text-sm font-bold uppercase tracking-wider text-green-900 mb-1">
              Your ID Is Still Valid
            </h4>
            <p className="text-sm text-gray-500">
              Your membership is valid until{" "}
              <span className="font-semibold text-gray-700">
                {userData.validUntil}
              </span>
              . Renewal opens up once it expires.
            </p>

            <button
              type="button"
              onClick={() => setIsStillValidOpen(false)}
              className="mt-6 w-full rounded-xl bg-green-800 hover:bg-green-900 transition-colors text-white py-2.5 text-sm font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}