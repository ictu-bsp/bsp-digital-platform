// src/app/scout/membership/membership-registration/layout.tsx
// Wraps every step of the membership registration wizard so that
// WizardContext (personal-info fields) survives client-side navigation
// between steps, e.g. /personal-info -> /register.

import { WizardProvider } from "./WizardContext";

export default function MembershipRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WizardProvider>{children}</WizardProvider>;
}