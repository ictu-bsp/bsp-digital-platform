//src/app/scout/profile/components/MembershipCta.tsx

import Link from "next/link";
import { getMembershipCardData } from "@/services/application.service";

type MembershipData = Awaited<ReturnType<typeof getMembershipCardData>>;

interface MembershipCtaProps {
  membershipStatus: boolean;
  membershipData: MembershipData;
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MembershipCta({
  membershipStatus,
  membershipData,
}: MembershipCtaProps) {
  if (membershipStatus && membershipData) {
    const { scout, registration, council } = membershipData;

    return (
      <div className="mx-4 mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-green-900">
            Membership
          </h3>

          <span className="rounded-full bg-green-800 px-3 py-1 text-xs font-semibold text-white">
            ACTIVE
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Membership Number</p>
            <p className="font-semibold text-gray-900">
              {scout?.membershipNumber ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Council</p>
            <p className="font-semibold text-gray-900">
              {council?.name ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Valid Until</p>
            <p className="font-semibold text-gray-900">
              {formatDate(registration?.endDate)}
            </p>
          </div>
        </div>

        <Link
          href="/scout/membership/verified-member"
          className="mt-5 block w-full rounded-xl bg-green-900 py-3 text-center font-semibold text-white transition hover:bg-green-800"
        >
          View Membership Card
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-bold text-green-900">
        Membership Status
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        Complete your registration to access all features.
      </p>

      <Link
        href="/scout/membership"
        className="block w-full rounded-xl bg-green-900 py-3 text-center font-semibold text-white transition hover:bg-green-800"
      >
        Apply for Scout Membership
      </Link>
    </div>
  );
}