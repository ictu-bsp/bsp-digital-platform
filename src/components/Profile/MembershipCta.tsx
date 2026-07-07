import ContentBlock from "./ContentBlock";

interface MembershipCtaProps {
  membershipStatus: boolean;
}

export default function MembershipCta({ membershipStatus }: MembershipCtaProps) {
  if (membershipStatus) {
    return (
      <ContentBlock>
        <div className="text-center py-4">
          <p className="text-sm font-semibold text-green-900">You are an active member!</p>
        </div>
      </ContentBlock>
    );
  }

  return (
    <ContentBlock>
      <button className="w-full rounded-full bg-green-900 py-3 text-white font-bold hover:bg-green-800 transition">
        Apply Membership
      </button>
      <p className="text-center mt-3 text-sm text-gray-700">
        Already a member?{" "}
        <a href="#" className="text-green-700 font-semibold underline hover:text-green-800">
          Click Here
        </a>
      </p>
    </ContentBlock>
  );
}
