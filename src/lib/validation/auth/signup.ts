import { z } from "zod";

import {
  emailSchema,
  nameSchema,
  birthdateSchema,
  suffixSchema,
} from "./shared";

export const signUpSchema = z.object({
  email: emailSchema,

  firstName: nameSchema,

  middleName: nameSchema
    .optional()
    .or(z.literal("")),

  lastName: nameSchema,

  suffix: suffixSchema,

  birthdate: birthdateSchema,

  sex: z.string().min(1, "Field is required."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;