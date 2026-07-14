//src/app/scout/profile/components/MembershipCta.tsx

interface MembershipCtaProps {
  membershipStatus: boolean;
}

export default function MembershipCta({
  membershipStatus,
}: MembershipCtaProps) {
  if (membershipStatus) {
    return (
      <div className="mx-4 mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-green-900">
          Membership
        </h3>

        <p className="font-semibold text-green-700">
          Your Scout membership is active.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-bold text-green-900">
        Membership
      </h3>

      <button className="w-full rounded-xl bg-green-900 py-3 font-semibold text-white transition hover:bg-green-800">
        <a href = "/scout/membership/membership-registration/agreement" className="text-white no-underline">
          Apply Membership
        </a>
      </button>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already a member?{" "}
        <a
          href="/scout/membership/membership-verification"
          className="font-semibold text-green-700 hover:text-green-900"
        >
          Verify Membership
        </a>
      </p>
    </div>
  );
}