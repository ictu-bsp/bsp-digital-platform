'use server';

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
} from '@/services/admin.service';
//Dashboard
export async function fetchDashboardStats() {
  try {
    const data = await getDashboardStats();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: 'Failed to load dashboard statistics.',
    };
  }
}

//Scouts
export async function fetchAllScouts() {
  try {
    const data = await getAllScouts();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: 'Failed to load scouts.',
    };
  }
}

export async function fetchScoutById(id: string) {
  try {
    const data = await getScoutById(id);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: 'Failed to load scout.',
    };
  }
}

export async function fetchCouncilScouts(councilId: string) {
  try {
    const data = await getCouncilScouts(councilId);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: 'Failed to load council scouts.',
    };
  }
}

//Administrators
export async function fetchAdministrators() {
  try {
    const data = await getAdministrators();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: 'Failed to load administrators.',
    };
  }
}

export async function fetchAdministratorById(id: string) {
  try {
    const data = await getAdministratorById(id);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: 'Failed to load administrator.',
    };
  }
}

//Membership Review
export async function fetchPendingRegistrations() {
  try {
    const data = await getPendingRegistrations();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: 'Failed to load pending registrations.',
    };
  }
}

export async function approveRegistrationAction(registrationId: string) {
  try {
    await approveMembershipReview(registrationId);
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to approve registration.',
    };
  }
}

export async function rejectRegistrationAction(
  registrationId: string,
  feedback: string
) {
  try {
    await rejectRegistration(registrationId, feedback);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: 'Failed to reject registration.',
    };
  }
}

//Finance
export async function fetchRegistrationsAwaitingFinance() {
  try {
    const data = await getRegistrationsAwaitingFinance();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to load registrations awaiting finance verification.',
    };
  }
}

export async function verifyAndActivateRegistrationAction(registrationId: string) {
  try {
    await verifyAndActivateRegistration(registrationId);
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to verify and activate registration.',
    };
  }
}

//Reports
export async function fetchRegistrationStatusBreakdown() {
  try {
    const data = await getRegistrationStatusBreakdown();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to load registration status breakdown.',
    };
  }
}

export async function fetchPaymentTotals() {
  try {
    const data = await getPaymentTotals();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to load payment totals.',
    };
  }
}

export async function fetchCouncilRegionBreakdown() {
  try {
    const data = await getCouncilRegionBreakdown();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to load council/region breakdown.',
    };
  }
}

export async function fetchScoutRankBreakdown() {
  try {
    const data = await getScoutRankBreakdown();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to load scout rank breakdown.',
    };
  }
}

export async function fetchActivityParticipationStats() {
  try {
    const data = await getActivityParticipationStats();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to load activity participation stats.',
    };
  }
}