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
  ReturnType<typeof import("@/services/application.service").getMembershipCardData>
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

  const [profile, setProfile] = useState({
    ...user,
    bloodType: membershipData?.scout?.bloodType ?? "",
    address: membershipData?.scout?.address ?? "",
    telephoneNumber: membershipData?.scout?.telephoneNumber ?? "",
    emergencyContactName:
      membershipData?.scout?.emergencyContactName ?? "",
    emergencyContactRelationship:
      membershipData?.scout?.emergencyContactRelationship ?? "",
    emergencyContactNumber:
      membershipData?.scout?.emergencyContactNumber ?? "",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<any>(null);

  const isVerifiedScout =
    membershipData?.scout?.verificationStatus === "active";

  const isScout = !!membershipData?.scout;

  const status = isScout
    ? isVerifiedScout
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

  function handleEditSuccess(updatedProfile: any) {
    setPendingProfile(updatedProfile);
    setShowEditProfileModal(false);
    setShowConfirmSave(true);
  }

  function confirmSave() {
    if (!pendingProfile) return;

    setProfile(prev => ({
      ...prev,
      ...pendingProfile,
    }));

    setPendingProfile(null);
    setShowConfirmSave(false);
    setShowSuccess(true);
  }

  function cancelSave() {
    setPendingProfile(null);
    setShowConfirmSave(false);
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-950">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          <ProfileHeader onLogout={handleLogout} />

          <div className="flex-1 pb-28">
            <div className="space-y-5 px-1 py-5">
                            <ProfileAvatar
                avatarUrl={profile.avatarUrl ?? null}
              />

              <UserInfoCard
                status={status}
                name={fullName}
              />

              <AccountInformationCard
                email={profile.email}
                birthdate={profile.birthdate}
                gender={profile.gender}
                isVerifiedScout={isVerifiedScout}
                bloodType={membershipData?.scout?.bloodType ?? ""}
                address={membershipData?.scout?.address ?? ""}
                telephoneNumber={membershipData?.scout?.telephoneNumber ?? ""}
                emergencyContactName={membershipData?.scout?.emergencyContactName ?? ""}
                emergencyContactRelationship={membershipData?.scout?.emergencyContactRelationship ?? ""}
                emergencyContactNumber={membershipData?.scout?.emergencyContactNumber ?? ""}
              />

              <MembershipCta
                membershipStatus={isVerifiedScout}
                membershipData={membershipData}
              />

              <EditProfileButton
                onClick={() => setShowPasswordModal(true)}
              />
            </div>
          </div>

          <BottomNav />

          {showPasswordModal && (
            <VerifyPasswordModal
              onClose={() => setShowPasswordModal(false)}
              onSuccess={() => {
                setShowPasswordModal(false);
                setShowEditProfileModal(true);
              }}
            />
          )}

          {showEditProfileModal && (
            <EditProfileModal
              user={profile}
              membershipData={membershipData}
              onClose={() => setShowEditProfileModal(false)}
              onSave={handleEditSuccess}
            />
          )}

          {showConfirmSave && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="text-xl font-bold text-green-900">
                  Save Profile Changes?
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Are you sure you want to apply these changes to your profile?
                  This will immediately update your account information.
                </p>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={cancelSave}
                    className="flex-1 rounded-xl border py-3 font-semibold hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={confirmSave}
                    className="flex-1 rounded-xl bg-green-900 py-3 font-semibold text-white hover:bg-green-800"
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            </div>
          )}
                  </div>
      </main>

      <SuccessOverlay
        open={showSuccess}
        title="Profile Updated"
        subtitle="Your account information has been updated successfully."
        onComplete={() => {setShowSuccess(false);}}
      />
    </>
  );
}