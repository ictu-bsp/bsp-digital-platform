// src/app/scout/membership/membership-registration/register/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import { submitApplicationAction } from "@/app/actions/application";
import { getCouncilsAction, getRegionsAction } from "@/app/actions/councils";
import { getCurrentUserAction } from "@/app/actions/user";
import { calculateAge } from "@/lib/utils/age";
import {
  getEligibleScoutSections,
  SCOUT_SECTION_AGE_BRACKETS,
  type ScoutSection,
} from "@/lib/utils/scout-section";
import { getAdvancementRanksForSection } from "@/lib/utils/scout-advancement-rank";
import SearchableSelect from "../components/SearchableSelect";
import BackButton from "@/components-general/ui/BackButton";
import { useWizard } from "../WizardContext";
import RegistrationStepper from "../components/RegistrationStepper";

// Read string value safely from localStorage
const readSaved = (key: string) =>
  typeof window === "undefined" ? "" : (localStorage.getItem(key) ?? "");
// Read boolean value safely from localStorage
const readSavedBool = (key: string) =>
  typeof window === "undefined" ? false : localStorage.getItem(key) === "true";

// Dynamic input styling helper function
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

  const [hasHydrated, setHasHydrated] = useState(false);
  const [scoutingPosition, setScoutingPosition] = useState("");
  const [eligiblePositions, setEligiblePositions] = useState<
    (typeof SCOUT_SECTION_AGE_BRACKETS)[number][] | null
  >(null);

  // Fetch user age and compute eligible sections
  useEffect(() => {
    getCurrentUserAction().then((result) =>
      setEligiblePositions(
        result.success && result.user?.birthdate
          ? getEligibleScoutSections(calculateAge(result.user.birthdate))
          : [],
      ),
    );
  }, []);

  const [advancementRank, setAdvancementRank] = useState("");
  const [tenure, setTenure] = useState("");
  const [regionId, setRegionId] = useState("");
  const [councilId, setCouncilId] = useState("");
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [councils, setCouncils] = useState<
    { id: string; name: string; regionId: string | null }[]
  >([]);
  const [councilsLoading, setCouncilsLoading] = useState(true);
  const [isCommunityBased, setIsCommunityBased] = useState(false);
  const [sponsoringInstitution, setSponsoringInstitution] = useState("");
  const [membershipType, setMembershipType] = useState<"single" | "multi" | "">(
    "",
  );
  const [membershipValidity, setMembershipValidity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const rankOptions = getAdvancementRanksForSection(
    (scoutingPosition || null) as ScoutSection | null,
  );
  const isKidScout = scoutingPosition === "KID";

  const handlePositionChange = (position: string) => {
    setScoutingPosition(position);
    setAdvancementRank("");
  };

  useEffect(() => {
    const savedType =
      (readSaved("registerMembershipType") as "single" | "multi" | "") || "";
    setScoutingPosition(readSaved("registerScoutingPosition"));
    setAdvancementRank(readSaved("registerAdvancementRank"));
    setTenure(readSaved("registerTenure"));
    setRegionId(readSaved("registerRegionId"));
    setCouncilId(readSaved("registerCouncilId"));
    setIsCommunityBased(readSavedBool("registerIsCommunityBased"));
    setSponsoringInstitution(readSaved("registerSponsoringInstitution"));
    setMembershipType(savedType);
    setMembershipValidity(
      savedType === "single"
        ? "1"
        : savedType === "multi"
          ? readSaved("registerMembershipValidity")
          : "",
    );
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (membershipType === "single") setMembershipValidity("1");
    else if (membershipType === "multi" && membershipValidity === "1")
      setMembershipValidity("");
    else if (membershipType === "") setMembershipValidity("");
  }, [hasHydrated, membershipType, membershipValidity]);

  useEffect(() => {
    if (!hasHydrated) return;
    localStorage.setItem("registerScoutingPosition", scoutingPosition);
    localStorage.setItem("registerAdvancementRank", advancementRank);
    localStorage.setItem("registerTenure", tenure);
    localStorage.setItem("registerRegionId", regionId);
    localStorage.setItem("registerCouncilId", councilId);
    localStorage.setItem("registerIsCommunityBased", String(isCommunityBased));
    localStorage.setItem(
      "registerSponsoringInstitution",
      sponsoringInstitution,
    );
    localStorage.setItem("registerMembershipType", membershipType);
    localStorage.setItem("registerMembershipValidity", membershipValidity);
  }, [
    hasHydrated,
    scoutingPosition,
    advancementRank,
    tenure,
    regionId,
    councilId,
    isCommunityBased,
    sponsoringInstitution,
    membershipType,
    membershipValidity,
  ]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getCouncilsAction(), getRegionsAction()]).then(
      ([councilsRes, regionsRes]) => {
        if (isMounted) {
          if (councilsRes.success && councilsRes.data)
            setCouncils(councilsRes.data);
          if (regionsRes.success && regionsRes.data)
            setRegions(regionsRes.data);
          setCouncilsLoading(false);
          setRegionsLoading(false);
        }
      },
    );
    return () => {
      isMounted = false;
    };
  }, []);

  const regionName = regions.find((r) => r.id === regionId)?.name ?? "";
  const councilOptions = regionId
    ? councils
        .filter((c) => c.regionId === regionId)
        .map((c) => ({ id: c.id, label: c.name }))
    : councils.map((c) => ({ id: c.id, label: c.name }));
  const regionOptions = regions.map((r) => ({ id: r.id, label: r.name }));

  const handleRegionChange = (newRegionId: string) => {
    setRegionId(newRegionId);
    if (councils.find((c) => c.id === councilId)?.regionId !== newRegionId)
      setCouncilId("");
  };

  const handleCouncilChange = (newCouncilId: string) => {
    setCouncilId(newCouncilId);
    const council = councils.find((c) => c.id === newCouncilId);
    if (council?.regionId) setRegionId(council.regionId);
  };

  const cleanNull = (val?: string | null) =>
    !val || val.trim() === "" ? null : val.trim();

  // Direct Submission Handler (No Payment Redirection)
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");

    if (membershipType === "" || !membershipValidity) {
      setSubmitError("Please select a valid membership duration.");
      return;
    }

    const tenureNum = Number(tenure);
    if (!Number.isInteger(tenureNum) || tenureNum < 1 || tenureNum > 99) {
      setSubmitError("Please enter a valid tenure between 1 and 99 years.");
      return;
    }

    const years = Number(membershipValidity);
    const resolvedSponsoringInstitution = isCommunityBased
      ? null
      : cleanNull(sponsoringInstitution);

    const applicationPayload = {
      preferredCouncilId: cleanNull(councilId),
      councilId: cleanNull(councilId),
      scoutingPosition: cleanNull(scoutingPosition),
      scoutSection: cleanNull(scoutingPosition),
      advancementRank: isKidScout ? null : cleanNull(advancementRank),
      tenure: Number(tenure) || 0,
      region: cleanNull(regionName),
      communityBased: isCommunityBased,
      sponsoringInstitution: resolvedSponsoringInstitution,
      requestedRegistrationYears: years,
      bloodType: cleanNull(bloodType),
      address: cleanNull(address),
      telephoneNumber: cleanNull(telephone),
      emergencyContactName: cleanNull(emergencyContactName),
      emergencyContactRelationship: cleanNull(emergencyContactRelationship),
      emergencyContactNumber: cleanNull(emergencyContactNumber),
      remarks: null,
      status: "PENDING" as const,
    };

    try {
      setIsSubmitting(true);

      const result = await submitApplicationAction(applicationPayload);

      if (!result.success) {
        setSubmitError(
          result.error || "Failed to submit application. Please try again.",
        );
        setIsSubmitting(false);
        return;
      }

      // Clear wizard form cache
      localStorage.removeItem("registerScoutingPosition");
      localStorage.removeItem("registerAdvancementRank");
      localStorage.removeItem("registerTenure");
      localStorage.removeItem("registerRegionId");
      localStorage.removeItem("registerCouncilId");
      localStorage.removeItem("registerIsCommunityBased");
      localStorage.removeItem("registerSponsoringInstitution");
      localStorage.removeItem("registerMembershipType");
      localStorage.removeItem("registerMembershipValidity");
      localStorage.removeItem("pendingApplicationPayload");

      // Redirect to the success/status landing page
      router.push("/scout/membership");
    } catch (err: any) {
      setSubmitError(
        err.message || "An unexpected error occurred during submission.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-14 text-zinc-900 flex flex-col gap-5"
      >
        <div className="mb-1 self-start">
          <BackButton onClick={() => router.back()} />
        </div>
        <h1 className="text-4xl font-bold text-green-800 mb-0">
          <span className="sr-only">eScout</span>
          <Image
            src="/escout-logo.svg"
            alt="eScout Logo"
            width={115}
            height={115}
            className="h-auto w-[115px] object-contain"
          />
        </h1>
        <h2 className="text-2xl font-semibold mb-4">Register Membership</h2>
        <RegistrationStepper
          currentStep={3}
          totalSteps={3}
          currentLabel="Scout Information"
        />

        {/* Scouting Position Dropdown */}
        <div className="relative">
          <select
            value={scoutingPosition}
            onChange={(e) => handlePositionChange(e.target.value)}
            className={`${fieldShellClass(scoutingPosition !== "")} appearance-none pl-4 pr-16`}
            disabled={!eligiblePositions || eligiblePositions.length === 0}
            required
          >
            <option value="" disabled className="text-zinc-400">
              {eligiblePositions === null
                ? "Loading..."
                : eligiblePositions.length === 0
                  ? "No scouting position available for your age"
                  : "Scouting Position"}
            </option>
            {eligiblePositions?.map((position) => (
              <option
                key={position.value}
                value={position.value}
                className="text-zinc-900"
              >
                {position.label.toUpperCase()}
              </option>
            ))}
          </select>
          {scoutingPosition !== "" && (
            <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
          <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {eligiblePositions?.length === 0 && (
          <p className="-mt-2 text-xs text-red-600">
            Based on your birthdate, you don't currently fall within any BSP
            Scouting Position age bracket (5–26 years old).
          </p>
        )}

        {/* Advancement Rank */}
        <div className="relative">
          <select
            value={isKidScout ? "" : advancementRank}
            onChange={(e) => setAdvancementRank(e.target.value)}
            className={`${fieldShellClass(advancementRank !== "", !scoutingPosition || isKidScout)} appearance-none pl-4 pr-16`}
            disabled={!scoutingPosition || isKidScout}
            required={!isKidScout}
          >
            <option value="" disabled className="text-zinc-400">
              {!scoutingPosition
                ? "Select Scouting Position First"
                : isKidScout
                  ? "No Advancement Rank (Kid Scout)"
                  : "Advancement Rank"}
            </option>
            {rankOptions.map((rank) => (
              <option
                key={rank.value}
                value={rank.value}
                className="text-zinc-900"
              >
                {rank.label}
              </option>
            ))}
          </select>
          {!scoutingPosition || isKidScout ? (
            <LockClosedIcon className="w-5 h-5 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          ) : (
            <>
              {advancementRank !== "" && (
                <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
              <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </>
          )}
        </div>

        {/* Tenure in Scouting */}
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Tenure in Scouting (years)"
            className={`${fieldShellClass(tenure !== "")} pl-4 pr-10`}
            value={tenure}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 2);
              setTenure(digitsOnly);
            }}
            maxLength={2}
            required
          />
          {tenure !== "" && (
            <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SearchableSelect
            options={councilOptions}
            value={councilId}
            onChange={handleCouncilChange}
            placeholder="Council"
            loading={councilsLoading}
          />
          <SearchableSelect
            options={regionOptions}
            value={regionId}
            onChange={handleRegionChange}
            placeholder="Region"
            loading={regionsLoading}
          />
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

        {/* Sponsoring Institution */}
        <div className="relative">
          <select
            value={sponsoringInstitution}
            onChange={(e) => setSponsoringInstitution(e.target.value)}
            disabled={isCommunityBased}
            className={`${fieldShellClass(sponsoringInstitution !== "", isCommunityBased)} appearance-none pl-4 pr-16`}
            required={!isCommunityBased}
          >
            <option value="" disabled className="text-zinc-400">
              {isCommunityBased ? "Not applicable" : "Sponsoring Institution"}
            </option>
            <option value="school" className="text-zinc-900">
              School
            </option>
            <option value="church" className="text-zinc-900">
              Church
            </option>
            <option value="community_org" className="text-zinc-900">
              Community Organization
            </option>
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
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMembershipType("single")}
            className={`flex-1 rounded-lg py-3 text-base font-medium border transition-colors ${
              membershipType === "single"
                ? "bg-green-800 text-white border-green-800"
                : "bg-white text-zinc-500 border-zinc-300 hover:border-green-800"
            }`}
          >
            Single Year
          </button>
          <button
            type="button"
            onClick={() => setMembershipType("multi")}
            disabled
            title="Multi-Year registration is coming soon"
            className="flex-1 rounded-lg py-3 text-base font-medium border transition-colors bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
          >
            Multi-Year <span className="text-xs">(Coming Soon)</span>
          </button>
        </div>

        {membershipType === "multi" && (
          <div className="relative">
            <select
              value={membershipValidity}
              onChange={(e) => setMembershipValidity(e.target.value)}
              className={`${fieldShellClass(membershipValidity !== "")} appearance-none pl-4 pr-16`}
              required
            >
              <option value="" disabled className="text-zinc-400">
                Number of Years
              </option>
              {Array.from({ length: 9 }, (_, i) => i + 2).map((year) => (
                <option key={year} value={year} className="text-zinc-900">
                  {year} Years
                </option>
              ))}
            </select>
            {membershipValidity !== "" && (
              <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
            <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {submitError && <p className="text-red-600 text-base">{submitError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-green-800 hover:bg-green-900 transition-colors text-white text-lg font-medium py-3.5 px-4 mt-2 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting Application..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
