// src/app/admin/(dashboard)/finance/page.tsx
import { fetchRegistrationsAwaitingFinance } from "@/app/actions/admin";
import FinanceTable from "./FinanceTable";
import { requireAdminPage } from "@/lib/auth/require-admin";
// Fetch pending finance registrations and render the verification table.
export default async function FinancePage() {
  await requireAdminPage(["CHIEF_EXECUTIVE", "FINANCE_OFFICER"]);
  const result = await fetchRegistrationsAwaitingFinance();
  const registrations = result.success ? result.data : [];
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h1 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2"><span className="w-1 h-5 bg-green-800 rounded-full inline-block" />Finance — Awaiting Verification</h1>
      <FinanceTable registrations={registrations ?? []} />
    </div>
  );
}