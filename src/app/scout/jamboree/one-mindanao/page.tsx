// src/app/scout/jamboree/one-mindanao/page.tsx

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMembershipCardData } from "@/services/application.service";
import OneMindanaoClient from "./components/OneMindanaoClient";
import type { memberData } from "./components/MeritBadgeCertificateModal";

export default async function OneMindanaoJamboreePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const membershipData = await getMembershipCardData();

  const formattedMember: memberData = {
    firstName: user.firstName ?? "",
    middleInitial: user.middleName ? `${user.middleName.charAt(0)}.` : "",
    lastName: user.lastName ?? "",
    council: membershipData?.council?.name ?? "National Council",
    idNumber: membershipData?.scout?.membershipNumber ?? "PENDING",
    suffix: user.suffix ?? null,
  };

  return <OneMindanaoClient member={formattedMember} />;
}