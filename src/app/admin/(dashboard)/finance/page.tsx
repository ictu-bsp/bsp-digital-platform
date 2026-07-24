// src/app/admin/(dashboard)/finance/page.tsx
// Finance admin page — lists registrations that Membership has already
// reviewed and approved, awaiting Finance's payment verification before
// being pushed to active records.

import { fetchRegistrationsAwaitingFinance } from "@/app/actions/admin";
import FinanceTable from "./FinanceTable";

export default async function FinancePage() {
  const result = await fetchRegistrationsAwaitingFinance();
  const registrations = result.success ? result.data : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h1 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-green-800 rounded-full inline-block" />
        Finance — Awaiting Verification
      </h1>

      <FinanceTable registrations={registrations ?? []} />
    </div>
  );
}