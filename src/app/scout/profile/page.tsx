//src/app/scout/profile/page.tsx

import { redirect } from "next/navigation";
import ProfileClient from "./ClientProfile";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMembershipCardData } from "@/services/application.service";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const membershipData = await getMembershipCardData(user.id);

  return (
    <ProfileClient
      user={user}
      membershipData={membershipData}
    />
  );
}