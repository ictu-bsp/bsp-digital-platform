import { z } from "zod";
import { calculateAge } from "@/lib/utils/age";

// Shared Password Schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(100, "Password cannot exceed 100 characters.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character."
  );

// Shared Name Schema
export const nameSchema = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .max(100, "Must not exceed 100 characters.")
  .regex(
    /^[A-Za-zÀ-ÿ' -]+$/,
    "Only letters, spaces, apostrophes, and hyphens are allowed."
  );

// Shared Email Schema
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address.")
  .max(255, "Email is too long.");

// Shared Birthdate Schema
export const birthdateSchema = z.coerce.date().refine(
  (birthdate) => {
    const age = calculateAge(birthdate);
    return age >= 5 && age <= 100;
  },
  {
    message: "Age must be between 5 and 100 years.",
  }
);

// Shared Suffix Schema
export const suffixSchema = z
  .string()
  .trim()
  .max(20)
  .optional()
  .or(z.literal(""));