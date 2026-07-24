import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMembershipCardData } from "@/services/application.service";
import VerifiedMemberCard from "./VerifiedMemberCard";

export default async function VerifiedMemberPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // FIX 1: getMembershipCardData takes 0 arguments (it uses session internally)
  const cardData = await getMembershipCardData();

  // FIX 2: Check cardData and cardData.scout nullability
  if (!cardData || !cardData.scout || cardData.scout.verificationStatus !== "active") {
    redirect("/scout/membership");
  }

  // FIX 3: Removed non-existent `personalInfo` from destructure
  const { application, scout, registration, council } = cardData;

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
      application?.scoutingPosition,
      scoutingPositionLabels
    ),
    council: council?.name ?? "N/A",
    idNumber: scout.membershipNumber ?? "N/A",
    validUntil: formatDate(registration?.endDate),
    status: scout.verificationStatus === "active" ? "VALID" : "PENDING",
    dob: formatDate(user.birthdate),
    sex: user.sex ?? "N/A",
    // FIX 4: Access emergency & personal data from scout/application directly
    bloodType: scout.bloodType || application?.bloodType || "N/A",
    sponsoringInst: formatLabel(
      application?.sponsoringInstitution,
      sponsoringInstitutionLabels
    ),
    address: scout.address || application?.address || "N/A",
    telephone: scout.telephoneNumber || application?.telephoneNumber || "N/A",
    email: user.email,
    emergencyContact: scout.emergencyContactName || application?.emergencyContactName || "N/A",
    emergencyRelationship: scout.emergencyContactRelationship || application?.emergencyContactRelationship || "N/A",
    emergencyContactNum: scout.emergencyContactNumber || application?.emergencyContactNumber || "N/A",
  };

  return (
    <VerifiedMemberCard
      userName={user.firstName}
      avatarUrl={user.avatarUrl ?? undefined}
      userData={userData}
    />
  );
}