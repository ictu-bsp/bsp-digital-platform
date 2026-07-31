"use client";
// src/app/scout/membership/membership-registration/layout.tsx
// Wraps every step of the membership registration wizard so that
// WizardContext (personal-info fields) survives client-side navigation
// between steps, e.g. /personal-info -> /register.
//
// Also clears stale wizard localStorage data (Register step fields +
// payment keys) on a hard reload or a fresh entry from outside the
// wizard — but NOT on Back/Forward navigation, and NOT when the user is
// landing here via an external payment redirect (PayMongo/GCash/GrabPay/
// Maya/ShopeePay sending them back to /success or a /return page). That
// kind of landing looks identical to a "fresh entry" to the Navigation
// Timing API, but it's a legitimate continuation of an in-progress
// payment — clearing paymentAmount etc. at that point wipes data the
// landing page still needs to read. This runs synchronously during
// render (via a useState lazy initializer), NOT inside a useEffect —
// React renders parent components fully before their children, so this
// is guaranteed to run before any child page's own hydrate effect,
// closing the ordering gap that let stale data get read before it was
// cleared.
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

// Pages the user can legitimately land on via an external redirect
// (PayMongo/GCash/GrabPay/Maya/ShopeePay sending them back into the app)
// rather than a genuine fresh entry into the wizard. Stale-data clearing
// must be skipped on these, or payment session data (amount, etc.) gets
// wiped out from under the page that still needs to read it.
const PAYMENT_REDIRECT_PATH_PREFIXES = [
  "/scout/membership/membership-registration/success",
  "/scout/membership/membership-registration/method/ewallet/return",
  "/scout/membership/membership-registration/method/maya/return",
  "/scout/membership/membership-registration/method/shopeepay/return",
];

export default function MembershipRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // useState's lazy initializer runs exactly once, synchronously, during
  // this component's first render — before children render, and long
  // before any useEffect anywhere in the tree fires.
  useState(() => {
    if (typeof window === "undefined") return null;

    const isPaymentRedirectLanding = PAYMENT_REDIRECT_PATH_PREFIXES.some((prefix) =>
      window.location.pathname.startsWith(prefix)
    );

    if (getNavigationType() !== "back_forward" && !isPaymentRedirectLanding) {
      STALE_WIZARD_KEYS.forEach((key) => localStorage.removeItem(key));
    }
    return null;
  });

  return <WizardProvider>{children}</WizardProvider>;
}