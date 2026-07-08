import { z } from "zod";
import { nonVerifiedScoutSchema } from "./profile";

const MEMBERSHIP_STATUS = z.enum(["PENDING", "ACTIVE", "EXPIRED"]);
const ROLE_ENUM = z.enum(["SCOUT", "SUPERADMIN", "COUNCIL"]);

export const scoutSchema = nonVerifiedScoutSchema.extend({
  scoutID: z.string().uuid(),
  scoutMembershipID: z.string(),
  membershipValidity: z.string().datetime(),
  membershipStatus: MEMBERSHIP_STATUS,
  isMembershipValid: z.boolean(),
  userRole: ROLE_ENUM,
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