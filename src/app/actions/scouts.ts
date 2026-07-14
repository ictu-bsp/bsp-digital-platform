//src/app/actions/scouts.ts
'use server';
import { updatePaymentStatus } from "@/services/payment.service";

export async function getScoutsByCouncil(_councilId: string) {
  return {
    success: false,
    error: "Not implemented yet.",
  };
}



export async function verifyScoutPayment(
  paymentRecordId: string,
  status: "paid" | "failed"
) {
  try {
    await updatePaymentStatus(paymentRecordId, status);

    return {
      success: true,
      message: `Payment marked as ${status}.`,
      data: null,
      error: null,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "",
      data: null,
      error: "Failed to verify scout payment.",
    };
  }
}