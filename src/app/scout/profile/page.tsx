//src/app/scout/profile/page.tsx

import { redirect } from "next/navigation";
import ProfileClient from "./ClientProfile";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return <ProfileClient user={user} />;
}