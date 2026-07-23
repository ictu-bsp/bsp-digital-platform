// src/app/admin/(dashboard)/membership-review/page.tsx
// Membership Review admin page — lists pending scout registrations
// awaiting approval, with a click-to-open modal for full details.

import { fetchPendingRegistrations } from "@/app/actions/admin";
import RegistrationTable from "./RegistrationTable";

export default async function MembershipReviewPage() {
  const result = await fetchPendingRegistrations();
  const registrations = result.success ? result.data : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h1 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-green-800 rounded-full inline-block" />
        Senior Scouts
      </h1>

      <RegistrationTable registrations={registrations ?? []} />
    </div>
  );
}