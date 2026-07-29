// src/app/scout/membership/membership-registration/register/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircleIcon, ChevronDownIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { submitApplicationAction } from "@/app/actions/application";
import { getCouncilsAction, getRegionsAction } from "@/app/actions/councils";
import { getCurrentUserAction } from "@/app/actions/user";
import { calculateAge } from "@/lib/utils/age";
import { getEligibleScoutPositions, SCOUT_POSITION_AGE_BRACKETS } from "@/lib/utils/rank";
import SearchableSelect from "../components/SearchableSelect";
import BackButton from "@/components-general/ui/BackButton";
import { useWizard } from "../WizardContext";
import RegistrationStepper from "../components/RegistrationStepper";

const FEE_PER_YEAR = 50;
// Rank Options mapped by Scouting Section / Position
const ADVANCEMENT_RANKS_BY_SECTION: Record<string, { value: string; label: string }[]> = {
  kab_scout: [{ value: "young_usa", label: "Young Usa (Initial rank)" }, { value: "growing_usa", label: "Growing Usa" }, { value: "leaping_usa", label: "Leaping Usa (Highest KAB rank)" }],
  boy_scout: [{ value: "membership", label: "Membership" }, { value: "tenderfoot_scout", label: "Tenderfoot Scout" }, { value: "second_class_scout", label: "Second Class Scout" }, { value: "first_class_scout", label: "First Class Scout (Highest traditional Boy Scout rank)" }, { value: "scout_citizen_service", label: "Scout Citizen / Scout Service" }],
  senior_scout: [{ value: "membership", label: "Membership" }, { value: "explorer_scout", label: "Explorer Scout" }, { value: "pathfinder_scout", label: "Pathfinder Scout" }, { value: "outdoorsman_scout", label: "Outdoorsman Scout (Also specialized as Airman or Seaman)" }, { value: "venturer_scout", label: "Venturer Scout (Also specialized as Air Venture or Sea Venture)" }, { value: "eagle_scout", label: "Eagle Scout (Highest Senior Scout rank)" }],
  rover_scout: [{ value: "yellow_quadrant", label: "Yellow Quadrant" }, { value: "green_quadrant", label: "Green Quadrant" }, { value: "red_quadrant", label: "Red Quadrant" }, { value: "blue_quadrant", label: "Blue Quadrant" }, { value: "chief_scout_nation_builder", label: "Chief Scout's Nation Builder (Highest Rover rank)" }],
};
// Read value safely from localStorage
const readSaved = (key: string) => typeof window === "undefined" ? "" : localStorage.getItem(key) ?? "";
// Read boolean value safely from localStorage
const readSavedBool = (key: string) => typeof window === "undefined" ? false : localStorage.getItem(key) === "true";
// Dynamic input styling helper function
const fieldShellClass = (filled: boolean, locked?: boolean) => `w-full rounded-lg py-3 text-lg border transition-colors ${locked ? "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed" : filled ? "border-green-600 bg-green-50 text-zinc-900" : "border-zinc-300 bg-white text-zinc-400"}`;

export default function RegisterPage() {
  const router = useRouter();
  const { bloodType, address, telephone, emergencyContactName, emergencyContactRelationship, emergencyContactNumber } = useWizard();
  const [scoutingPosition, setScoutingPosition] = useState("");
  const [eligiblePositions, setEligiblePositions] = useState<typeof SCOUT_POSITION_AGE_BRACKETS[number][] | null>(null);
  // Fetch user age and compute eligible positions
  useEffect(() => { getCurrentUserAction().then((result) => setEligiblePositions(result.success && result.user?.birthdate ? getEligibleScoutPositions(calculateAge(result.user.birthdate)) : [])); }, []);
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
  const rankOptions = scoutingPosition ? ADVANCEMENT_RANKS_BY_SECTION[scoutingPosition] || [] : [];
  // Update scouting position state and clear dependent rank
  const handlePositionChange = (position: string) => { setScoutingPosition(position); setAdvancementRank(""); };
  // Hydrate initial state values from localStorage
  useEffect(() => {
    const savedType = (readSaved("registerMembershipType") as "single" | "multi" | "") || "";
    setScoutingPosition(readSaved("registerScoutingPosition"));
    setAdvancementRank(readSaved("registerAdvancementRank"));
    setTenure(readSaved("registerTenure"));
    setRegionId(readSaved("registerRegionId"));
    setCouncilId(readSaved("registerCouncilId"));
    setIsCommunityBased(readSavedBool("registerIsCommunityBased"));
    setSponsoringInstitution(readSaved("registerSponsoringInstitution"));
    setMembershipType(savedType);
    setMembershipValidity(savedType === "single" ? "1" : savedType === "multi" ? readSaved("registerMembershipValidity") : "");
  }, []);
  // Adjust validity default selection based on membership type selection
  useEffect(() => {
    if (membershipType === "single") setMembershipValidity("1");
    else if (membershipType === "multi" && membershipValidity === "1") setMembershipValidity("");
    else if (membershipType === "") setMembershipValidity("");
  }, [membershipType, membershipValidity]);
  // Sync state variables to localStorage
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
  }, [scoutingPosition, advancementRank, tenure, regionId, councilId, isCommunityBased, sponsoringInstitution, membershipType, membershipValidity]);
  // Load councils and regions concurrently on load
  useEffect(() => {
    let isMounted = true;
    Promise.all([getCouncilsAction(), getRegionsAction()]).then(([councilsRes, regionsRes]) => {
      if (isMounted) {
        if (councilsRes.success && councilsRes.data) setCouncils(councilsRes.data);
        if (regionsRes.success && regionsRes.data) setRegions(regionsRes.data);
        setCouncilsLoading(false);
        setRegionsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);
  const regionName = regions.find((r) => r.id === regionId)?.name ?? "";
  const councilOptions = regionId ? councils.filter((c) => c.regionId === regionId).map((c) => ({ id: c.id, label: c.name })) : councils.map((c) => ({ id: c.id, label: c.name }));
  const regionOptions = regions.map((r) => ({ id: r.id, label: r.name }));
  // Handle changing region selection
  const handleRegionChange = (newRegionId: string) => { setRegionId(newRegionId); if (councils.find((c) => c.id === councilId)?.regionId !== newRegionId) setCouncilId(""); };
  // Handle changing council selection
  const handleCouncilChange = (newCouncilId: string) => { setCouncilId(newCouncilId); const council = councils.find((c) => c.id === newCouncilId); if (council?.regionId) setRegionId(council.regionId); };
  // Form submission handler
  const onNext = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");
    if (membershipType === "" || !membershipValidity) { setSubmitError("Please select a valid membership duration."); return; }
    setIsSubmitting(true);
    const years = Number(membershipValidity);
    const resolvedSponsoringInstitution = isCommunityBased ? "community_based" : sponsoringInstitution;
    const result = await submitApplicationAction({ councilId, scoutingPosition, advancementRank, tenure: Number(tenure), region: regionName, communityBased: isCommunityBased, sponsoringInstitution: isCommunityBased ? null : sponsoringInstitution, requestedRegistrationYears: years, bloodType, address, telephone, emergencyContactName, emergencyContactRelationship, emergencyContactNumber });
    if (!result.success || !result.data) { setSubmitError(result.error ?? "Failed to create registration."); setIsSubmitting(false); return; }
    localStorage.setItem("registrationId", result.data.id);
    localStorage.setItem("paymentAmount", String(amount));
    localStorage.setItem("paymentDescription", `Scout Membership Registration (${years} year${years > 1 ? "s" : ""})`);
    localStorage.setItem("paymentYears", String(years));
    localStorage.setItem("paymentCouncil", councils.find((c) => c.id === councilId)?.name ?? "");
    localStorage.setItem("paymentCouncilId", councilId);
    localStorage.setItem("paymentIsCommunityBased", String(isCommunityBased));
    localStorage.setItem("paymentSponsoringInstitution", resolvedSponsoringInstitution);
    router.push("/scout/membership/membership-registration/method");
  };
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 bg-zinc-50 min-h-screen">
      <form onSubmit={onNext} className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-14 text-zinc-900 flex flex-col gap-5">
        <div className="mb-1 self-start"><BackButton onClick={() => router.back()} /></div>
        <h1 className="text-4xl font-bold text-green-800 mb-0">
          <span className="sr-only">eScout</span>
          <Image src="/escout-logo.svg" alt="eScout Logo" width={115} height={115} className="h-auto w-[115px] object-contain" />
        </h1>
        <h2 className="text-2xl font-semibold mb-4">Register Membership</h2>
        <RegistrationStepper currentStep={3} totalSteps={4} currentLabel="Scout Information" />
        {/* Scouting Position Dropdown */}
        <div className="relative">
          <select value={scoutingPosition} onChange={(e) => handlePositionChange(e.target.value)} className={`${fieldShellClass(scoutingPosition !== "")} appearance-none pl-4 pr-16`} disabled={!eligiblePositions || eligiblePositions.length === 0} required>
            <option value="" disabled className="text-zinc-400">{eligiblePositions === null ? "Loading..." : eligiblePositions.length === 0 ? "No scouting position available for your age" : "Scouting Position"}</option>
            {eligiblePositions?.map((position) => (<option key={position.value} value={position.value} className="text-zinc-900">{position.label.toUpperCase()}</option>))}
          </select>
          {scoutingPosition !== "" && <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />}
          <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {eligiblePositions?.length === 0 && <p className="-mt-2 text-xs text-red-600">Based on your birthdate, you don't currently fall within any BSP Scouting Position age bracket (5–26 years old).</p>}
        {/* Advancement Rank */}
        <div className="relative">
          <select value={advancementRank} onChange={(e) => setAdvancementRank(e.target.value)} className={`${fieldShellClass(advancementRank !== "", !scoutingPosition)} appearance-none pl-4 pr-16`} disabled={!scoutingPosition} required>
            <option value="" disabled className="text-zinc-400">{!scoutingPosition ? "Select Scouting Position First" : "Advancement Rank"}</option>
            {rankOptions.map((rank) => (<option key={rank.value} value={rank.value} className="text-zinc-900">{rank.label}</option>))}
          </select>
          {!scoutingPosition ? (
            <LockClosedIcon className="w-5 h-5 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          ) : (
            <>
              {advancementRank !== "" && <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />}
              <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </>
          )}
        </div>
        {/* Tenure in Scouting */}
        <div className="relative">
          <input placeholder="Tenure in Scouting (years)" className={`${fieldShellClass(tenure !== "")} pl-4 pr-10`} value={tenure} onChange={(e) => setTenure(e.target.value)} required />
          {tenure !== "" && <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SearchableSelect options={councilOptions} value={councilId} onChange={handleCouncilChange} placeholder="Council" loading={councilsLoading} />
          <SearchableSelect options={regionOptions} value={regionId} onChange={handleRegionChange} placeholder="Region" loading={regionsLoading} />
        </div>
        <label className="flex items-center gap-2 text-base text-zinc-700 -mt-2">
          <input type="checkbox" checked={isCommunityBased} onChange={(e) => setIsCommunityBased(e.target.checked)} className="w-4 h-4" />
          Check if community-based scouting
        </label>
        {/* Sponsoring Institution */}
        <div className="relative">
          <select value={sponsoringInstitution} onChange={(e) => setSponsoringInstitution(e.target.value)} disabled={isCommunityBased} className={`${fieldShellClass(sponsoringInstitution !== "", isCommunityBased)} appearance-none pl-4 pr-16`} required={!isCommunityBased}>
            <option value="" disabled className="text-zinc-400">{isCommunityBased ? "Not applicable" : "Sponsoring Institution"}</option>
            <option value="school" className="text-zinc-900">School</option>
            <option value="church" className="text-zinc-900">Church</option>
            <option value="community_org" className="text-zinc-900">Community Organization</option>
          </select>
          {isCommunityBased ? (
            <LockClosedIcon className="w-5 h-5 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          ) : (
            <>
              {sponsoringInstitution !== "" && <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />}
              <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </>
          )}
        </div>
        <hr className="my-2" />
        <label className="block text-lg font-medium">Membership Validity</label>
        <div className="flex gap-3">
          <button type="button" onClick={() => setMembershipType("single")} className={`flex-1 rounded-lg py-3 text-base font-medium border transition-colors ${membershipType === "single" ? "bg-green-800 text-white border-green-800" : "bg-white text-zinc-500 border-zinc-300 hover:border-green-800"}`}>Single Year</button>
          <button type="button" onClick={() => setMembershipType("multi")} className={`flex-1 rounded-lg py-3 text-base font-medium border transition-colors ${membershipType === "multi" ? "bg-green-800 text-white border-green-800" : "bg-white text-zinc-500 border-zinc-300 hover:border-green-800"}`}>Multi-Year</button>
        </div>
        {membershipType === "multi" && (
          <div className="relative">
            <select value={membershipValidity} onChange={(e) => setMembershipValidity(e.target.value)} className={`${fieldShellClass(membershipValidity !== "")} appearance-none pl-4 pr-16`} required>
              <option value="" disabled className="text-zinc-400">Number of Years</option>
              {Array.from({ length: 9 }, (_, i) => i + 2).map((year) => (<option key={year} value={year} className="text-zinc-900">{year} Years</option>))}
            </select>
            {membershipValidity !== "" && <CheckCircleIcon className="w-5 h-5 text-green-600 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />}
            <ChevronDownIcon className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
        <p className="text-zinc-600 text-lg">Amount to pay: ₱{amount} (₱{FEE_PER_YEAR}/year — placeholder fee)</p>
        {submitError && <p className="text-red-600 text-base">{submitError}</p>}
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-green-800 hover:bg-green-900 transition-colors text-white text-lg font-medium py-3.5 px-4 mt-2 disabled:opacity-50">{isSubmitting ? "Submitting..." : "Next"}</button>
      </form>
    </div>
  );
}