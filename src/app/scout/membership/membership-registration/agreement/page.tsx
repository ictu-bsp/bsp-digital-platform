//src/app/scout/membership/membership-registration/agreement/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BackButton from "@/components-general/ui/BackButton";

export default function AgreementPage() {
  const router = useRouter();
  const [termsConsent, setTermsConsent] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);

  // Marks the T&C as "read" once the user scrolls the box to (near) the
  // bottom. The 8px threshold accounts for rounding differences across browsers.
  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const reachedBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    if (reachedBottom) setHasReadTerms(true);
  };

  // Reaching this page means the user is starting a fresh application —
  // clear out anything left over from a previous attempt (whether they
  // finished, abandoned mid-payment, or got rejected) so stale personal
  // info / registration details never leak into a new submission.
  useEffect(() => {
    const wizardKeys = [
      "personalBloodType",
      "personalAddress",
      "personalTelephone",
      "personalEmergencyContactName",
      "personalEmergencyContactRelationship",
      "personalEmergencyContactNumber",
      "registerScoutingPosition",
      "registerAdvancementRank",
      "registerTenure",
      "registerRegion",
      "registerCouncilId",
      "registerIsCommunityBased",
      "registerSponsoringInstitution",
      "registerMembershipValidity",
      "registrationId",
      "paymentAmount",
      "paymentDescription",
      "paymentYears",
      "paymentCouncil",
      "paymentCouncilId",
      "paymentIsCommunityBased",
      "paymentSponsoringInstitution",
    ];
    wizardKeys.forEach((key) => localStorage.removeItem(key));
  }, []);

  const onNext = () => {
    if (!hasReadTerms || !termsConsent || !parentalConsent) return;
    router.push("/scout/membership/membership-registration/personal-info");
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 sm:py-10 sm:px-6 bg-zinc-50 min-h-screen">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-14 text-zinc-900">
        <div className="mb-4">
          <BackButton onClick={() => router.push("/scout/membership")} />
        </div>


        <h1 className="text-2xl sm:text-4xl font-bold text-green-800 mb-2">
          <Image
            src="/escout-logo.svg"
            alt="eScout Logo"
            width={115}
            height={115}
            className="h-auto w-[115px] object-contain"
            /></h1>
        <h2 className="text-lg sm:text-2xl font-semibold mb-6">Register Membership</h2>

        <div className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base text-green-800 mb-8">
          <span className="flex items-center gap-2 bg-green-800 text-white rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-green-800 flex items-center justify-center text-xs sm:text-sm font-semibold">
              1
            </span>
            Safe from Harm
          </span>
          <span>|</span>
          <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-green-800 flex items-center justify-center">
            2
          </span>
          <span>|</span>
          <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-green-800 flex items-center justify-center">
            3
          </span>
          <span>|</span>
          <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-green-800 flex items-center justify-center">
            4
          </span>
        </div>

        <div className="flex gap-3 sm:gap-5 items-start mb-4">
          <Image
            src="/safe-from-harm.svg"
            alt="Safe from Harm"
            width={100}
            height={100}
            className="w-16 h-16 sm:w-24 sm:h-24 object-contain shrink-0"
          />
          <p className="text-sm sm:text-lg text-zinc-800 leading-relaxed">
            The <strong>Boy Scouts of the Philippines (BSP)</strong> prioritizes the
            safety and security of all members through its National Safeguarding
            Policy. Rooted in the Scout Oath and Law, this
          </p>
        </div>

        <p className="text-sm sm:text-lg text-zinc-800 leading-relaxed mb-4">
          policy protects children and young people from harm while fostering a
          culture of respect, fairness, and dignity for everyone.
        </p>

        <p className="text-sm sm:text-lg text-zinc-800 leading-relaxed mb-4">
          The full text of the National Safeguarding Policy is found{" "}
          <a
            href="https://scouts.gov.ph/wp-content/uploads/2025/03/National-Safeguarding-Policy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            here
          </a>
          .
        </p>

        <p className="text-sm sm:text-lg text-zinc-800 leading-relaxed mb-6">
          By pursuing this application, I agree to be bound by the National
          Safeguarding Policy and commit to promote a safe and secure Scouting for
          everybody.
        </p>

        <hr className="my-4" />

        {/* Terms & Conditions — Data Privacy and Consent
            Working draft — pending review/approval by BSP's DPO / National
            Office before this goes live, particularly the retention period
            placeholder in Section 7 below. */}
        <h3 className="text-sm sm:text-lg font-semibold text-green-800 mt-2 mb-3">
          Terms and Conditions — Data Privacy and Consent
        </h3>

        <div
          onScroll={handleTermsScroll}
          className="border rounded-md bg-zinc-50 p-4 sm:p-5 max-h-64 overflow-y-auto text-xs sm:text-sm text-zinc-700 leading-relaxed space-y-3 mb-1"
        >
          <p>
            <strong>1. Introduction and Acceptance.</strong>{" "}
            {`These Terms govern the collection, use, storage, and disclosure of personal data by the Boy Scouts of the Philippines ("BSP," "we," "us," or "our") through the eScout BSP membership registration platform (the "Platform"). By checking the consent box and proceeding with registration, you acknowledge that you have read, understood, and agreed to be bound by these Terms, in accordance with Republic Act No. 10173, the Data Privacy Act of 2012, and its Implementing Rules and Regulations. If you do not agree, you must not proceed with registration.`}
          </p>

          <p>
            <strong>2. Scope of Consent.</strong>{" "}
            {`Your consent covers the collection and processing of the categories of personal data described below, for the purposes described below. Consent is required to complete registration; certain fields are mandatory to process your membership application and payment, and declining to provide them will prevent you from completing registration.`}
          </p>

          <p>
            <strong>3. Information We Collect.</strong>{" "}
            {`Identity information (full name, sex, civil status, date of birth); contact information (email address, mobile number); scouting information (scouting position, advancement rank, tenure in Scouting, region, council, sponsoring institution); membership records (registration status, years of registration, approval history); and payment information (selected payment method and resulting transaction reference). BSP does not collect or store full card numbers, CVC codes, or other sensitive payment credentials — these are submitted directly to PayMongo.`}
          </p>

          <p>
            <strong>4. Purpose of Collection and Use.</strong>{" "}
            {`We process your personal data to process and verify your Scout membership registration; confirm eligibility and route your application through the applicable council, regional, and national approval steps; process your membership fee payment; maintain official membership records as required for BSP's operations, reporting, and audit obligations; and communicate with you regarding the status of your registration or payment.`}
          </p>

          <p>
            <strong>5. Disclosure and Sharing.</strong>{" "}
            {`We disclose personal data only as reasonably necessary, and only to PayMongo (as third-party processor, to process your chosen payment method under its own applicable security and privacy standards) and to authorized BSP personnel at the council, regional, and national levels involved in reviewing and approving membership registrations. BSP does not sell personal data and does not disclose it to third parties for marketing purposes.`}
          </p>

          <p>
            <strong>6. Data Retention.</strong>{" "}
            {`Your membership and registration records are retained for as long as necessary to fulfill the purposes above and to comply with BSP's records retention policy and applicable legal, audit, or reporting requirements.`}
          </p>

          <p>
            <strong>7. Your Rights.</strong>{" "}
            {`Under the Data Privacy Act, you have the right to be informed that your personal data is being processed; access your personal data; object to or withdraw consent for processing; request correction of inaccurate or outdated data; request erasure or blocking of your data, subject to legal and record-keeping requirements; be indemnified for damages arising from unauthorized processing; and file a complaint with the National Privacy Commission.`}
          </p>

          <p>
            <strong>8. Security Measures.</strong>{" "}
            {`BSP applies reasonable organizational, physical, and technical safeguards to protect personal data, including restricted database access and secure transmission of information. Payment processing is handled by PayMongo, a PCI DSS-compliant payment services provider.`}
          </p>

          <p>
            <strong>9. Amendments.</strong>{" "}
            {`BSP may update these Terms from time to time to reflect changes in law, BSP policy, or Platform functionality. Material changes will be indicated by an updated Effective Date.`}
          </p>

          <p>
            <strong>10. Contact.</strong>{" "}
            {`For questions, concerns, or to exercise your rights under the Data Privacy Act, contact the BSP National Office at `}
            <a
              href="mailto:bsp@scouts.gov.ph"
              className="text-blue-600 underline"
            >
              bsp@scouts.gov.ph
            </a>
            {` or (632) 8572-8317 to 19.`}
          </p>
        </div>

        {!hasReadTerms && (
          <p className="text-xs text-amber-700 mb-3">
            Please scroll to the bottom of the Terms and Conditions above to
            continue.
          </p>
        )}

        <label
          className={`flex items-start gap-3 text-sm sm:text-base mb-3 ${
            hasReadTerms ? "text-zinc-900" : "text-zinc-400"
          }`}
        >
          <input
            type="checkbox"
            checked={termsConsent}
            onChange={(e) => setTermsConsent(e.target.checked)}
            disabled={!hasReadTerms}
            className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5"
            required
          />
          <span>
            I have read and agree to the Terms and Conditions. I voluntarily
            consent to the collection, use, processing, and disclosure of my
            personal data by the Boy Scouts of the Philippines for the
            purposes of membership registration and payment processing as
            described above.
          </span>
        </label>

        <label
          className={`flex items-start gap-3 text-sm sm:text-base mb-10 ${
            hasReadTerms ? "text-zinc-900" : "text-zinc-400"
          }`}
        >
          <input
            type="checkbox"
            checked={parentalConsent}
            onChange={(e) => setParentalConsent(e.target.checked)}
            disabled={!hasReadTerms}
            className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5"
            required
          />
          <span>
            I am the parent or legal guardian of the applicant, and I consent
            for the applicant to register as a member of the Boy Scouts of the
            Philippines and to participate in its activities.
          </span>
        </label>

       <button
          onClick={onNext}
          disabled={!hasReadTerms || !termsConsent || !parentalConsent}
          className="rounded-lg bg-green-800 hover:bg-green-900 transition-colors text-white text-lg font-medium py-3.5 px-4 w-full disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}