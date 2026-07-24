//src/lib/validation/auth/signup.ts

import { z } from "zod";

import {
  emailSchema,
  nameSchema,
  birthdateSchema,
  suffixSchema,
} from "./shared";

// Helper to normalize empty string inputs to undefined
const optionalString = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" || val === null ? undefined : val));

export const signUpSchema = z.object({
  email: emailSchema,

  firstName: nameSchema,

  middleName: optionalString(nameSchema),

  lastName: nameSchema,

  suffix: optionalString(suffixSchema),

  birthdate: birthdateSchema,

  sex: z.string().min(1, "Field is required."),

  role: z.enum(["VISITOR", "SCOUT"], {
    message: "Please select whether you're new to Scouting or already a Scout.",
  }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;