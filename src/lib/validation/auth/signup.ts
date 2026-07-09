import { z } from "zod";

import {
  emailSchema,
  passwordSchema,
  nameSchema,
  birthdateSchema,
  suffixSchema,
} from "./shared";

export const signUpSchema = z
  .object({
    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z.string(),

    firstName: nameSchema,

    middleName: nameSchema.optional().or(z.literal("")),

    lastName: nameSchema,

    suffix: suffixSchema,

    birthdate: birthdateSchema,
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

export type SignUpInput = z.infer<typeof signUpSchema>;