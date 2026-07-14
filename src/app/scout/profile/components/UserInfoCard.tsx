//src/app/scout/profile/components/UserInfoCard.tsx

interface UserInfoCardProps {
  name: string;
  status: string;
}

export default function UserInfoCard({
  name,
  status,
}: UserInfoCardProps) {
  return (
    <div className="mx-4 mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center">
      <p className="mb-2 text-base font-semibold text-amber-600">
        {status}
      </p>

      <h2 className="text-2xl font-bold text-green-900">
        {name}
      </h2>
    </div>
  );
}