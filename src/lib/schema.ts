import { z } from "zod";

// --- Enums for strict validation ---
const GENDER_ENUM = z.enum(["MALE", "FEMALE", "OTHER"]);
const MEMBERSHIP_STATUS = z.enum(["PENDING", "ACTIVE", "EXPIRED"]);

// --- Core Schemas ---

export const nonVerifiedScoutSchema = z.object({
  userID: z.string().uuid(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  suffix: z.string().optional(),
  dateOfBirth: z.string(), // ISO format (YYYY-MM-DD)
  gender: GENDER_ENUM,
  email: z.string().email(),
});

export const scoutSchema = nonVerifiedScoutSchema.extend({
  scoutID: z.string().uuid(),
  scoutMembershipID: z.string(),
  membershipValidity: z.string().datetime(),
  isMembershipValid: z.boolean(),
  scoutingPosition: z.string(),
  bloodType: z.string().optional(),
  advancementRank: z.string(),
  tenure: z.coerce.number().int(),
  region: z.string(),
  council: z.string(),
  isCommunityBased: z.boolean(),
  sponsoringInstitution: z.string().optional(),
  sponsoringInstitutionAddress: z.string().optional(),
  emergencyContactName: z.string(),
  emergencyContactAddress: z.string(),
  emergencyContactRelationship: z.string(),
  emergencyContactContactNum: z.string(),
  emergencyContactEmail: z.string().email().optional(),
});

export const paymentSchema = z.object({
  transactionID: z.string().uuid(),
  paymentMethod: z.string(),
  dateOfTransaction: z.string().datetime(),
  amountPaid: z.coerce.number().positive(),
});

export const advancementRankSchema = z.object({
  advancementID: z.string().uuid(),
  advancementRankName: z.string(),
  advancementDateObtained: z.string().datetime(),
});

export const meritBadgeSchema = z.object({
  meritBadgeID: z.string().uuid(),
  meritBadgeName: z.string(),
  meritBadgeDateObtained: z.string().datetime(),
});

export const localCouncilSchema = z.object({
  localCouncilUserID: z.string().uuid(),
  localCouncilName: z.string(),
  email: z.string().email(),
});

export const superadminSchema = z.object({
  superadminUserID: z.string().uuid(),
  superadminEmail: z.string().email(),
});