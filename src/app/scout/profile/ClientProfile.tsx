//src/app/scout/profile/ProfileClient.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UserInfoCard from "./components/UserInfoCard";
import MembershipCta from "./components/MembershipCta";
import ProfileHeader from "./components/ProfileHeader";
import ProfileAvatar from "./components/ProfileAvatar";
import EditAvatarModal from "./components/EditAvatarModal";
import ProfileBottomNav from "./components/ProfileBottomNav";
import AccountInformationCard from "./components/AccountInformationCard";

interface ProfileClientProps {
  user: {
    firstName: string;
    middleName: string | null;
    lastName: string;
    suffix: string | null;
    email: string;
    birthdate: Date;
    gender: string;
  };
}

interface UserProfile {
  fullName: string;
  avatarUrl?: string | null;
}

export default function ProfileClient({
  user,
}: ProfileClientProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("./scout/profile");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // ✅ This belongs INSIDE the component
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const userProfile: UserProfile = {
    fullName: [
      user.firstName,
      user.middleName,
      user.lastName,
      user.suffix,
    ]
      .filter(Boolean)
      .join(" "),
    avatarUrl: avatarPreview,
  };

  const membershipStatus = false;

  const handleLogout = () => {
    alert("Logging out...");
    router.push("/login");
  };

  const handleImageChange = (file: File) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setAvatarPreview(imageUrl);
      setIsEditingAvatar(false);

      alert(
        "Profile image updated! (Preview only - not saved to server yet)"
      );
    };

    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
        <ProfileHeader onLogout={handleLogout} />

        <div className="flex-1 w-full pb-28 overflow-y-auto">
          <ProfileAvatar
            avatarUrl={userProfile.avatarUrl}
            onEditClick={() => setIsEditingAvatar(true)}
          />

          <UserInfoCard
            name={userProfile.fullName}
            status="Visitor"
          />

          <AccountInformationCard
            email={user.email}
            birthdate={user.birthdate}
            gender={user.gender}
            onEdit={() => setShowPasswordModal(true)}
          />

          <MembershipCta
            membershipStatus={membershipStatus}
          />
        </div>

        <ProfileBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {isEditingAvatar && (
          <EditAvatarModal
            currentAvatarUrl={userProfile.avatarUrl}
            onSave={handleImageChange}
            onClose={() => setIsEditingAvatar(false)}
          />
        )}

        {/* We'll replace this with the real modal next */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-80 rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-2 text-xl font-bold text-green-900">
                Verify Password
              </h2>

              <p className="mb-6 text-sm text-gray-600">
                Before you can edit your account information,
                please verify your current password.
              </p>

              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-full rounded-xl bg-green-900 py-3 font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
