//src/lib/validation/scout/registration.ts

import { z } from "zod";

export const EMERGENCY_RELATIONSHIP_OPTIONS = [
  "Parent",
  "Legal Guardian",
  "Sibling",
  "Spouse",
  "Partner",
  "Extended Family Member",
  "Friend",
  "Child",
  "Other",
] as const;

export const registrationSchema = z.object({
  // Personal Info
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE"]),

  // Address Dropdowns
  region: z.string().min(1, "Region is required"),
  province: z.string().min(1, "Province is required"),
  cityMunicipality: z.string().min(1, "City/Municipality is required"),
  barangay: z.string().min(1, "Barangay is required"),
  streetAddress: z.string().min(1, "Street address is required"),

  // Emergency Contact
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactNumber: z.string().min(10, "Valid contact number is required"),
  emergencyContactRelationship: z.enum(EMERGENCY_RELATIONSHIP_OPTIONS),

  // Scout Info & Membership Type
  membershipType: z.string().min(1, "Membership type is required"),
  scoutCouncilId: z.string().min(1, "Council is required"),
  scoutRegionId: z.string().min(1, "Scout Region is required"),
  unitNumber: z.string().optional(),
  rank: z.string().optional(),

  // Adult Specific (Dynamic)
  position: z.string().optional(),
  backgroundCheckConsent: z.boolean().optional(),
});