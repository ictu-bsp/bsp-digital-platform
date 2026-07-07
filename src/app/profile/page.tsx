"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileAvatar from "@/components/Profile/ProfileAvatar";
import UserInfoCard from "@/components/Profile/UserInfoCard";
import ContentBlock from "@/components/Profile/ContentBlock";
import MembershipCta from "@/components/Profile/MembershipCta";
import ProfileBottomNav from "@/components/Profile/ProfileBottomNav";

interface UserProfile {
  fullName: string;
  rank: string;
  avatarUrl?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  const userProfile: UserProfile = {
    fullName: "Juan Dela Cruz",
    rank: "Senior Scout",
    avatarUrl: null,
  };

  const membershipStatus = false;

  const handleLogout = () => {
    alert("Logging out...");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
        <ProfileHeader onLogout={handleLogout} />

        <div className="flex-1 w-full pb-28 overflow-y-auto">
          {/* Profile Avatar */}
          <ProfileAvatar
            avatarUrl={userProfile.avatarUrl}
            onEditClick={() => setIsEditingAvatar(!isEditingAvatar)}
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
      </div>
    </main>
  );
}
