//src/app/scout/profile/components/AccountInformationCard.tsx

interface AccountInformationCardProps {
  email: string;
  birthdate: Date | string;
  gender: string;
  onEdit: () => void;
}

export default function AccountInformationCard({
  email,
  birthdate,
  gender,
  onEdit,
}: AccountInformationCardProps) {
  const formattedBirthdate = new Date(
    birthdate
  ).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-4 mb-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-green-900 mb-5">
        Account Information
      </h3>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">
            Email
          </p>
          <p className="font-semibold text-gray-900">
            {email}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Birthdate
          </p>
          <p className="font-semibold text-gray-900">
            {formattedBirthdate}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Gender
          </p>
          <p className="font-semibold text-gray-900">
            {gender}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Account Type
          </p>
          <p className="font-semibold text-amber-600">
            Visitor
          </p>
        </div>
        
        <div className="mt-6">
            <button
              onClick={onEdit}
              className="w-full rounded-xl bg-green-900 py-3 font-semibold text-white hover:bg-green-800 transition"
            >
              Edit Profile
            </button>
        </div>
      </div>
    </div>
  );
}