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

  // Maps raw enum values (as stored via the register step's <select> options)
  // to human-readable labels for display on the card. Falls back to a
  // generic "replace underscores + capitalize" for anything unmapped,
  // so a future enum value doesn't silently render as "â€”".
  const scoutingPositionLabels: Record<string, string> = {
    kid_scout: "Kid Scout",
    kab_scout: "Kab Scout",
    boy_scout: "Boy Scout",
    senior_scout: "Senior Scout",
    rover: "Rover",
  };

  const sponsoringInstitutionLabels: Record<string, string> = {
    school: "School",
    church: "Church",
    community_org: "Community Organization",
    community_based: "Community-Based",
  };

  const humanize = (value: string) =>
    value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const formatLabel = (
    value: string | null | undefined,
    map: Record<string, string>
  ) => {
    if (!value) return "N/A";
    return map[value] ?? humanize(value);
  };


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
    designation: formatLabel(
      application?.scoutingPosition ?? personalInfo.scoutingPosition,
      scoutingPositionLabels
    ),
    council: council?.name ?? "N/A",
    idNumber: scout.membershipNumber ?? "N/A",
    validUntil: formatDate(registration?.endDate),
    status: scout.verificationStatus === "active" ? "VALID" : "PENDING",
    dob: formatDate(user.birthdate),
    sex: user.gender ?? "N/A",
    bloodType: personalInfo.bloodType ?? "N/A",
    sponsoringInst: formatLabel(
      application?.sponsoringInstitution,
      sponsoringInstitutionLabels
    ),
    address: personalInfo.address ?? "N/A",
    telephone: personalInfo.telephone ?? "N/A",
    email: user.email,
    emergencyContact: personalInfo.emergencyContactName ?? "N/A",
    emergencyRelationship: personalInfo.emergencyContactRelationship ?? "N/A",
    emergencyContactNum: personalInfo.emergencyContactNumber ?? "N/A",
  };

  return (
    <VerifiedMemberCard
      userName={user.firstName}
      avatarUrl={user.avatarUrl ?? undefined}
      userData={userData}
    />
  );
}