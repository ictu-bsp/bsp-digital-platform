//src/app/scout/membership/membership-registration/register/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircleIcon, ChevronDownIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { submitApplicationAction } from "@/app/actions/application";
import { getCouncilsAction } from "@/app/actions/councils";
import { useWizard } from "../WizardContext";

const FEE_PER_YEAR = 100;

// single export only
// Reads a previously-saved value back out of localStorage so that
// navigating back into this step mid-flow doesn't wipe what the user
// already selected. Guarded for SSR since localStorage doesn't exist
// server-side.
const readSaved = (key: string) => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) ?? "";
};

const readSavedBool = (key: string) => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(key) === "true";
};

// Border/background/text styling that reacts to whether a field is filled.
const fieldShellClass = (filled: boolean, locked?: boolean) =>
  `w-full rounded-lg py-3 text-lg border transition-colors ${
    locked
      ? "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed"
      : filled
      ? "border-green-600 bg-green-50 text-zinc-900"
      : "border-zinc-300 bg-white text-zinc-400"
  }`;

export default function RegisterPage() {
  const router = useRouter();
  const {
    bloodType,
    address,
    telephone,
    emergencyContactName,
    emergencyContactRelationship,
    emergencyContactNumber,
  } = useWizard();

  const [scoutingPosition, setScoutingPosition] = useState(() =>
    readSaved("registerScoutingPosition")
  );
  const [advancementRank, setAdvancementRank] = useState(() =>
    readSaved("registerAdvancementRank")
  );
  const [tenure, setTenure] = useState(() => readSaved("registerTenure"));
  const [region, setRegion] = useState(() => readSaved("registerRegion"));
  const [councilId, setCouncilId] = useState(() => readSaved("registerCouncilId"));
const [councils, setCouncils] = useState<{ id: string; name: string }[]>([]);
const [councilsLoading, setCouncilsLoading] = useState(true);
  const [isCommunityBased, setIsCommunityBased] = useState(() =>
    readSavedBool("registerIsCommunityBased")
  );
  const [sponsoringInstitution, setSponsoringInstitution] = useState(() =>
    readSaved("registerSponsoringInstitution")
  );
  const [membershipValidity, setMembershipValidity] = useState(() =>
    readSaved("registerMembershipValidity")
  );

  const amount = FEE_PER_YEAR * (Number(membershipValidity) || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // When community-based is checked, Sponsoring Institution is locked out —
  // clear whatever was selected so a stale value doesn't get submitted.
  useEffect(() => {
    if (isCommunityBased) {
      setSponsoringInstitution("");
    }
  }, [isCommunityBased]);

  // Persist every field as the user fills them in, so navigating back
  // into this step from method/payment doesn't lose what was entered.
  useEffect(() => {
    localStorage.setItem("registerScoutingPosition", scoutingPosition);
    localStorage.setItem("registerAdvancementRank", advancementRank);
    localStorage.setItem("registerTenure", tenure);
    localStorage.setItem("registerRegion", region);
    localStorage.setItem("registerCouncilId", councilId);
    localStorage.setItem("registerIsCommunityBased", String(isCommunityBased));
    localStorage.setItem("registerSponsoringInstitution", sponsoringInstitution);
    localStorage.setItem("registerMembershipValidity", membershipValidity);
  }, [
    scoutingPosition,
    advancementRank,
    tenure,
    region,
    councilId,
    isCommunityBased,
    sponsoringInstitution,
    membershipValidity,
  ]);

  useEffect(() => {
  const loadCouncils = async () => {
    const result = await getCouncilsAction();
    if (result.success && result.data) {
      setCouncils(result.data);
    }
    setCouncilsLoading(false);
  };
  loadCouncils();
}, []);

  const onNext = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    const years = Number(membershipValidity);
    const resolvedSponsoringInstitution = isCommunityBased
      ? "community_based"
      : sponsoringInstitution;

    const result = await submitApplicationAction({
    councilId,

    scoutingPosition,

    advancementRank,

    tenure: Number(tenure),

    region,

    communityBased: isCommunityBased,

    sponsoringInstitution:
        isCommunityBased
            ? null
            : sponsoringInstitution,

    requestedRegistrationYears:
        Number(membershipValidity),

    bloodType,
    address,
    telephone,
    emergencyContactName,
    emergencyContactRelationship,
    emergencyContactNumber,
  });

    if (!result.success || !result.data) {
      setSubmitError(result.error ?? "Failed to create registration.");
      setIsSubmitting(false);
      return;
    }

    const description = `Scout Membership Registration (${years} year${
      years > 1 ? "s" : ""
    })`;
    localStorage.setItem("registrationId", result.data.id);
    localStorage.setItem("paymentAmount", String(amount));
    localStorage.setItem("paymentDescription", description);
    localStorage.setItem("paymentYears", String(years));
    const selectedCouncilName =
  councils.find((c) => c.id === councilId)?.name ?? "";
localStorage.setItem("paymentCouncil", selectedCouncilName);
localStorage.setItem("paymentCouncilId", councilId);
    localStorage.setItem("paymentIsCommunityBased", String(isCommunityBased));
    localStorage.setItem(
      "paymentSponsoringInstitution",
      resolvedSponsoringInstitution
    );
    router.push("/scout/membership/membership-registration/method");
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
      <form
        onSubmit={onNext}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-14 text-zinc-900 flex flex-col gap-5"
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="text-3xl text-zinc-700 mb-1 self-start"
          aria-label="Go back"
        >
          &lt;
        </button>

        <h1 className="text-4xl font-bold text-green-800 mb-0">
          <Image
            src="/escout-logo.svg"
            alt="eScout Logo"
            width={115}
            height={115}
            className="h-auto w-[115px] object-contain"
          /></h1>
        <h2 className="text-2xl font-semibold mb-4">Register Membership</h2>

        <div className="flex items-center justify-center gap-3 text-base text-green-800 mb-4">
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
            Scout Information
          </span>
          <span>|</span>
          <span className="w-8 h-8 rounded-full border-2 border-green-800 flex items-center justify-center">
            4
          </span>
        </div>

        {/* Scouting Position */}
        <div className="relative">
          <select
            value={scoutingPosition}
            onChange={(e) => setScoutingPosition(e.target.value)}
            className={`${fieldShellClass(scoutingPosition !== "")} appearance-none pl-4 pr-16`}
            required
          >
            <option value="" disabled className="text-zinc-400">
              Scouting Position
            </option>
            <option value="kid_scout" className="text-zinc-900">Kid Scout</option>
            <option value="kab_scout" className="text-zinc-900">Kab Scout</option>
            <option value="boy_scout" className="text-zinc-900">Boy Scout</option>
            <option value="senior_scout" className="text-zinc-900">Senior Scout</option>
            <option value="rover" className="text-zinc-900">Rover</option>
          </select>
          {scoutingPosition !== "" && (
            <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
          <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Advancement Rank */}
        <div className="relative">
          <select
            value={advancementRank}
            onChange={(e) => setAdvancementRank(e.target.value)}
            className={`${fieldShellClass(advancementRank !== "")} appearance-none pl-4 pr-16`}
            required
          >
            <option value="" disabled className="text-zinc-400">
              Advancement Rank
            </option>
            <option value="explorer" className="text-zinc-900">Explorer</option>
            <option value="pathfinder" className="text-zinc-900">Pathfinder</option>
            <option value="outdoor_scout" className="text-zinc-900">Outdoor Scout</option>
            <option value="venturer" className="text-zinc-900">Venturer</option>
          </select>
          {advancementRank !== "" && (
            <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
          <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Tenure in Scouting */}
        <div className="relative">
          <input
            placeholder="Tenure in Scouting (years)"
            className={`${fieldShellClass(tenure !== "")} pl-4 pr-10`}
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            required
          />
          {tenure !== "" && (
            <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Region */}
          <div className="relative">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={`${fieldShellClass(region !== "")} appearance-none pl-4 pr-16`}
              required
            >
              <option value="" disabled className="text-zinc-400">
                Region
              </option>
              <option value="ncr" className="text-zinc-900">NCR</option>
              <option value="region_1" className="text-zinc-900">Region I</option>
              <option value="region_2" className="text-zinc-900">Region II</option>
            </select>
            {region !== "" && (
              <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
            <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Council — real dropdown sourced from the councils table */}
<div className="relative">
  <select
    value={councilId}
    onChange={(e) => setCouncilId(e.target.value)}
    disabled={councilsLoading}
    className={`${fieldShellClass(councilId !== "", councilsLoading)} appearance-none pl-4 pr-16`}
    required
  >
    <option value="" disabled className="text-zinc-400">
      {councilsLoading ? "Loading councils..." : "Council"}
    </option>
    {councils.map((c) => (
      <option key={c.id} value={c.id} className="text-zinc-900">
        {c.name}
      </option>
    ))}
  </select>
  {!councilsLoading && councilId !== "" && (
    <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />
  )}
  <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
</div>
        </div>

        <label className="flex items-center gap-2 text-base text-zinc-700 -mt-2">
          <input
            type="checkbox"
            checked={isCommunityBased}
            onChange={(e) => setIsCommunityBased(e.target.checked)}
            className="w-4 h-4"
          />
          Check if community-based scouting
        </label>

        {/* Sponsoring Institution — locked/greyed out when community-based is checked */}
        <div className="relative">
          <select
            value={sponsoringInstitution}
            onChange={(e) => setSponsoringInstitution(e.target.value)}
            disabled={isCommunityBased}
            className={`${fieldShellClass(
              sponsoringInstitution !== "",
              isCommunityBased
            )} appearance-none pl-4 pr-16`}
            required={!isCommunityBased}
          >
            <option value="" disabled className="text-zinc-400">
              {isCommunityBased ? "Not applicable" : "Sponsoring Institution"}
            </option>
            <option value="school" className="text-zinc-900">School</option>
            <option value="church" className="text-zinc-900">Church</option>
            <option value="community_org" className="text-zinc-900">Community Organization</option>
          </select>
          {isCommunityBased ? (
            <LockClosedIcon className="w-5 h-5 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          ) : (
            <>
              {sponsoringInstitution !== "" && (
                <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
              <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </>
          )}
        </div>

        <hr className="my-2" />

        <label className="block text-lg font-medium">Membership Validity</label>
        <div className="relative">
          <select
            value={membershipValidity}
            onChange={(e) => setMembershipValidity(e.target.value)}
            className={`${fieldShellClass(membershipValidity !== "")} appearance-none pl-4 pr-16`}
            required
          >
            <option value="" disabled className="text-zinc-400">
              Membership Validity
            </option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((year) => (
              <option key={year} value={year} className="text-zinc-900">
                {year} Year{year > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          {membershipValidity !== "" && (
            <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
          <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <p className="text-zinc-600 text-lg">
          Amount to pay: ₱{amount} (₱{FEE_PER_YEAR}/year — placeholder fee)
        </p>

        {submitError && (
          <p className="text-red-600 text-base">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-green-800 hover:bg-green-900 transition-colors text-white text-lg font-medium py-3.5 px-4 mt-2 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Next"}
        </button>
      </form>
    </div>
  );
}