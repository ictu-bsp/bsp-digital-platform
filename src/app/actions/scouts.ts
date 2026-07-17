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

export async function getScoutRosterAction() {
  try {
    const data = await getAllScoutsRoster();
    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      error: "Failed to load scout roster.",
    };
  }
}

export async function toggleScoutMembershipAction(
  scoutId: string,
  isActive: boolean
) {
  try {
    const updated = await setScoutMembershipActive(scoutId, isActive);

    if (!updated) {
      return {
        success: false,
        data: null,
        error: "Scout not found.",
      };
    }

    return {
      success: true,
      data: updated,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      error: "Failed to update scout membership.",
    };
  }
}

export async function deleteScoutPermanentlyAction(scoutId: string) {
  try {
    const deleted = await deleteScoutPermanently(scoutId);

    if (!deleted) {
      return {
        success: false,
        data: null,
        error: "Scout not found.",
      };
    }

    return {
      success: true,
      data: deleted,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      error: "Failed to delete scout.",
    };
  }
}