// src/app/scout/membership/membership-registration/register/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircleIcon, ChevronDownIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { submitApplicationAction } from "@/app/actions/application";
import { getCouncilsAction, getRegionsAction } from "@/app/actions/councils";
import SearchableSelect from "../components/SearchableSelect";
import { useWizard } from "../WizardContext";
import RegistrationStepper from "../components/RegistrationStepper";

const FEE_PER_YEAR = 50;

const readSaved = (key: string) => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) ?? "";
};

const readSavedBool = (key: string) => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(key) === "true";
};

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
  const [isAdultScoutFlow, setIsAdultScoutFlow] = useState(false);

  const {
    bloodType,
    address,
    telephone,
    emergencyContactName,
    emergencyContactRelationship,
    emergencyContactNumber,
  } = useWizard();

  const [scoutingPosition, setScoutingPosition] = useState("");
  const [advancementRank, setAdvancementRank] = useState("");
  const [tenure, setTenure] = useState("");
  const [regionId, setRegionId] = useState("");
  const [councilId, setCouncilId] = useState("");
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [councils, setCouncils] = useState<{ id: string; name: string; regionId: string | null }[]>([]);
  const [councilsLoading, setCouncilsLoading] = useState(true);
  const [isCommunityBased, setIsCommunityBased] = useState(false);
  const [sponsoringInstitution, setSponsoringInstitution] = useState("");
  const [membershipType, setMembershipType] = useState<"single" | "multi" | "">("");
  const [membershipValidity, setMembershipValidity] = useState("");
  const amount = FEE_PER_YEAR * (Number(membershipValidity) || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Detect adult scout flow on mount
  useEffect(() => {
    setIsAdultScoutFlow(localStorage.getItem("membershipFlow") === "adult_scout");
  }, []);

  // Hydrate form values safely after initial client mount
  useEffect(() => {
    const savedType = (readSaved("registerMembershipType") as "single" | "multi" | "") || "";
    const savedValidity = readSaved("registerMembershipValidity");

    setScoutingPosition(readSaved("registerScoutingPosition"));
    setAdvancementRank(readSaved("registerAdvancementRank"));
    setTenure(readSaved("registerTenure"));
    setRegionId(readSaved("registerRegionId"));
    setCouncilId(readSaved("registerCouncilId"));
    setIsCommunityBased(readSavedBool("registerIsCommunityBased"));
    setSponsoringInstitution(readSaved("registerSponsoringInstitution"));
    setMembershipType(savedType);

    if (savedType === "single") {
      setMembershipValidity("1");
    } else if (savedType === "multi") {
      setMembershipValidity(savedValidity);
    }
  }, []);

  // Handle updates when switching between Single and Multi-Year
  useEffect(() => {
    if (membershipType === "single") {
      setMembershipValidity("1");
    } else if (membershipType === "multi" && membershipValidity === "1") {
      setMembershipValidity("");
    } else if (membershipType === "") {
      setMembershipValidity("");
    }
  }, [membershipType]);

  // Persist values to localStorage on state changes
  useEffect(() => {
    localStorage.setItem("registerScoutingPosition", scoutingPosition);
    localStorage.setItem("registerAdvancementRank", advancementRank);
    localStorage.setItem("registerTenure", tenure);
    localStorage.setItem("registerRegionId", regionId);
    localStorage.setItem("registerCouncilId", councilId);
    localStorage.setItem("registerIsCommunityBased", String(isCommunityBased));
    localStorage.setItem("registerSponsoringInstitution", sponsoringInstitution);
    localStorage.setItem("registerMembershipType", membershipType);
    localStorage.setItem("registerMembershipValidity", membershipValidity);
  }, [
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

  // Fetch Councils & Regions in parallel
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const [councilsRes, regionsRes] = await Promise.all([
        getCouncilsAction(),
        getRegionsAction(),
      ]);

      if (isMounted) {
        if (councilsRes.success && councilsRes.data) setCouncils(councilsRes.data);
        if (regionsRes.success && regionsRes.data) setRegions(regionsRes.data);
        setCouncilsLoading(false);
        setRegionsLoading(false);
      }
    };

    loadData();

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
    const currentCouncil = councils.find((c) => c.id === councilId);
    if (currentCouncil && currentCouncil.regionId !== newRegionId) {
      setCouncilId("");
    }
  };

  const handleCouncilChange = (newCouncilId: string) => {
    setCouncilId(newCouncilId);
    const council = councils.find((c) => c.id === newCouncilId);
    if (council?.regionId) {
      setRegionId(council.regionId);
    }
  };

  const onNext = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");

    if (membershipType === "" || !membershipValidity) {
      setSubmitError("Please select a valid membership duration.");
      return;
    }

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
      region: regionName,
      communityBased: isCommunityBased,
      sponsoringInstitution: isCommunityBased ? null : sponsoringInstitution,
      requestedRegistrationYears: years,
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
    const selectedCouncilName = councils.find((c) => c.id === councilId)?.name ?? "";

    localStorage.setItem("registrationId", result.data.id);
    localStorage.setItem("paymentAmount", String(amount));
    localStorage.setItem("paymentDescription", description);
    localStorage.setItem("paymentYears", String(years));
    localStorage.setItem("paymentCouncil", selectedCouncilName);
    localStorage.setItem("paymentCouncilId", councilId);
    localStorage.setItem("paymentIsCommunityBased", String(isCommunityBased));
    localStorage.setItem("paymentSponsoringInstitution", resolvedSponsoringInstitution);

    router.push("/scout/membership/membership-registration/method");
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
      <form
        onSubmit={onNext}
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
          currentStep={isAdultScoutFlow ? 4 : 3}
          totalSteps={isAdultScoutFlow ? 5 : 4}
          currentLabel="Scout Information"
          splitAfterStep={isAdultScoutFlow ? 2 : undefined}
        />

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
            className={`flex-1 rounded-lg py-3 text-base font-medium border transition-colors ${
              membershipType === "multi"
                ? "bg-green-800 text-white border-green-800"
                : "bg-white text-zinc-500 border-zinc-300 hover:border-green-800"
            }`}
          >
            Multi-Year
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