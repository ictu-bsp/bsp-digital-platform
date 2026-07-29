// src/app/actions/admin.ts
"use server";

import {
  getDashboardStats,
  getAllScouts,
  getScoutById,
  getCouncilScouts,
  getAdministrators,
  getAdministratorById,
  getPendingRegistrations,
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
  updateRegistrationPaymentStatus, // Ensure this exists or matches your service method name
} from "@/services/admin.service";

// Fetches high-level metrics for the admin dashboard overview
export async function fetchDashboardStats() {
  try {
    const data = await getDashboardStats();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load dashboard statistics." };
  }
}

// Retrieves a comprehensive list of all registered scouts in the system
export async function fetchAllScouts() {
  try {
    const data = await getAllScouts();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load scouts." };
  }
}

// Fetches detailed profile information for a single scout by unique ID
export async function fetchScoutById(id: string) {
  try {
    const data = await getScoutById(id);
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load scout." };
  }
}

// Retrieves all scouts belonging to a specific council ID
export async function fetchCouncilScouts(councilId: string) {
  try {
    const data = await getCouncilScouts(councilId);
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load council scouts." };
  }
}

// Fetches a list of all administrator accounts across the system
export async function fetchAdministrators() {
  try {
    const data = await getAdministrators();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load administrators." };
  }
}

// Retrieves details for a specific administrator by unique ID
export async function fetchAdministratorById(id: string) {
  try {
    const data = await getAdministratorById(id);
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load administrator." };
  }
}

// Retrieves registrations currently waiting for membership review approval
export async function fetchPendingRegistrations() {
  try {
    const data = await getPendingRegistrations();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load pending registrations." };
  }
}

// Approves a pending membership registration review
export async function approveRegistrationAction(registrationId: string) {
  try {
    await approveMembershipReview(registrationId);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to approve registration." };
  }
}

// Rejects a pending membership registration and attaches feedback details
export async function rejectRegistrationAction(registrationId: string, feedback: string) {
  try {
    await rejectRegistration(registrationId, feedback);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to reject registration." };
  }
}

// Retrieves registrations that have passed membership review and await finance verification
export async function fetchRegistrationsAwaitingFinance() {
  try {
    const data = await getRegistrationsAwaitingFinance();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load registrations awaiting finance verification." };
  }
}

// Verifies payment and activates the user registration status
export async function verifyAndActivateRegistrationAction(registrationId: string) {
  try {
    await verifyAndActivateRegistration(registrationId);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to verify and activate registration." };
  }
}

// Manually overrides and updates payment status (e.g. marking as "paid")
export async function updatePaymentStatusAction(registrationId: string, status: string) {
  try {
    await updateRegistrationPaymentStatus(registrationId, status);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update payment status." };
  }
}

// Direct live gateway check with PayMongo/payment provider API
export async function syncPaymentStatusAction(registrationId: string, paymentIntentId: string) {
  try {
    const apiKey = process.env.PAYMONGO_SECRET_KEY;
    if (!apiKey) {
      return { success: false, error: "Payment gateway secret key is not configured." };
    }

    const response = await fetch(`https://api.paymongo.com/v1/payment_intents/${paymentIntentId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { success: false, error: "Failed to retrieve status from payment gateway." };
    }

    const body = await response.json();
    const intentStatus = body?.data?.attributes?.status;

    // Check if gateway confirms payment success
    if (intentStatus === "succeeded") {
      await updateRegistrationPaymentStatus(registrationId, "paid");
      return { success: true, paymentStatus: "paid" };
    }

    return {
      success: false,
      error: `Gateway status is currently '${intentStatus ?? "unknown"}'. Payment is not settled yet.`,
    };
  } catch (error) {
    console.error("syncPaymentStatusAction error:", error);
    return { success: false, error: "An unexpected error occurred while re-checking payment status." };
  }
}

// Fetches analytical breakdown of registrations grouped by current status
export async function fetchRegistrationStatusBreakdown() {
  try {
    const data = await getRegistrationStatusBreakdown();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load registration status breakdown." };
  }
}

// Calculates and returns aggregate payment totals across all transactions
export async function fetchPaymentTotals() {
  try {
    const data = await getPaymentTotals();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load payment totals." };
  }
}

// Fetches distribution statistics across different councils and geographical regions
export async function fetchCouncilRegionBreakdown() {
  try {
    const data = await getCouncilRegionBreakdown();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load council/region breakdown." };
  }
}

// Fetches distribution statistics of scouts categorized by rank
export async function fetchScoutRankBreakdown() {
  try {
    const data = await getScoutRankBreakdown();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load scout rank breakdown." };
  }
}

// Retrieves engagement and participation statistics for events and activities
export async function fetchActivityParticipationStats() {
  try {
    const data = await getActivityParticipationStats();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load activity participation stats." };
  }
}

// Fetches demographic breakdown by sex for reporting purposes
export async function fetchSexBreakdown() {
  try {
    const data = await getSexBreakdown();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to load sex breakdown." };
  }
}