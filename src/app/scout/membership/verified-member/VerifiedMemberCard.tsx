"use client";
// src/app/scout/membership/verified-member/VerifiedMemberCard.tsx
// Client half of the verified-member page: flip-card interaction, QR
// modal, and download button. Receives real data as props from the
// server component in page.tsx — no local mock data.

import PageLayout from "../../../components/PageLayout";
import { useState } from "react";
import Image from "next/image";

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

  const handleDownloadImage = () => {
    alert("Triggering html2canvas image generator export...");
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

              {/* FRONT FACE OF CARD */}

              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-2xl bg-[#F1F7EC] p-4 shadow-md border border-gray-200 overflow-hidden flex flex-col justify-between pl-9">

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
                  <div className="text-[9px] uppercase leading-tight font-bold text-blue-900 tracking-wide">
                    <p>Boy Scouts of the Philippines</p>
                    <p className="font-normal text-gray-600">National Office</p>
                    <p className="font-light normal-case text-[7px] text-gray-400">181 Natividad Almeda-Lopez St., Ermita, Manila</p>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest leading-none">
                    Membership Card
                  </h3>
                  <span className="text-[7px] font-bold text-blue-900 uppercase">
                    Valid Until: {userData.validUntil}
                  </span>
                </div>

                <div className="grid grid-cols-3 items-end gap-2">
                  <div className="col-span-2 space-y-2 text-[10px] pb-1">
                    <div className="flex flex-col">
                      <span className="font-bold text-blue-900 border-b border-blue-900/40 pb-0.5 leading-none">
                        {userData.lastName}, {userData.firstName} {userData.middleInitial}
                      </span>
                      <span className="text-[5px] text-gray-400 uppercase font-bold tracking-tight pt-0.5">Name</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-bold text-blue-900 border-b border-blue-900/40 pb-0.5 leading-none">
                        {userData.designation}
                      </span>
                      <span className="text-[5px] text-gray-400 uppercase font-bold tracking-tight pt-0.5">Designation</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-bold text-blue-900 border-b border-blue-900/40 pb-0.5 leading-none">
                        {userData.council}
                      </span>
                      <span className="text-[5px] text-gray-400 uppercase font-bold tracking-tight pt-0.5">Council</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-end">
                    <div className="relative h-20 w-20 overflow-hidden border border-gray-400 bg-gray-200 shadow-sm mb-2.5">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={`${userData.firstName} ${userData.lastName}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-300 text-[8px] text-gray-500 text-center p-1">
                          No Photo
                        </div>
                      )}
                    </div>
                    <div className="w-20 border-t border-blue-900 pt-1 text-center">
                      <span className="block text-[5px] font-bold text-blue-900/70 uppercase tracking-tight leading-none">
                        Signature of Member
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end text-[7px] text-blue-900 pb-0.5">
                  <div className="flex flex-col items-center">
                    <div className="w-20 border-t border-blue-900 pt-0.5 text-center">
                      <span className="block text-[5px] uppercase font-medium text-blue-900/80 tracking-tight">
                        Council Chairperson
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-serif text-sm font-bold text-red-600 tracking-tight leading-none">
                    № <span className="tracking-normal">{userData.idNumber}</span>
                  </div>
                </div>

              </div>

              {/* BACK FACE OF CARD */}

              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-[#f4f7f4] p-4 shadow-md border border-gray-200 overflow-hidden flex flex-col justify-between pr-8">

                <div className="absolute top-0 right-0 bottom-0 w-6 flex flex-row">
                  <div className="h-full w-1/2 bg-blue-800" />
                  <div className="h-full w-1/2 bg-red-600" />
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[8px] text-blue-950 pt-1">

                  <div className="space-y-1">
                    <div className="flex flex-col">
                      <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                        {userData.lastName}, {userData.firstName} {userData.middleInitial}
                      </span>
                      <span className="text-[5px] text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5">Name of Scout</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                        {userData.sponsoringInst}
                      </span>
                      <span className="text-[5px] text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5">Sponsoring Institution</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                        {userData.address}
                      </span>
                      <span className="text-[5px] text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5">Address</span>
                    </div>

                    <div className="pt-0.5">
                      <span className="block text-[4.5px] font-bold text-blue-900/80 uppercase tracking-tighter italic">In case of emergency, please contact:</span>
                      <div className="flex flex-col mt-0.5">
                        <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                          {userData.emergencyContact}
                        </span>
                        <span className="text-[5px] text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5">Name</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-col">
                      <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                        {userData.dob}
                      </span>
                      <span className="text-[5px] text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5">Date of Birth</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                          {userData.sex}
                        </span>
                        <span className="text-[5px] text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5">Sex</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                          {userData.bloodType}
                        </span>
                        <span className="text-[5px] text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5">Blood Type</span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                        {userData.telephone}
                      </span>
                      <span className="text-[5px] text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5">Telephone Number</span>
                    </div>

                    <div className="flex flex-col pt-1.5">
                      <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                        {userData.emergencyRelationship}
                      </span>
                      <span className="text-[5px] text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5">Relationship</span>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-x-4 items-end text-[8px] text-blue-950 pb-0.5">
                  <div className="flex flex-col">
                    <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                      {userData.email}
                    </span>
                    <span className="text-[5px] text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5">E-mail</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-blue-900 border-b border-blue-900/40 pb-0.5 block truncate leading-none">
                      {userData.emergencyContactNum}
                    </span>
                    <span className="text-[5px] text-blue-900/60 uppercase font-bold tracking-tighter pt-0.5">Contact Number</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-1 text-center">
                  <p className="text-[4.5px] text-blue-900/60 font-medium italic tracking-tighter w-7/12 text-left leading-tight pb-0.5">
                    Member is entitled to all the benefits provided under the BSP Financial Assistance Program
                  </p>
                  <div className="w-24 border-t border-blue-900 pt-1 flex flex-col items-center">
                    <span className="block text-[4.5px] font-bold text-blue-900 uppercase tracking-tighter leading-none">
                      Name & Signature of Institutional Head
                    </span>
                  </div>
                </div>

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
            onClick={handleDownloadImage}
            className="w-full rounded-xl border border-gray-300 bg-white py-3.5 text-center text-sm font-bold text-green-900 shadow-sm transition-colors hover:bg-gray-50"
          >
            Download Image
          </button>
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

            <div className="w-full aspect-square bg-white rounded-xl p-5 flex items-center justify-center shadow-inner">
              <div className="relative w-full h-full">
                <Image
                  src="/bsp-qr-code.png"
                  alt="Scout Member ID QR Verification"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
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