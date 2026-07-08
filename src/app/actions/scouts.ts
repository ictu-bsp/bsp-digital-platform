'use server';

export async function getScoutsByCouncil(_councilId: string) {
  return {
    success: false,
    error: "Not implemented yet.",
  };
}

export async function verifyScoutPayment(
  _scoutId: string,
  _transactionReference: string
) {
  return {
    success: false,
    message: "",
    data: null,
    error: "Not implemented yet.",
  };
}