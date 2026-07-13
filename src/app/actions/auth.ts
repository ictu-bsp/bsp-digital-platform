"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth/login";
import { signUpSchema } from "@/lib/validation/auth/signup";
import { getSessionCookie, clearSessionCookie, } from "@/lib/auth/cookies";

import {
  createPendingUserRegistration,
  verifyPendingUserRegistration,
  completePendingRegistration,
  resendPendingVerification,
  verifyCurrentPassword,
  loginUser,
} from "@/services/auth.service";

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
    gender: formData.get("gender"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createPendingUserRegistration(parsed.data);

    return {
      success: true,
      message: "Verification code sent to your email.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create registration.",
    };
  }
}

export async function verifyEmailAction(
  email: string,
  code: string
): Promise<ActionResult> {
  try {
    await verifyPendingUserRegistration(
      email,
      code
    );

    return {
      success: true,
      message: "Email verified successfully.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to verify email.",
    };
  }
}

export async function resendVerificationAction(
  email: string
): Promise<ActionResult> {
  try {
    await resendPendingVerification(email);

    return {
      success: true,
      message: "Verification code sent successfully.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to resend verification code.",
    };
  }
}

export async function createPasswordAction(
  email: string,
  password: string,
  confirmPassword: string
): Promise<ActionResult> {
  if (password !== confirmPassword) {
    return {
      success: false,
      message: "Passwords do not match.",
    };
  }

  try {
    await completePendingRegistration(
      email,
      password
    );

    return {
      success: true,
      message:
        "Account created successfully. Please log in.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to complete registration.",
    };
  }
}

export async function verifyCurrentPasswordAction(
  currentPassword: string
): Promise<ActionResult> {
  try {
    const sessionId = await getSessionCookie();

    if (!sessionId) {
      return {
        success: false,
        message: "You are not logged in.",
      };
    }

    const user = await getCurrentUser(sessionId);

    if (!user) {
      return {
        success: false,
        message: "Session expired.",
      };
    }

    const verified = await verifyCurrentPassword(
      user.id,
      currentPassword
    );

    if (!verified) {
      return {
        success: false,
        message: "Incorrect password.",
      };
    }

    return {
      success: true,
      message: "Password verified.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to verify password.",
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
      message: "Please correct the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await loginUser(
      parsed.data.email,
      parsed.data.password
    );

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

export async function logout() {
  const sessionId =
    await getSessionCookie();

  if (sessionId) {
    await deleteSession(sessionId);
  }

  await clearSessionCookie();

  redirect("/login");
}