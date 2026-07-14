//src/app/scout/profile/components/ProfileAvatar.tsx

"use client";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
}

export default function ProfileAvatar({
  avatarUrl,
}: ProfileAvatarProps) {
  return (
    <div className="flex justify-center py-6">
      <div className="group">
        <div className="h-32 w-32 rounded-full bg-green-900 flex items-center justify-center shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg">
          {avatarUrl ? (
            <img
              src={`/${avatarUrl}`}
              alt="User Avatar"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <svg
              className="h-16 w-16 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}