//src/app/scout/profile/page.tsx

import { useState } from "react";
import PageLayout from "../../components/PageLayout";
import ProfileAvatar from "./components/ProfileAvatar";
import UserInfoCard from "./components/UserInfoCard";
import ContentBlock from "./components/ContentBlock";
import MembershipCta from "./components/MembershipCta";
import EditAvatarModal from "./components/EditAvatarModal";

export default async function ProfilePage() {
  const user = await getCurrentUser();

export default function ProfilePage() {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const userProfile: UserProfile = {
    fullName: "Juan",
    rank: "Senior Scout",
    avatarUrl: avatarPreview,
  };

  const membershipStatus = false;

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
    <PageLayout userName={userProfile.fullName} avatarUrl={userProfile.avatarUrl ?? undefined}>
      <div className="flex-1 w-full overflow-y-auto">
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

      {/* Edit Avatar Modal */}
      {isEditingAvatar && (
        <EditAvatarModal
          currentAvatarUrl={userProfile.avatarUrl}
          onSave={handleImageChange}
          onClose={() => setIsEditingAvatar(false)}
        />
      )}
    </PageLayout>
  );
}
