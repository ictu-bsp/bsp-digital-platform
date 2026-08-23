// src/app/scout/jamboree/one-mindanao/components/MeritBadgeCertificateModal.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import type { MeritBadgeItem } from "./OneMindanaoClient";

export type memberData = {
  firstName: string;
  middleInitial: string;
  lastName: string;
  council: string;
  idNumber: string;
  suffix: string | null;
};

interface MeritBadgeCertProps {
  isOpen: boolean;
  onClose: () => void;
  badge: MeritBadgeItem;
  member: memberData;
}

export default function MeritBadgeCertificateModal({
  isOpen,
  onClose,
  badge,
  member,
}: MeritBadgeCertProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const fullName = [
    member.firstName,
    member.middleInitial,
    member.lastName,
    member.suffix,
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${badge.name.replace(/\s+/g, "_")}_${member.idNumber || "Scout"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Certificate of Achievement Preview
            </h3>
            <p className="text-xs text-slate-500">
              Official certificate for acquiring physical merit badges at the Scout Shop.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Certificate Container */}
        <div className="flex-1 overflow-auto bg-slate-200/70 p-6">
          <div className="mx-auto flex justify-center">
            {/* The Certificate Template (A4 Landscape aspect ratio: ~1.414) */}
            <div
              ref={certificateRef}
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#064e3b", // emerald-900
                color: "#0f172a",
              }}
              className="relative aspect-[1.414/1] w-full max-w-[780px] rounded-lg border-8 p-8 text-center shadow-xl"
            >
              {/* Inner Dashed Gold Border */}
              <div
                style={{ borderColor: "#d97706" }}
                className="absolute inset-1.5 border-2 border-dashed pointer-events-none"
              />

              {/* Top Banner Header */}
              <div className="flex items-center justify-center gap-3 mb-2">
                <Image
                  src="/escout-logo.svg"
                  alt="BSP Logo"
                  width={45}
                  height={45}
                  className="object-contain"
                />
                <div>
                  <h4
                    style={{ color: "#64748b" }}
                    className="text-[10px] font-bold uppercase tracking-widest"
                  >
                    Boy Scouts of the Philippines
                  </h4>
                  <h2
                    style={{ color: "#064e3b" }}
                    className="text-base font-black uppercase"
                  >
                    7th One Mindanao Scout Jamboree
                  </h2>
                </div>
              </div>

              <h1
                style={{ color: "#92400e" }}
                className="mt-1 font-serif text-2xl font-black uppercase"
              >
                Certificate of Achievement
              </h1>
              <p
                style={{ color: "#065f46" }}
                className="text-[10px] font-semibold uppercase tracking-widest"
              >
                National Merit Badge Challenge
              </p>

              <p style={{ color: "#475569" }} className="mt-3 text-xs italic">
                This certifies that
              </p>
              <div
                style={{ borderColor: "#064e3b" }}
                className="mx-16 my-1 border-b-2 pb-0.5"
              >
                <p
                  style={{ color: "#0f172a" }}
                  className="font-serif text-xl font-bold uppercase"
                >
                  {fullName || "SCOUT MEMBER"}
                </p>
              </div>

              <p style={{ color: "#334155" }} className="text-[11px]">
                of{" "}
                <span
                  style={{ color: "#064e3b" }}
                  className="font-bold uppercase"
                >
                  {member.council || "National Council"}
                </span>{" "}
                (ID: <span className="font-mono">{member.idNumber || "PENDING"}</span>)
              </p>

              <p style={{ color: "#334155" }} className="mt-2 text-xs">
                has successfully qualified for and completed all requirements for the
              </p>

              {/* Badge Details & Physical Attachment Placeholder */}
              <div className="my-3 flex items-center justify-center gap-6">
                <div className="text-left">
                  <span
                    style={{ color: "#94a3b8" }}
                    className="text-[10px] uppercase font-bold"
                  >
                    Merit Badge Earned:
                  </span>
                  <h3
                    style={{ color: "#064e3b" }}
                    className="text-lg font-black uppercase"
                  >
                    {badge.name}
                  </h3>
                  <span style={{ color: "#64748b" }} className="text-xs">
                    Category: {badge.category}
                  </span>
                </div>

                {/* Circular Placeholder for Attaching Physical Badge */}
                <div
                  style={{
                    borderColor: "#d97706",
                    backgroundColor: "#fffbeb",
                  }}
                  className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-dashed p-1 text-center"
                >
                  <span
                    style={{ color: "#92400e" }}
                    className="text-[8px] font-extrabold uppercase leading-tight"
                  >
                    Attach Physical Badge Here
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div
                style={{ color: "#475569" }}
                className="mt-6 flex justify-between px-8 text-xs"
              >
                <div className="text-center">
                  <div
                    style={{ borderColor: "#94a3b8" }}
                    className="h-6 w-36 border-b mb-1"
                  />
                  <span
                    style={{ color: "#0f172a" }}
                    className="font-semibold text-[11px]"
                  >
                    Merit Badge Counselor
                  </span>
                </div>
                <div className="text-center">
                  <div
                    style={{ borderColor: "#94a3b8" }}
                    className="h-6 w-36 border-b mb-1"
                  />
                  <span
                    style={{ color: "#0f172a" }}
                    className="font-semibold text-[11px]"
                  >
                    Jamboree Director
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-900 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Download Certificate PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}