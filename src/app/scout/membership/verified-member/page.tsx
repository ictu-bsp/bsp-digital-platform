//src/app/scout/membership/verified-member/page.tsx

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMembershipCardData } from "@/services/application.service";
import VerifiedMemberCard from "./VerifiedMemberCard";

export default async function VerifiedMemberPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const cardData = await getMembershipCardData(user.id);

  // Not approved/verified yet — this page isn't reachable directly.
  if (!cardData || cardData.scout.verificationStatus !== "active") {
    redirect("/scout/membership");
  }

  const { application, scout, registration, council, personalInfo } = cardData;

  const formatDate = (value: Date | string | null | undefined) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const userData = {
    firstName: user.firstName,
    middleInitial: user.middleName ? `${user.middleName.charAt(0)}.` : "",
    lastName: user.lastName,
    designation:
      application?.scoutingPosition ?? personalInfo.scoutingPosition ?? "—",
    council: council?.name ?? "—",
    idNumber: scout.membershipNumber ?? "—",
    validUntil: formatDate(registration?.endDate),
    status: scout.verificationStatus === "active" ? "VALID" : "PENDING",
    dob: formatDate(user.birthdate),
    sex: user.gender ?? "—",
    bloodType: personalInfo.bloodType ?? "—",
    sponsoringInst: application?.sponsoringInstitution ?? "—",
    address: personalInfo.address ?? "—",
    telephone: personalInfo.telephone ?? "—",
    email: user.email,
    emergencyContact: personalInfo.emergencyContactName ?? "—",
    emergencyRelationship: personalInfo.emergencyContactRelationship ?? "—",
    emergencyContactNum: personalInfo.emergencyContactNumber ?? "—",
  };

  return (
    <VerifiedMemberCard
      userName={user.firstName}
      avatarUrl={user.avatarUrl ?? undefined}
      userData={userData}
    />
  );
}