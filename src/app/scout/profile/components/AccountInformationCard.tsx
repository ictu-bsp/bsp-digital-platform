// src/app/scout/profile/components/AccountInformationCard.tsx

interface AccountInformationCardProps {
  email: string;
  birthdate: Date | string;
  sex: string;
  isVerifiedScout: boolean;
  bloodType?: string;
  address?: string;
  telephoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactNumber?: string;
}

export default function AccountInformationCard({
  email,
  birthdate,
  sex,
  isVerifiedScout,
  bloodType,
  address,
  telephoneNumber,
  emergencyContactName,
  emergencyContactRelationship,
  emergencyContactNumber,
}: AccountInformationCardProps) {
  const formattedBirthdate = new Date(birthdate).toLocaleDateString(
    "en-PH",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="mx-4 mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-bold text-green-900">
        Account Information
      </h3>

      <div className="space-y-5">
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-semibold text-gray-900">{email}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Birthdate</p>
          <p className="font-semibold text-gray-900">
            {formattedBirthdate}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Sex</p>
          <p className="font-semibold text-gray-900">{sex}</p>
        </div>

        {/* ALLOW ONLY VERIFIED SCOUTS TO SEE CONTACT INFO & EMERGENCY CONTACT INFO */}
        {isVerifiedScout && (
          <>
            <div>
              <p className="text-sm text-gray-500">Blood Type</p>
              <p className="font-semibold text-gray-900">
                {bloodType || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-semibold text-gray-900">
                {address || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Telephone Number
              </p>
              <p className="font-semibold text-gray-900">
                {telephoneNumber || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Emergency Contact Name
              </p>
              <p className="font-semibold text-gray-900">
                {emergencyContactName || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Relationship
              </p>
              <p className="font-semibold text-gray-900">
                {emergencyContactRelationship || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Emergency Contact Number
              </p>
              <p className="font-semibold text-gray-900">
                {emergencyContactNumber || "-"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}