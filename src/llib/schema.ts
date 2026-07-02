import { z } from "zod";

export const basicAuthSchema = z.object({
  lastName: z.string().min(2, "Last name is required"),
  firstName: z.string().min(2, "First name is required"),
  email: z.email("Invalid email address"),
  mobileNumber: z.string().min(11, "Mobile number must be at least 11 digits"),
  birthdate: z.coerce.date().refine((date) => date < new Date(), {
    message: "Birthdate cannot be in the future",
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // Data Privacy Agreement (The "Gate")
  hasAgreedToDataPrivacy: z.literal(true, {
    message: "You must agree to the Data Privacy Policy",
  }),
});

export const membershipSchema = z.object({
  gender: z.enum(["Male", "Female"]),
  religion: z.string().min(2, "Religion is required"),
  civilStatus: z.enum(["Single", "Married", "Widowed", "Separated"]),
  region: z.string().min(2, "Region is required"),
  council: z.string().min(2, "Council is required"),
  outfit: z.string().min(1, "Outfit/Unit information is required"),
  scoutingPosition: z.string().min(2, "Position is required"),
  tenureInScouting: z.coerce.number().min(0, "Tenure cannot be negative"),
  // One-Time Payment for Multi-Year Registration
  paymentYears: z.coerce.number().min(1).max(5, "Select between 1 to 5 years"),
  paymentReceiptUrl: z.string().url("Proof of payment is required"), // From Cloudflare R2
});

// Types for your developers to use
export type BasicAuthData = z.infer<typeof basicAuthSchema>;
export type MembershipData = z.infer<typeof membershipSchema>;