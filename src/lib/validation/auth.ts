import { z } from "zod";

//Shared Password Schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(100, "Password cannot exceed 100 characters.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character.");

//Shared Name Schema
const nameSchema = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .max(100, "Must not exceed 100 characters.")
  .regex(
    /^[A-Za-zÀ-ÿ' -]+$/,
    "Only letters, spaces, apostrophes, and hyphens are allowed."
  );

//Shared Email Schema
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address.")
  .max(255, "Email is too long.");

//Shared Birthdate Schema
const birthdateSchema = z.coerce.date().refine(
  (birthdate) => {
    const today = new Date();

    let age = today.getFullYear() - birthdate.getFullYear();

    const hasHadBirthday =
      today.getMonth() > birthdate.getMonth() ||
      (today.getMonth() === birthdate.getMonth() &&
        today.getDate() >= birthdate.getDate());

    if (!hasHadBirthday) {
      age--;
    }

    return age >= 5 && age <= 100;
  },
  {
    message: "Age must be between 5 and 100 years.",
  }
);

//Suffix Schema
const suffixSchema = z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(""));

//Sign Up Validation
export const signUpSchema = z
  .object({
    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z.string(),

    firstName: nameSchema,

    middleName: nameSchema
      .optional()
      .or(z.literal("")),

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

//Login Validation
export const loginSchema = z.object({
  email: emailSchema,

  password: z
    .string()
    .min(1, "Password is required."),
});

//Forget Password Validation
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

//Reset Password Validation
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

//Exported Types
export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;