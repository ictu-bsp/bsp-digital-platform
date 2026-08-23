// src/components/MembershipCertificateModal.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

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

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: VerifiedMemberData;
}

export default function MembershipCertificateModal({
  isOpen,
  onClose,
  member,
}: CertificateModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const fullName = [member.firstName, member.middleInitial, member.lastName]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;

    try {
      setIsGenerating(true);

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // High resolution capture
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      // Landscape A4 (297mm x 210mm)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BSP_Certificate_${member.idNumber || "Member"}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">
            Membership Certificate Preview
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body / Certificate Preview */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="mx-auto flex justify-center">
            <div
              ref={certificateRef}
              className="relative aspect-[1.414/1] w-full max-w-[780px] rounded-lg border-8 border-green-900 bg-white p-8 text-center text-gray-900 shadow-md"
            >
              {/* Decorative Inset Border */}
              <div className="absolute inset-1.5 border-2 border-dashed border-amber-600 pointer-events-none" />

              {/* Header Logos & Title */}
              <div className="flex items-center justify-center gap-3 mb-2">
                <Image
                  src="/escout-logo.svg"
                  alt="BSP Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                />
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Republic of the Philippines
                  </h4>
                  <h2 className="text-lg font-extrabold uppercase tracking-wide text-green-900">
                    Boy Scouts of the Philippines
                  </h2>
                </div>
              </div>

              <h1 className="mt-1 text-2xl font-serif font-black uppercase text-amber-800">
                Certificate of Membership
              </h1>

              <p className="mt-4 text-xs italic text-gray-600">
                This is to certify that
              </p>

              <div className="my-2 border-b-2 border-green-900 pb-1 mx-12">
                <p className="text-2xl font-serif font-bold text-gray-900">
                  {fullName || "SCOUT MEMBER"}
                </p>
              </div>

              <p className="text-xs text-gray-700">
                is a registered and bona fide member of the
              </p>

              <p className="text-sm font-bold text-green-900 uppercase mt-0.5">
                {member.council || "National Council"}
              </p>

              {/* Certificate Metadata Grid */}
              <div className="mt-4 grid grid-cols-4 gap-2 text-left text-xs bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <span className="block text-gray-500 text-[10px] uppercase">Membership ID</span>
                  <span className="font-mono font-bold text-green-900">{member.idNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-[10px] uppercase">Designation</span>
                  <span className="font-bold text-gray-800">{member.designation || "Scout"}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-[10px] uppercase">Institution</span>
                  <span className="font-bold text-gray-800 truncate">{member.sponsoringInst || "Community-Based"}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-[10px] uppercase">Valid Until</span>
                  <span className="font-bold text-gray-800">{member.validUntil || "N/A"}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="mt-8 flex justify-between px-10 text-xs text-gray-600">
                <div className="text-center">
                  <div className="h-8 border-b border-gray-400 w-40 mb-1" />
                  <span className="font-semibold text-gray-800">Local Council Scout Executive</span>
                </div>
                <div className="text-center">
                  <div className="h-8 border-b border-gray-400 w-40 mb-1" />
                  <span className="font-semibold text-gray-800">Secretary General</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-900 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            {isGenerating ? "Preparing PDF..." : "Download as PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}