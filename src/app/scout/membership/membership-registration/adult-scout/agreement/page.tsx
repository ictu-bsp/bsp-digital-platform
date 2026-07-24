// src/app/scout/membership/membership-registration/adult-scout/agreement/page.tsx

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdult } from "@/lib/utils/age";
import AdultScoutAgreementForm from "./AdultScoutAgreementForm";

// Adult Scout registration is only open to users 18 and older. This guards
// the route itself (not just the entry button on the membership page) so it
// can't be reached by navigating to the URL directly.
export default async function AdultScoutAgreementPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdult(user.birthdate)) {
    redirect("/scout/membership");
  }

  return <AdultScoutAgreementForm />;
}
