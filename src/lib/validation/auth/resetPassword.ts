import { z } from "zod";
import { passwordSchema } from "./shared";

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,

    confirmPassword: z.string(),
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

export type ResetPasswordInput = z.infer<
  typeof resetPasswordSchema
>;