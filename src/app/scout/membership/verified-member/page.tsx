// src/app/scout/membership/verified-member/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMembershipCardData } from "@/services/application.service";
import VerifiedMemberCard from "./VerifiedMemberCard";

export default async function VerifiedMemberPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const cardData = await getMembershipCardData();

  if (!cardData || !cardData.scout || cardData.scout.verificationStatus !== "active") {
    redirect("/scout/membership");
  }

  const { application, scout, registration, council } = cardData;

  let parsedRemarks: Record<string, any> = {};
  if (application?.remarks) {
    try {
      parsedRemarks = JSON.parse(application.remarks);
    } catch {
      // Ignore non-JSON remarks
    }
  }

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
      application?.scoutingPosition || parsedRemarks.scoutingPosition,
      scoutingPositionLabels
    ),
    council: council?.name ?? "N/A",
    idNumber: scout.membershipNumber ?? "N/A",
    validUntil: formatDate(registration?.endDate),
    validUntilRaw: registration?.endDate
      ? new Date(registration.endDate).toISOString()
      : null,
    status: scout.verificationStatus === "active" ? "VALID" : "PENDING",
    dob: formatDate(user.birthdate),
    sex: user.sex ?? "N/A",
    bloodType:
      scout.bloodType ||
      application?.bloodType ||
      parsedRemarks.bloodType ||
      "N/A",
    sponsoringInst: formatLabel(
      application?.sponsoringInstitution || parsedRemarks.sponsoringInstitution,
      sponsoringInstitutionLabels
    ),
    address:
      scout.address ||
      application?.address ||
      parsedRemarks.address ||
      "N/A",
    telephone:
      scout.telephoneNumber ||
      application?.telephoneNumber ||
      parsedRemarks.telephoneNumber ||
      parsedRemarks.telephone ||
      "N/A",
    email: user.email,
    emergencyContact:
      scout.emergencyContactName ||
      application?.emergencyContactName ||
      parsedRemarks.emergencyContactName ||
      "N/A",
    emergencyRelationship:
      scout.emergencyContactRelationship ||
      application?.emergencyContactRelationship ||
      parsedRemarks.emergencyContactRelationship ||
      "N/A",
    emergencyContactNum:
      scout.emergencyContactNumber ||
      application?.emergencyContactNumber ||
      parsedRemarks.emergencyContactNumber ||
      "N/A",
  };

  return (
    <VerifiedMemberCard
      userName={user.firstName}
      avatarUrl={user.avatarUrl ?? undefined}
      userData={userData}
    />
  );
}