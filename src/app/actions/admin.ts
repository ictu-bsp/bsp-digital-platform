// src/app/actions/admin.ts
"use server";

import { revalidatePath } from "next/cache";
import {
  getDashboardStats,
  getAllScouts,
  getScoutById,
  getCouncilScouts,
  getAdministrators,
  getAdministratorById,
  getPendingRegistrations,
  getApplicationsAwaitingPayment,
  cancelAbandonedApplication,
  approveMembershipReview,
  rejectRegistration,
  getRegistrationsAwaitingFinance,
  verifyAndActivateRegistration,
  getRegistrationStatusBreakdown,
  getPaymentTotals,
  getCouncilRegionBreakdown,
  getScoutRankBreakdown,
  getActivityParticipationStats,
  getSexBreakdown,
  updateRegistrationPaymentStatus,
} from "@/services/admin.service";

// Fetches high-level metrics for the admin dashboard overview
export async function fetchDashboardStats() {
  try {
    const data = await getDashboardStats();
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load dashboard statistics." };
  }
}

// Retrieves a comprehensive list of all registered scouts in the system
export async function fetchAllScouts() {
  try {
    const data = await getAllScouts();
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load scouts." };
  }
}

// Fetches detailed profile information for a single scout by unique ID
export async function fetchScoutById(id: string) {
  try {
    const data = await getScoutById(id);
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load scout." };
  }
}

// Retrieves all scouts belonging to a specific council ID
export async function fetchCouncilScouts(councilId: string) {
  try {
    const data = await getCouncilScouts(councilId);
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load council scouts." };
  }
}

// Fetches a list of all administrator accounts across the system
export async function fetchAdministrators() {
  try {
    const data = await getAdministrators();
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load administrators." };
  }
}

// Retrieves details for a specific administrator by unique ID
export async function fetchAdministratorById(id: string) {
  try {
    const data = await getAdministratorById(id);
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load administrator." };
  }
}

// Retrieves registrations currently waiting for membership review approval
export async function fetchPendingRegistrations() {
  try {
    const data = await getPendingRegistrations();
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load pending registrations." };
  }
}

// Retrieves applications submitted but not yet linked to a registration
// (i.e. the scout has not reached the payment step yet). Read-only.
export async function fetchApplicationsAwaitingPayment() {
  try {
    const data = await getApplicationsAwaitingPayment();
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load applications awaiting payment." };
  }
}

// Approves a pending membership registration review
export async function approveRegistrationAction(registrationId: string) {
  try {
    await approveMembershipReview(registrationId);
    revalidatePath("/admin/finance");
    revalidatePath("/admin/registrations");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to approve registration." };
  }
}

// Rejects a pending membership registration and attaches feedback details
export async function rejectRegistrationAction(registrationId: string, feedback: string) {
  try {
    await rejectRegistration(registrationId, feedback);
    revalidatePath("/admin/finance");
    revalidatePath("/admin/registrations");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to reject registration." };
  }
}

// Retrieves registrations that have passed membership review and await finance verification
export async function fetchRegistrationsAwaitingFinance() {
  try {
    const data = await getRegistrationsAwaitingFinance();
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load registrations awaiting finance verification." };
  }
}

// Verifies payment and activates the user registration status
export async function verifyAndActivateRegistrationAction(registrationId: string) {
  try {
    await verifyAndActivateRegistration(registrationId);
    revalidatePath("/admin/finance");
    revalidatePath("/admin/scouts");
    return { success: true };
  } catch (error: any) {
    console.error("verifyAndActivateRegistrationAction error:", error);
    return { success: false, error: error?.message || "Failed to verify and activate registration." };
  }
}

// Manually overrides and updates payment status (e.g. marking as "paid")
export async function updatePaymentStatusAction(registrationId: string, status: string) {
  try {
    await updateRegistrationPaymentStatus(registrationId, status);
    revalidatePath("/admin/finance");
    return { success: true };
  } catch (error: any) {
    console.error("updatePaymentStatusAction error:", error);
    return { success: false, error: error?.message || "Failed to update payment status." };
  }
}

// Direct live gateway check with PayMongo API (Supports PI, CS, Pay, Link, and Source IDs)
export async function syncPaymentStatusAction(registrationId: string, paymentIntentId: string) {
  try {
    const apiKey = process.env.PAYMONGO_SECRET;
    if (!apiKey) {
      return { success: false, error: "Payment gateway secret key (PAYMONGO_SECRET) is missing." };
    }

    if (!paymentIntentId || paymentIntentId.trim() === "" || paymentIntentId === "—") {
      return { success: false, error: "No Payment ID or Checkout Session ID found for this record." };
    }

    const authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
    const id = paymentIntentId.trim();

    // Determine correct PayMongo API endpoint based on ID prefix
    let endpoint = `https://api.paymongo.com/v1/payment_intents/${id}`;
    if (id.startsWith("cs_")) {
      endpoint = `https://api.paymongo.com/v1/checkout_sessions/${id}`;
    } else if (id.startsWith("pay_")) {
      endpoint = `https://api.paymongo.com/v1/payments/${id}`;
    } else if (id.startsWith("link_")) {
      endpoint = `https://api.paymongo.com/v1/links/${id}`;
    } else if (id.startsWith("src_")) {
      endpoint = `https://api.paymongo.com/v1/sources/${id}`;
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: authHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const detail = errBody?.errors?.[0]?.detail ?? `HTTP ${response.status} ${response.statusText}`;
      return { success: false, error: `PayMongo API Error: ${detail}` };
    }

    const body = await response.json();
    const attributes = body?.data?.attributes;

    // Check payment status across different PayMongo object structures
    let isPaid = false;
    let currentStatus = attributes?.status;

    if (id.startsWith("cs_")) {
      const paymentStatus = attributes?.payment_intent?.attributes?.status || attributes?.payments?.[0]?.attributes?.status;
      if (attributes?.status === "active" && paymentStatus === "succeeded") {
        isPaid = true;
      } else if (paymentStatus) {
        currentStatus = paymentStatus;
      }
    } else if (id.startsWith("src_")) {
      if (attributes?.status === "chargeable" || attributes?.status === "paid") {
        isPaid = true;
      }
    } else if (id.startsWith("pay_")) {
      if (attributes?.status === "paid") {
        isPaid = true;
      }
    } else {
      if (attributes?.status === "succeeded" || attributes?.status === "paid") {
        isPaid = true;
      }
    }

    if (isPaid) {
      await updateRegistrationPaymentStatus(registrationId, "paid");
      revalidatePath("/admin/finance");
      return { success: true, paymentStatus: "paid" };
    }

    return {
      success: false,
      error: `Gateway status is currently '${currentStatus ?? "unpaid"}'. Payment is not confirmed.`,
    };
  } catch (error: any) {
    console.error("syncPaymentStatusAction error:", error);
    return { success: false, error: error?.message || "An unexpected error occurred while re-checking payment status." };
  }
}

// Fetches analytical breakdown of registrations grouped by current status
export async function fetchRegistrationStatusBreakdown() {
  try {
    const data = await getRegistrationStatusBreakdown();
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load registration status breakdown." };
  }
}

// Calculates and returns aggregate payment totals across all transactions
export async function fetchPaymentTotals() {
  try {
    const data = await getPaymentTotals();
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load payment totals." };
  }
}

// Fetches distribution statistics across different councils and geographical regions
export async function fetchCouncilRegionBreakdown() {
  try {
    const data = await getCouncilRegionBreakdown();
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load council/region breakdown." };
  }
}

// Fetches distribution statistics of scouts categorized by rank
export async function fetchScoutRankBreakdown() {
  try {
    const data = await getScoutRankBreakdown();
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load scout rank breakdown." };
  }
}

// Retrieves engagement and participation statistics for events and activities
export async function fetchActivityParticipationStats() {
  try {
    const data = await getActivityParticipationStats();
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load activity participation stats." };
  }
}

// Fetches demographic breakdown by sex for reporting purposes
export async function fetchSexBreakdown() {
  try {
    const data = await getSexBreakdown();
    return { success: true, data };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to load sex breakdown." };
  }
}


// Cancels an abandoned application that never reached the payment step.
export async function cancelAbandonedApplicationAction(applicationId: string) {
  try {
    await cancelAbandonedApplication(applicationId);
    revalidatePath("/admin/membership-review");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error?.message || "Failed to cancel application." };
  }
}