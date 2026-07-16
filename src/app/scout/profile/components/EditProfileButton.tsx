//src/app/scout/profile/components/EditProfileButton.tsx

interface EditProfileButtonProps {
  onClick: () => void;
}

export default function EditProfileButton({
  onClick,
}: EditProfileButtonProps) {
  return (
    <div className="mx-4 mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-lg font-bold text-green-900">
        Account Management
      </h3>

      <p className="mb-6 text-sm text-gray-600">
        Update your personal information,
        password, and profile picture.
      </p>

      <button
        onClick={onClick}
        className="w-full rounded-xl bg-green-900 py-3 font-semibold text-white transition hover:bg-green-800"
      >
        Edit Profile
      </button>
    </div>
  );
}