import { z } from "zod";

const GENDER_ENUM = z.enum(["MALE", "FEMALE", "OTHER"]);

export const nonVerifiedScoutSchema = z.object({
  userID: z.string().uuid(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  suffix: z.string().optional(),
  dateOfBirth: z.string(), // ISO format (YYYY-MM-DD)
  gender: GENDER_ENUM,
  email: z.string().email(),
});