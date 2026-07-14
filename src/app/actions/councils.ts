// src/app/actions/councils.ts
'use server';

import { getAllCouncils } from "../../services/council.service";

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