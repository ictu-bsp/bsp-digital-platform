// src/app/actions/payment.ts
'use server';

import {
  createPaymentRecord,
  setPaymentProviderId,
} from "@/services/payment.service";

export async function createPaymentRecordAction(registrationId: string) {
  try {
    const record = await createPaymentRecord(registrationId);

    return {
      success: true,
      data: record,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "Failed to create payment record.",
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
    console.error(error);

    return {
      success: false,
      error: "Failed to update payment record.",
    };
  }
}