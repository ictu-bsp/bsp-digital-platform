// src/app/actions/payment.ts
'use server';
import { createPaymentRecord, setPaymentProviderId } from "@/services/payment.service";
import { submitApplicationAction } from "@/app/actions/application";
import { SubmitApplicationInput } from "@/services/application.service";

// Creates a new payment record for a given registration ID after validating session details
export async function createPaymentRecordAction(registrationId: string) {
  try {
    if (!registrationId || registrationId === "undefined" || registrationId === "null") return {
      success: false, error: "Your session details were not found. Please restart your registration." };
    const record = await createPaymentRecord(registrationId);
    return { success: true, data: record };
  } catch (error) {
    console.error("Error creating payment record:", error);
    return { success: false, error: "Unable to set up payment details. Please go back and try again." };
  }
}

// Links a payment provider transaction ID to an existing payment record
export async function setPaymentProviderIdAction(paymentRecordId: string, providerId: string) {
  try {
    await setPaymentProviderId(paymentRecordId, providerId);
    return { success: true };
  } catch (error) {
    console.error("Error updating payment provider ID:", error);
    return { success: false, error: "Unable to complete payment setup. Please try again." };
  }
}

// Combines application submission (DB write) with payment record creation
// into one call. Fired from the /method/* pages instead of Register, so
// nothing hits the DB until the scout actually reaches a payment screen.
export async function submitApplicationAndCreatePaymentAction(payload: SubmitApplicationInput) {
  try {
    const applicationResult = await submitApplicationAction(payload);
    if (!applicationResult.success || !applicationResult.data) {
      return { success: false, error: applicationResult.error ?? "Failed to create registration." };
    }

    const paymentRecord = await createPaymentRecord(applicationResult.data.id);
    return {
      success: true,
      data: {
        applicationId: applicationResult.data.id,
        paymentRecord,
      },
    };
  } catch (error) {
    console.error("Error in submitApplicationAndCreatePaymentAction:", error);
    return { success: false, error: "Unable to set up your registration and payment. Please try again." };
  }
}