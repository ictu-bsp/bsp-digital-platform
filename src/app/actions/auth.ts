"use server";

import {
  createUser,
  loginUser,
} from "@/services/auth.service";

import {
  signUpSchema,
  loginSchema,
} from "@/lib/validation/auth";

export interface ActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function signUpAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    firstName: formData.get("firstName"),
    middleName: formData.get("middleName"),
    lastName: formData.get("lastName"),
    suffix: formData.get("suffix"),
    birthdate: formData.get("birthdate"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword:
      formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message:
        "Please correct the highlighted fields.",
      errors:
        parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createUser(parsed.data);

    return {
      success: true,
      message:
        "Account created successfully.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create account.",
    };
  }
}

export async function loginAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message:
        "Please correct the highlighted fields.",
      errors:
        parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await loginUser(
      parsed.data.email,
      parsed.data.password
    );

    // Session creation will be added here.

    return {
      success: true,
      message: `Welcome back, ${user.firstName}!`,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to log in.",
    };
  }
}