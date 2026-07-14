//src/app/scout/profile/components/ProfileHeader.tsx

import { useRouter } from "next/navigation";
import Image from "next/image";

interface ProfileHeaderProps {
  onLogout: () => void;
}

export default function ProfileHeader({ onLogout }: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-md px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-green-900">
              <Image
                src="/escout-logo.svg"
                alt="Verification pending"
                width={115}
                height={115}
                className="inline-block"
              />
          </h1>
          <button
            onClick={onLogout}
            className="text-sm font-bold text-red-600 hover:text-red-700 transition"
          >
            Logout
          </button>
        </div>
        <h2 className="text-lg font-bold text-green-900">Profile</h2>
      </div>
    </header>
  );
}
