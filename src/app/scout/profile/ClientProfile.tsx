// src/app/scout/profile/ClientProfile.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import BottomNav from "../components/BottomNav";

import UserInfoCard from "./components/UserInfoCard";
import ProfileHeader from "./components/ProfileHeader";
import ProfileAvatar from "./components/ProfileAvatar";
import MembershipCta from "./components/MembershipCta";
import EditProfileModal from "./components/EditProfileModal";
import EditProfileButton from "./components/EditProfileButton";
import VerifyPasswordModal from "./components/VerifyPasswordModal";
import AccountInformationCard from "./components/AccountInformationCard";

import SuccessOverlay from "@/components-general/ui/SuccessOverlay";

type MembershipData = Awaited<
  ReturnType<
    typeof import("@/services/application.service").getMembershipCardData
  >
>;

interface ProfileClientProps {
  user: {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    suffix: string | null;
    email: string;
    birthdate: Date;
    gender: string;
    avatarUrl?: string | null;
  };
  membershipData: MembershipData;
}

export default function ProfileClient({
  user,
  membershipData,
}: ProfileClientProps) {
  const router = useRouter();

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [showEditProfileModal, setShowEditProfileModal] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [profile, setProfile] =
    useState(user);

  const membershipStatus =
    membershipData?.scout?.verificationStatus ===
    "active";

  const status = membershipData?.scout
    ? membershipStatus
      ? "Scout"
      : "Pending Verification"
    : "Visitor";

  const fullName = [
    profile.firstName,
    profile.middleName,
    profile.lastName,
    profile.suffix,
  ]
    .filter(Boolean)
    .join(" ");

  function handleLogout() {
    router.push("/login");
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-950">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">

          <ProfileHeader
            onLogout={handleLogout}
          />

          <div className="flex-1 pb-28">
            <div className="space-y-5 px-1 py-5">

              <ProfileAvatar
                avatarUrl={
                  profile.avatarUrl ?? null
                }
              />

              <UserInfoCard
                status={status}
                name={fullName}
              />

              <AccountInformationCard
                email={profile.email}
                birthdate={profile.birthdate}
                gender={profile.gender}
              />

              <MembershipCta
                membershipStatus={
                  membershipStatus
                }
                membershipData={
                  membershipData
                }
              />

              <EditProfileButton
                onClick={() =>
                  setShowPasswordModal(true)
                }
              />

            </div>
          </div>

          <BottomNav />

          {showPasswordModal && (
            <VerifyPasswordModal
              onClose={() =>
                setShowPasswordModal(false)
              }
              onSuccess={() => {
                setShowPasswordModal(false);
                setShowEditProfileModal(true);
              }}
            />
          )}

          {showEditProfileModal && (
            <EditProfileModal
              user={profile}
              onClose={() =>
                setShowEditProfileModal(false)
              }
              onSave={(
                updatedProfile
              ) => {
                setProfile({
                  ...profile,
                  ...updatedProfile,
                });

                setShowEditProfileModal(false);

                setShowSuccess(true);
              }}
            />
          )}

        </div>
      </main>

      <SuccessOverlay
        open={showSuccess}
        title="Profile Updated"
        subtitle="Your account information has been updated successfully."
      />
    </>
  );
}