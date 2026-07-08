"use client";
// src/app/payments/register/page.tsx
// Step 2 of the registration wizard: Scout Info + Number of Years.
// TODO: Scouting Position, Advancement Rank, Region, and Sponsoring Institution
// are placeholder dropdowns — replace their options with real values once
// the DB/UI side of the team defines them (not in schema.ts yet).

import { useState } from "react";
import { useRouter } from "next/navigation";

const FEE_PER_YEAR = 100;

export default function RegisterPage() {
  const router = useRouter();

  const [scoutingPosition, setScoutingPosition] = useState("");
  const [advancementRank, setAdvancementRank] = useState("");
  const [tenure, setTenure] = useState("");
  const [region, setRegion] = useState("");
  const [council, setCouncil] = useState("");
  const [sponsoringInstitution, setSponsoringInstitution] = useState("");
  const [years, setYears] = useState(1);

  const amount = FEE_PER_YEAR * years;

  const onNext = (event: React.FormEvent) => {
    event.preventDefault();
    const description = `Scout Membership Registration (${years} year${years > 1 ? "s" : ""})`;
    localStorage.setItem("paymentAmount", String(amount));
    localStorage.setItem("paymentDescription", description);
    localStorage.setItem("paymentYears", String(years));
    localStorage.setItem("paymentCouncil", council);
    router.push("/payments/method");
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

        <h1 className="text-4xl font-bold text-green-800 mb-0">eScout</h1>
        <h2 className="text-2xl font-semibold mb-4">Register Membership</h2>

        <div className="flex items-center justify-center gap-3 text-base text-green-800 mb-4">
          <span className="w-8 h-8 rounded-full border-2 border-green-800 flex items-center justify-center">
            1
          </span>
          <span>|</span>
          <span className="flex items-center gap-2 bg-green-800 text-white rounded-full px-4 py-1.5">
            <span className="w-6 h-6 rounded-full bg-white text-green-800 flex items-center justify-center text-sm font-semibold">
              2
            </span>
            Scout Information
          </span>
          <span>|</span>
          <span className="w-8 h-8 rounded-full border-2 border-green-800 flex items-center justify-center">
            3
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select
            value={scoutingPosition}
            onChange={(e) => setScoutingPosition(e.target.value)}
            className="border rounded-lg px-4 py-3 text-lg"
            required
          >
            <option value="" disabled>Scouting Position</option>
            <option value="scout">Scout</option>
            <option value="assistant_scoutmaster">Assistant Scoutmaster</option>
            <option value="scoutmaster">Scoutmaster</option>
          </select>

          <select
            value={advancementRank}
            onChange={(e) => setAdvancementRank(e.target.value)}
            className="border rounded-lg px-4 py-3 text-lg"
            required
          >
            <option value="" disabled>Advancement Rank</option>
            <option value="scout">Scout</option>
            <option value="first_class">First Class Scout</option>
            <option value="eagle">Eagle Scout</option>
          </select>
        </div>

        <input
          placeholder="Tenure in Scouting (years)"
          className="border rounded-lg px-4 py-3 text-lg"
          value={tenure}
          onChange={(e) => setTenure(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="border rounded-lg px-4 py-3 text-lg"
            required
          >
            <option value="" disabled>Region</option>
            <option value="ncr">NCR</option>
            <option value="region_1">Region I</option>
            <option value="region_2">Region II</option>
          </select>

          <input
            placeholder="Council"
            className="border rounded-lg px-4 py-3 text-lg"
            value={council}
            onChange={(e) => setCouncil(e.target.value)}
            required
          />
        </div>

        <select
          value={sponsoringInstitution}
          onChange={(e) => setSponsoringInstitution(e.target.value)}
          className="border rounded-lg px-4 py-3 text-lg"
          required
        >
          <option value="" disabled>Sponsoring Institution</option>
          <option value="school">School</option>
          <option value="church">Church</option>
          <option value="community_org">Community Organization</option>
        </select>

        <hr className="my-2" />

        <label className="block text-lg font-medium">Number of Years</label>
        <select
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="border rounded-lg px-4 py-3 text-lg"
        >
          <option value={1}>1 Year</option>
          <option value={2}>2 Years</option>
          <option value={3}>3 Years</option>
          <option value={4}>4 Years</option>
          <option value={5}>5 Years</option>
        </select>

        <p className="text-zinc-600 text-lg">
          Amount to pay: ₱{amount} (₱{FEE_PER_YEAR}/year — placeholder fee)
        </p>

        <button
          type="submit"
          className="rounded-lg bg-green-800 hover:bg-green-900 transition-colors text-white text-lg font-medium py-3.5 px-4 mt-2"
        >
          Next
        </button>
      </form>
    </div>
  );
}