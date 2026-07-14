//src/app/scout/profile/components/AccountInformationCard.tsx

interface AccountInformationCardProps {
  email: string;
  birthdate: Date | string;
  gender: string;
}

export default function AccountInformationCard({
  email,
  birthdate,
  gender,
}: AccountInformationCardProps) {
  const formattedBirthdate = new Date(
    birthdate
  ).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-4 mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-bold text-green-900">
        Account Information
      </h3>

      <div className="space-y-5">
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
      </div>
    </div>
  );
}