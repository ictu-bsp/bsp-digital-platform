"use client";
// src/app/scout/membership/membership-registration/layout.tsx
// Wraps every step of the membership registration wizard so that
// WizardContext (personal-info fields) survives client-side navigation
// between steps, e.g. /personal-info -> /register.
//
// Also clears stale wizard localStorage data (Register step fields +
// payment keys) on a hard reload or a fresh entry from outside the
// wizard — but NOT on Back/Forward navigation. This runs synchronously
// during render (via a useState lazy initializer), NOT inside a
// useEffect — React renders parent components fully before their
// children, so this is guaranteed to run before any child page's own
// hydrate effect, closing the ordering gap that let stale data get read
// before it was cleared.
import { useState } from "react";
import { WizardProvider } from "./WizardContext";

const STALE_WIZARD_KEYS = [
  "personalBloodType",
  "personalAddress",
  "personalTelephone",
  "personalEmergencyContactName",
  "personalEmergencyContactRelationship",
  "personalEmergencyContactNumber",
  "registerScoutingPosition",
  "registerAdvancementRank",
  "registerTenure",
  "registerRegionId",
  "registerCouncilId",
  "registerIsCommunityBased",
  "registerSponsoringInstitution",
  "registerMembershipType",
  "registerMembershipValidity",
  "registrationId",
  "paymentAmount",
  "paymentDescription",
  "paymentYears",
  "paymentCouncil",
  "paymentCouncilId",
  "paymentIsCommunityBased",
  "paymentSponsoringInstitution",
];

// Detects whether the current page load was Back/Forward navigation, vs.
// a hard reload or a fresh visit.
const getNavigationType = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  const entries = window.performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return entries[0]?.type;
};

export default function MembershipRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // useState's lazy initializer runs exactly once, synchronously, during
  // this component's first render — before children render, and long
  // before any useEffect anywhere in the tree fires.
  useState(() => {
    if (typeof window !== "undefined" && getNavigationType() !== "back_forward") {
      STALE_WIZARD_KEYS.forEach((key) => localStorage.removeItem(key));
    }
    return null;
  });

  return <WizardProvider>{children}</WizardProvider>;
}