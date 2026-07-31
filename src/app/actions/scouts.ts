//src/app/actions/scouts.ts
'use server';
import { updatePaymentStatus } from "@/services/payment.service";
import {
  getAllScoutsRoster,
  setScoutMembershipActive,
  deleteScoutPermanently,
} from "@/services/scout.service";

export async function getScoutsByCouncil(_councilId: string) {
  return {
    success: false,
    error: "Not implemented yet.",
  };
}

export async function verifyScoutPayment(
  paymentRecordId: string,
  status: "paid" | "failed",
  paymentMethod?: string
) {
  try {
    await updatePaymentStatus(paymentRecordId, status, paymentMethod);

    return {
      success: true,
      message: `Payment marked as ${status}.`,
      data: null,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "", data: null, error: "Failed to verify scout payment." };
  }
}
// Retrieves the complete roster list of all registered scouts
export async function getScoutRosterAction() {
  try {
    const data = await getAllScoutsRoster();
    return { success: true, data, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, data: null, error: "Failed to load scout roster." };
  }
}
// Toggles the active membership status of a scout by their ID
export async function toggleScoutMembershipAction(scoutId: string, isActive: boolean) {
  try {
    const updated = await setScoutMembershipActive(scoutId, isActive);
    if (!updated) return { success: false, data: null, error: "Scout not found." };
    return { success: true, data: updated, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, data: null, error: "Failed to update scout membership." };
  }
}
// Permanently removes a scout record from the database by ID
export async function deleteScoutPermanentlyAction(scoutId: string) {
  try {
    const deleted = await deleteScoutPermanently(scoutId);
    if (!deleted) return { success: false, data: null, error: "Scout not found." };
    return { success: true, data: deleted, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, data: null, error: "Failed to delete scout." };
  }
}