interface UserInfoCardProps {
  name: string;
  status: string;
}

export default function UserInfoCard({
  name,
  status,
}: UserInfoCardProps) {
  return (
    <div className="mx-4 mb-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-green-900 mb-2">
        {name}
      </h2>

      <p className="text-base font-semibold text-green-800">
        {status}
      </p>
    </div>
  );
}