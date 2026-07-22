"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircleIcon, ChevronDownIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { submitApplicationAction } from "@/app/actions/application";
import { getCouncilsAction, getRegionsAction } from "@/app/actions/councils";
import SearchableSelect from "../../components/SearchableSelect";
import { useWizard } from "../../WizardContext";
import RegistrationStepper from "../../components/RegistrationStepper";

const FEE_PER_YEAR = 100;

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

export default function AdultScoutRegisterPage() {
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

  const [firstName, setFirstName] = useState(() => readSaved("registerFirstName"));
  const [lastName, setLastName] = useState(() => readSaved("registerLastName"));
  const [middleName, setMiddleName] = useState(() => readSaved("registerMiddleName"));
  const [nameExtension, setNameExtension] = useState(() => readSaved("registerNameExtension"));
  const [birthday, setBirthday] = useState(() => readSaved("registerBirthday"));
  const [mobileNumber, setMobileNumber] = useState(() => readSaved("registerMobileNumber"));
  const [gender, setGender] = useState(() => readSaved("registerGender"));
  const [civilStatus, setCivilStatus] = useState(() => readSaved("registerCivilStatus"));
  const [profession, setProfession] = useState(() => readSaved("registerProfession"));
  const [positionTitle, setPositionTitle] = useState(() => readSaved("registerPositionTitle"));
  const [scoutingPosition, setScoutingPosition] = useState(() => readSaved("registerScoutingPosition"));
  const [advancementRank, setAdvancementRank] = useState(() => readSaved("registerAdvancementRank"));
  const [tenure, setTenure] = useState(() => readSaved("registerTenure"));
  const [regionId, setRegionId] = useState(() => readSaved("registerRegionId"));
  const [councilId, setCouncilId] = useState(() => readSaved("registerCouncilId"));
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [councils, setCouncils] = useState<{ id: string; name: string; regionId: string | null }[]>([]);
  const [councilsLoading, setCouncilsLoading] = useState(true);
  const [isCommunityBased, setIsCommunityBased] = useState(() => readSavedBool("registerIsCommunityBased"));
  const [sponsoringInstitution, setSponsoringInstitution] = useState(() => readSaved("registerSponsoringInstitution"));
  const [membershipValidity, setMembershipValidity] = useState(() => readSaved("registerMembershipValidity"));

  const amount = FEE_PER_YEAR * (Number(membershipValidity) || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setIsAdultScoutFlow(localStorage.getItem("membershipFlow") === "adult_scout");
  }, []);

  useEffect(() => {
    if (isCommunityBased) {
      setSponsoringInstitution("");
    }
  }, [isCommunityBased]);

  useEffect(() => {
    localStorage.setItem("registerFirstName", firstName);
    localStorage.setItem("registerLastName", lastName);
    localStorage.setItem("registerMiddleName", middleName);
    localStorage.setItem("registerNameExtension", nameExtension);
    localStorage.setItem("registerBirthday", birthday);
    localStorage.setItem("registerMobileNumber", mobileNumber);
    localStorage.setItem("registerGender", gender);
    localStorage.setItem("registerCivilStatus", civilStatus);
    localStorage.setItem("registerProfession", profession);
    localStorage.setItem("registerPositionTitle", positionTitle);
    localStorage.setItem("registerScoutingPosition", scoutingPosition);
    localStorage.setItem("registerAdvancementRank", advancementRank);
    localStorage.setItem("registerTenure", tenure);
    localStorage.setItem("registerRegionId", regionId);
    localStorage.setItem("registerCouncilId", councilId);
    localStorage.setItem("registerIsCommunityBased", String(isCommunityBased));
    localStorage.setItem("registerSponsoringInstitution", sponsoringInstitution);
    localStorage.setItem("registerMembershipValidity", membershipValidity);
  }, [
    firstName,
    lastName,
    middleName,
    nameExtension,
    birthday,
    mobileNumber,
    gender,
    civilStatus,
    profession,
    positionTitle,
    scoutingPosition,
    advancementRank,
    tenure,
    regionId,
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

  useEffect(() => {
    const loadRegions = async () => {
      const result = await getRegionsAction();
      if (result.success && result.data) {
        setRegions(result.data);
      }
      setRegionsLoading(false);
    };

    loadRegions();
  }, []);

  const regionName = regions.find((r) => r.id === regionId)?.name ?? "";
  const councilOptions = regionId
    ? councils.filter((c) => c.regionId === regionId).map((c) => ({ id: c.id, label: c.name }))
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
    setIsSubmitting(true);

    const years = Number(membershipValidity);
    const resolvedSponsoringInstitution = isCommunityBased ? "community_based" : sponsoringInstitution;

    const payload: Parameters<typeof submitApplicationAction>[0] = {
      councilId,
      scoutingPosition,
      advancementRank,
      tenure: Number(tenure),
      region: regionName,
      communityBased: isCommunityBased,
      sponsoringInstitution: isCommunityBased ? null : sponsoringInstitution,
      requestedRegistrationYears: Number(membershipValidity),
      bloodType,
      address,
      telephone,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactNumber,
      firstName,
      lastName,
      middleName,
      nameExtension,
      birthday,
      mobileNumber,
      gender,
      civilStatus,
      profession,
      positionTitle,
    };

    const result = await submitApplicationAction(payload);

    if (!result.success || !result.data) {
      setSubmitError(result.error ?? "Failed to create registration.");
      setIsSubmitting(false);
      return;
    }


    const description = `Adult Scout Membership Registration (${years} year${years > 1 ? "s" : ""})`;
    localStorage.setItem("registrationId", result.data.id);
    localStorage.setItem("paymentAmount", String(amount));
    localStorage.setItem("paymentDescription", description);
    localStorage.setItem("paymentYears", String(years));
    const selectedCouncilName = councils.find((c) => c.id === councilId)?.name ?? "";
    localStorage.setItem("paymentCouncil", selectedCouncilName);
    localStorage.setItem("paymentCouncilId", councilId);
    localStorage.setItem("paymentIsCommunityBased", String(isCommunityBased));
    localStorage.setItem("paymentSponsoringInstitution", resolvedSponsoringInstitution);

    router.push("/scout/membership/membership-registration/adult-scout/method");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-6 sm:px-6 sm:py-10">
      <form
        onSubmit={onNext}
        className="w-full max-w-3xl rounded-2xl bg-white p-6 text-zinc-900 shadow-xl sm:p-14"
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-2xl text-zinc-700 sm:text-3xl"
          aria-label="Go back"
        >
          &lt;
        </button>

        <h1 className="mb-2 text-2xl font-bold text-green-800 sm:text-4xl">
          <Image
            src="/escout-logo.svg"
            alt="eScout Logo"
            width={115}
            height={115}
            className="h-auto w-[115px] object-contain"
          />
        </h1>
        <h2 className="mb-6 text-lg font-semibold sm:text-2xl">Adult Scout Registration</h2>

        <RegistrationStepper
          currentStep={isAdultScoutFlow ? 4 : 4}
          totalSteps={5}
          currentLabel="Scout Information"
          splitAfterStep={2}
        />

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="relative">
            <input
              placeholder="First Name"
              className={`${fieldShellClass(firstName !== "")} pl-4 pr-10`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            {firstName !== "" && (
              <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
          </div>

          <div className="relative">
            <input
              placeholder="Last Name"
              className={`${fieldShellClass(lastName !== "")} pl-4 pr-10`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            {lastName !== "" && (
              <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
          </div>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="relative">
            <input
              placeholder="Middle Name"
              className={`${fieldShellClass(middleName !== "")} pl-4 pr-10`}
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
            {middleName !== "" && (
              <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
          </div>

          <div className="relative">
            <input
              placeholder="Name Extension"
              className={`${fieldShellClass(nameExtension !== "")} pl-4 pr-10`}
              value={nameExtension}
              onChange={(e) => setNameExtension(e.target.value)}
            />
            {nameExtension !== "" && (
              <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
          </div>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="relative">
            <input
              type="date"
              placeholder="Birthday"
              className={`${fieldShellClass(birthday !== "")} pl-4 pr-10`}
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
            />
            {birthday !== "" && (
              <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
          </div>

          <div className="relative">
            <input
              placeholder="Mobile Number"
              inputMode="numeric"
              maxLength={11}
              className={`${fieldShellClass(mobileNumber !== "")} pl-4 pr-10`}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
              required
            />
            {mobileNumber !== "" && (
              <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
          </div>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="relative">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`${fieldShellClass(gender !== "")} appearance-none pl-4 pr-16`}
              required
            >
              <option value="" disabled className="text-zinc-400">
                Gender
              </option>
              <option value="male" className="text-zinc-900">Male</option>
              <option value="female" className="text-zinc-900">Female</option>
              <option value="other" className="text-zinc-900">Other</option>
            </select>
            {gender !== "" && (
              <CheckCircleIcon className="pointer-events-none absolute right-9 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
            <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          </div>

          <div className="relative">
            <select
              value={civilStatus}
              onChange={(e) => setCivilStatus(e.target.value)}
              className={`${fieldShellClass(civilStatus !== "")} appearance-none pl-4 pr-16`}
              required
            >
              <option value="" disabled className="text-zinc-400">
                Civil Status
              </option>
              <option value="single" className="text-zinc-900">Single</option>
              <option value="married" className="text-zinc-900">Married</option>
              <option value="widowed" className="text-zinc-900">Widowed</option>
              <option value="separated" className="text-zinc-900">Separated</option>
            </select>
            {civilStatus !== "" && (
              <CheckCircleIcon className="pointer-events-none absolute right-9 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
            <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          </div>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="relative">
            <input
              placeholder="Profession/Occupation"
              className={`${fieldShellClass(profession !== "")} pl-4 pr-10`}
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            />
            {profession !== "" && (
              <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
          </div>

          <div className="relative">
            <input
              placeholder="Position/Title"
              className={`${fieldShellClass(positionTitle !== "")} pl-4 pr-10`}
              value={positionTitle}
              onChange={(e) => setPositionTitle(e.target.value)}
            />
            {positionTitle !== "" && (
              <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
            )}
          </div>
        </div>

        <div className="mb-4 relative">
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
            <CheckCircleIcon className="pointer-events-none absolute right-9 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
          )}
          <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        </div>

        <div className="mb-4 relative">
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
            <CheckCircleIcon className="pointer-events-none absolute right-9 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
          )}
          <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        </div>

        <div className="mb-4 relative">
          <input
            placeholder="Tenure in Scouting (years)"
            className={`${fieldShellClass(tenure !== "")} pl-4 pr-10`}
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            required
          />
          {tenure !== "" && (
            <CheckCircleIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
          )}
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
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

        <label className="mb-4 flex items-center gap-2 text-base text-zinc-700">
          <input
            type="checkbox"
            checked={isCommunityBased}
            onChange={(e) => setIsCommunityBased(e.target.checked)}
            className="h-4 w-4"
          />
          Check if community-based scouting
        </label>

        <div className="mb-4 relative">
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
            <option value="school" className="text-zinc-900">School</option>
            <option value="church" className="text-zinc-900">Church</option>
            <option value="community_org" className="text-zinc-900">Community Organization</option>
          </select>
          {isCommunityBased ? (
            <LockClosedIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          ) : (
            <>
              {sponsoringInstitution !== "" && (
                <CheckCircleIcon className="pointer-events-none absolute right-9 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
              )}
              <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            </>
          )}
        </div>

        <div className="mb-6 relative">
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
            <CheckCircleIcon className="pointer-events-none absolute right-9 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
          )}
          <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-green-800 px-4 py-3.5 text-lg font-medium text-white transition-colors hover:bg-green-900 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Next"}
        </button>
      </form>
    </div>
  );
}
