"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProfileHeader from "./components/ProfileHeader";
import ProfileAvatar from "./components/ProfileAvatar";
import UserInfoCard from "./components/UserInfoCard";
import ContentBlock from "./components/ContentBlock";
import MembershipCta from "./components/MembershipCta";
import ProfileBottomNav from "./components/ProfileBottomNav";
import EditAvatarModal from "./components/EditAvatarModal";

interface UserProfile {
  fullName: string;
  rank: string;
  avatarUrl?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("./scout/profile");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const userProfile: UserProfile = {
    fullName: "Juan Dela Cruz",
    rank: "Senior Scout",
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
      alert("Profile image updated! (Preview only - not saved to server yet)");
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
        <ProfileHeader onLogout={handleLogout} />

        <div className="flex-1 w-full pb-28 overflow-y-auto">
          {/* Profile Avatar */}
          <ProfileAvatar
            avatarUrl={userProfile.avatarUrl}
            onEditClick={() => setIsEditingAvatar(true)}
          />

          {/* User Info Card */}
          <UserInfoCard name={userProfile.fullName} rank={userProfile.rank} />

          {/* Content Block 1 */}
          <ContentBlock className="h-24" />

          {/* Content Block 2 */}
          <ContentBlock className="h-24" />

          {/* Membership CTA */}
          <MembershipCta membershipStatus={membershipStatus} />

          {/* Content Block 3 */}
          <ContentBlock className="h-24" />

          {/* Content Block 4 */}
          <ContentBlock className="h-24 mb-6" />

          {/* Content Block 5 */}
          <ContentBlock className="h-24 mb-6" />

          {/* Content Block 6 */}
          <ContentBlock className="h-24 mb-6" />
        </div>

        {/* Bottom Navigation */}
        <ProfileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Edit Avatar Modal */}
        {isEditingAvatar && (
          <EditAvatarModal
            currentAvatarUrl={userProfile.avatarUrl}
            onSave={handleImageChange}
            onClose={() => setIsEditingAvatar(false)}
          />
        )}
      </div>
    </main>
  );
}
