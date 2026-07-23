// src/app/actions/payment.ts
'use server';

import {
  createPaymentRecord,
  setPaymentProviderId,
} from "@/services/payment.service";

export async function createPaymentRecordAction(registrationId: string) {
  try {
    if (!registrationId || registrationId === "undefined" || registrationId === "null") {
      return {
        success: false,
        error: "Your session details were not found. Please restart your registration.",
      };
    }

    const record = await createPaymentRecord(registrationId);

    return {
      success: true,
      data: record,
    };
  } catch (error) {
    // Log technical trace in server terminal for developer review
    console.error("Error creating payment record:", error);

    // Return friendly, readable message for the UI
    return {
      success: false,
      error: "Unable to set up payment details. Please go back and try again.",
    };
  }
}

export async function setPaymentProviderIdAction(
  paymentRecordId: string,
  providerId: string
) {
  try {
    await setPaymentProviderId(paymentRecordId, providerId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating payment provider ID:", error);

    return {
      success: false,
      error: "Unable to complete payment setup. Please try again.",
    };
  }
}