"use client";
// src/app/scout/membership/verified-member/VerifiedMemberCard.tsx
// Client half of the verified-member page: flip-card interaction, a real
// QR code (encodes minimal ID-verification fields as JSON — placeholder
// until a /verify/[idNumber] backend endpoint exists), and a single
// Download button that exports both sides of the card as one PDF.
//
// CardFront/CardBack take an optional `variant` prop: "live" renders at
// the same small fixed sizes used on the actual app screen; "capture"
// renders larger text (and a larger photo) so the exported PDF fills
// its frame instead of looking thin/small. Only the hidden capture copies
// use "capture" — the visible flip card on-screen is untouched.

import PageLayout from "../../../components/PageLayout";
import { useRef, useState } from "react";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

type VerifiedMemberData = {
  firstName: string;
  middleInitial: string;
  lastName: string;
  designation: string;
  council: string;
  idNumber: string;
  validUntil: string;
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

// ---- Front face content. Used by the visible flip card AND by the ----
// ---- hidden flat copy rendered off-screen for image/PDF capture. ----
function CardFront({
  userData,
  avatarUrl,
  variant = "live",
}: {
  userData: VerifiedMemberData;
  avatarUrl?: string;
  variant?: CardVariant;
}) {
  // `avatar` is the photo box size in px. Capture variant gets a
  // noticeably bigger photo (and matching signature-line width) so it
  // doesn't look small next to the enlarged capture text.
  const fs =
    variant === "capture"
      ? { org: 12, addr: 9, valid: 9, data: 13, label: 7, nophoto: 11, title: 15, id: 17, avatar: 108 }
      : { org: 9, addr: 7, valid: 7, data: 10, label: 5, nophoto: 8, title: 12, id: 14, avatar: 80 };

  return (
    <div className="relative w-full h-full rounded-2xl bg-[#F1F7EC] p-4 shadow-md border border-gray-200 overflow-hidden flex flex-col justify-between pl-9">
      <div className="absolute top-0 left-0 bottom-0 w-6 flex flex-row">
        <div className="h-full w-1/2 bg-red-600" />
        <div className="h-full w-1/2 bg-blue-800" />
      </div>

      <div className="flex items-center gap-2">
        <Image
          src="/bsp-logo-with-bkg.svg"
          alt="BSP Logo"
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 object-contain"
        />
        <div style={{ fontSize: fs.org }} className="uppercase leading-tight font-bold text-blue-900 tracking-wide">
          <p>Boy Scouts of the Philippines</p>
          <p className="font-normal text-gray-600">National Office</p>
          <p style={{ fontSize: fs.addr }} className="font-light normal-case text-gray-400">181 Natividad Almeda-Lopez St., Ermita, Manila</p>
        </div>
      </div>

      <div className="text-center">
        <h3 style={{ fontSize: fs.title }} className="font-bold text-red-500 uppercase tracking-widest leading-none">
          Membership Card
        </h3>
        <span style={{ fontSize: fs.valid }} className="font-bold text-blue-900 uppercase">
          Valid Until: {userData.validUntil}
        </span>
      </div>

      <div className="grid grid-cols-3 items-end gap-2">
        <div style={{ fontSize: fs.data }} className="col-span-2 space-y-2 pb-1">
          <div className="flex flex-col">
            <span className="font-bold text-blue-900 border-b border-blue-900/40 pb-0.5 leading-none">
              {userData.lastName}, {userData.firstName} {userData.middleInitial}
            </span>
            <span style={{ fontSize: fs.label }} className="text-gray-400 uppercase font-bold tracking-tight pt-0.5 block">Name</span>
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-blue-900 border-b border-blue-900/40 pb-0.5 leading-none">
              {userData.designation}
            </span>
            <span style={{ fontSize: fs.label }} className="text-gray-400 uppercase font-bold tracking-tight pt-0.5 block">Designation</span>
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-blue-900 border-b border-blue-900/40 pb-0.5 leading-none">
              {userData.council}
            </span>
            <span style={{ fontSize: fs.label }} className="text-gray-400 uppercase font-bold tracking-tight pt-0.5 block">Council</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-end">
          <div
            style={{ height: fs.avatar, width: fs.avatar }}
            className="relative overflow-hidden border border-gray-400 bg-gray-200 shadow-sm mb-2.5"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${userData.firstName} ${userData.lastName}`}
                fill
                className="object-cover"
                sizes={`${fs.avatar}px`}
              />
            ) : (
              <div style={{ fontSize: fs.nophoto }} className="flex h-full w-full items-center justify-center bg-gray-300 text-gray-500 text-center p-1">
                No Photo
              </div>
            )}
          </div>
          <div style={{ width: fs.avatar }} className="border-t border-blue-900 pt-1 text-center">
            <span style={{ fontSize: fs.label }} className="block font-bold text-blue-900/70 uppercase tracking-tight leading-none">
              Signature of Member
            </span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: fs.valid }} className="flex justify-between items-end text-blue-900 pb-0.5">
        <div className="flex flex-col items-center">
          <div style={{ width: fs.avatar }} className="border-t border-blue-900 pt-0.5 text-center">
            <span style={{ fontSize: fs.label }} className="block uppercase font-medium text-blue-900/80 tracking-tight">
              Council Chairperson
            </span>
          </div>
        </div>
        <div style={{ fontSize: fs.id }} className="text-right font-serif font-bold text-red-600 tracking-tight leading-none">
          № <span className="tracking-normal">{userData.idNumber}</span>
        </div>
      </div>
    </div>
  );
}

// ---- Back face content, same reuse pattern as CardFront. ----
function CardBack({
  userData,
  variant = "live",
}: {
  userData: VerifiedMemberData;
  variant?: CardVariant;
}) {
  const fs =
    variant === "capture"
      ? { data: 11, label: 7, micro: 6.5 }
      : { data: 8, label: 5, micro: 4.5 };

  return (
    <div className="relative w-full h-full rounded-2xl bg-[#f4f7f4] p-4 shadow-md border border-gray-200 overflow-hidden flex flex-col justify-between pr-8">
      <div className="absolute top-0 right-0 bottom-0 w-6 flex flex-row">
        <div className="h-full w-1/2 bg-blue-800" />
        <div className="h-full w-1/2 bg-red-600" />
      </div>

      <div style={{ fontSize: fs.data }} className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-blue-950 pt-1">
        <div className="space-y-1">
          <div className="flex flex-col">
            <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
              {userData.lastName}, {userData.firstName} {userData.middleInitial}
            </span>
            <span style={{ fontSize: fs.label }} className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block">Name of Scout</span>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
              {userData.sponsoringInst}
            </span>
            <span style={{ fontSize: fs.label }} className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block">Sponsoring Institution</span>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
              {userData.address}
            </span>
            <span style={{ fontSize: fs.label }} className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block">Address</span>
          </div>

          <div className="pt-0.5">
            <span style={{ fontSize: fs.micro }} className="block font-bold text-blue-900/80 uppercase tracking-tighter italic">In case of emergency, please contact:</span>
            <div className="flex flex-col mt-0.5">
              <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                {userData.emergencyContact}
              </span>
              <span style={{ fontSize: fs.label }} className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block">Name</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex flex-col">
            <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
              {userData.dob}
            </span>
            <span style={{ fontSize: fs.label }} className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block">Date of Birth</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                {userData.sex}
              </span>
              <span style={{ fontSize: fs.label }} className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block">Sex</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                {userData.bloodType}
              </span>
              <span style={{ fontSize: fs.label }} className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block">Blood Type</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
              {userData.telephone}
            </span>
            <span style={{ fontSize: fs.label }} className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block">Telephone Number</span>
          </div>

          <div className="flex flex-col pt-1.5">
            <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
              {userData.emergencyRelationship}
            </span>
            <span style={{ fontSize: fs.label }} className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block">Relationship</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: fs.data }} className="grid grid-cols-2 gap-x-4 items-end text-blue-950 pb-0.5">
        <div className="flex flex-col">
          <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
            {userData.email}
          </span>
          <span style={{ fontSize: fs.label }} className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block">E-mail</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
            {userData.emergencyContactNum}
          </span>
          <span style={{ fontSize: fs.label }} className="text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5 block">Contact Number</span>
        </div>
      </div>

      <div className="flex justify-between items-end mt-1 text-center">
        <p style={{ fontSize: fs.micro }} className="text-blue-900/60 font-medium italic tracking-tighter w-7/12 text-left leading-tight pb-0.5">
          Member is entitled to all the benefits provided under the BSP Financial Assistance Program
        </p>
        <div className="w-24 border-t border-blue-900 pt-1 flex flex-col items-center">
          <span style={{ fontSize: fs.micro }} className="block font-bold text-blue-900 uppercase tracking-tighter leading-none">
            Name & Signature of Institutional Head
          </span>
        </div>
      </div>
    </div>
  );
}

// Capture frame size for exported PNG/PDF. Kept at the same 1.58:1
// aspect ratio as the live card, but smaller than before (was 560x354)
// so the enlarged capture text/photo actually fill the frame instead of
// floating in extra empty space.
const CAPTURE_WIDTH = 480;
const CAPTURE_HEIGHT = 304;

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
  const [isDownloading, setIsDownloading] = useState(false);

  // Off-screen capture targets — always rendered flat (no flip transform)
  // and in "capture" variant (bigger text + photo), so html2canvas-pro
  // can snapshot each face regardless of the visible card's flip state.
  const frontCaptureRef = useRef<HTMLDivElement>(null);
  const backCaptureRef = useRef<HTMLDivElement>(null);

  // Minimal payload for scannability — just enough to identify and
  // verify the member for now. Once a real /verify/[idNumber] endpoint
  // exists, this should just encode the ID number (or a verify URL) and
  // let that page look up the rest server-side.
  const qrPayload = JSON.stringify({
    idNumber: userData.idNumber,
    name: `${userData.lastName}, ${userData.firstName} ${userData.middleInitial}`,
    status: userData.status,
  });

  const captureBothFaces = async () => {
    if (!frontCaptureRef.current || !backCaptureRef.current) return null;
    const [frontCanvas, backCanvas] = await Promise.all([
      html2canvas(frontCaptureRef.current, { scale: 3, backgroundColor: null }),
      html2canvas(backCaptureRef.current, { scale: 3, backgroundColor: null }),
    ]);
    return { frontCanvas, backCanvas };
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const captured = await captureBothFaces();
      if (!captured) return;
      const { frontCanvas, backCanvas } = captured;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [frontCanvas.width, frontCanvas.height],
      });

      pdf.addImage(
        frontCanvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        frontCanvas.width,
        frontCanvas.height
      );

      pdf.addPage([backCanvas.width, backCanvas.height], "landscape");
      pdf.addImage(
        backCanvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        backCanvas.width,
        backCanvas.height
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
            <div className={`relative w-full h-full duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>

              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
                <CardFront userData={userData} avatarUrl={avatarUrl} variant="live" />
              </div>

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
            onClick={() => setIsQrOpen(true)}
            className="w-full rounded-xl border border-gray-300 bg-white py-3.5 text-center text-sm font-bold text-green-900 shadow-sm transition-colors hover:bg-gray-50"
          >
            Show QR Code
          </button>

          <button className="w-full rounded-xl border border-gray-300 bg-white py-3.5 text-center text-sm font-bold text-green-900 shadow-sm transition-colors hover:bg-gray-50">
            Renew Membership
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="w-full rounded-xl border border-gray-300 bg-white py-3.5 text-center text-sm font-bold text-green-900 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isDownloading ? "Preparing..." : "Download"}
          </button>
        </div>
      </div>

      {/* Off-screen flat copies used only for html2canvas-pro capture. */}
      {/* Rendered in "capture" variant (bigger text + photo) at a      */}
      {/* smaller frame than before, so the exported image/PDF fills    */}
      {/* its frame instead of looking sparse.                          */}
      <div
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
          top: 0,
          left: 0,
          width: `${CAPTURE_WIDTH}px`,
          height: `${CAPTURE_HEIGHT}px`,
        }}
      >
        <div ref={frontCaptureRef} style={{ width: `${CAPTURE_WIDTH}px`, height: `${CAPTURE_HEIGHT}px` }}>
          <CardFront userData={userData} avatarUrl={avatarUrl} variant="capture" />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
          top: 0,
          left: 0,
          width: `${CAPTURE_WIDTH}px`,
          height: `${CAPTURE_HEIGHT}px`,
        }}
      >
        <div ref={backCaptureRef} style={{ width: `${CAPTURE_WIDTH}px`, height: `${CAPTURE_HEIGHT}px` }}>
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
              onClick={() => setIsQrOpen(false)}
              className="absolute top-3 right-3 rounded-full bg-black/10 p-1.5 text-gray-600 hover:bg-black/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            {/* QR code sits directly on the modal background now — no
                extra white padded box wrapping it. */}
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

    </PageLayout>
  );
}
