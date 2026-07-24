// src/lib/utils/age.ts

/**
 * Computes a person's age in whole years from a date of birth, as of today.
 * Mirrors the age math used in `birthdateSchema`'s refinement
 * (see src/lib/validation/auth/shared.ts) so age is calculated consistently
 * everywhere in the app.
 */
export function calculateAge(birthdate: Date | string): number {
  const dob =
    typeof birthdate === "string" ? new Date(birthdate) : birthdate;

  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() &&
      today.getDate() >= dob.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  return age;
}

/** Convenience check for the age threshold used across the membership flows. */
export function isAdult(birthdate: Date | string): boolean {
  return calculateAge(birthdate) >= 18;
}