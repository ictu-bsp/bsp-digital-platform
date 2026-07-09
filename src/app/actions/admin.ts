'use server';

import {
  getDashboardStats,
  getAllScouts,
  getScoutById,
  getCouncilScouts,
  getAdministrators,
  getAdministratorById,
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