// src/app/actions/councils.ts
'use server';

import { getAllCouncils, getAllRegions, getCouncilRegion } from "../../services/council.service";

export async function getCouncilsAction() {
  try {
    const councils = await getAllCouncils();

    return {
      success: true,
      data: councils,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "Failed to load councils.",
    };
  }
}

export async function getCouncilRegionAction(councilId: string) {
  try {
    const result = await getCouncilRegion(councilId);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "Failed to load region for council.",
    };
  }
}


export async function getRegionsAction() {
  try {
    const allRegions = await getAllRegions();

    return {
      success: true,
      data: allRegions,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "Failed to load regions.",
    };
  }
}