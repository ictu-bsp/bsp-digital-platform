// src/app/actions/auth.ts

"use server";

import { redirect } from "next/navigation";
import { deleteSession, getCurrentUser } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth/login";
import { signUpSchema } from "@/lib/validation/auth/signup";
import { getSessionCookie, clearSessionCookie } from "@/lib/auth/cookies";
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

// Processes initial sign-up form submissions without parent email and initiates verification
export async function signUpAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    firstName: formData.get("firstName"),
    middleName: formData.get("middleName"),
    lastName: formData.get("lastName"),
    suffix: formData.get("suffix"),
    birthdate: formData.get("birthdate"),
    sex: formData.get("sex"),
    email: formData.get("email"),
    role: formData.get("role"),
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
    return { success: true, message: "Verification code sent to your email." };
  } catch (error) {
    console.error("signUpAction error:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unable to create registration." };
  }
}

// Verifies the email verification code submitted by a pending user
export async function verifyEmailAction(
  userEmail: string,
  code: string
): Promise<ActionResult & { verifiedEmail?: string; sentToEmail?: string }> {
  try {
    const result = await verifyPendingUserRegistration(userEmail, code);
    return {
      success: true,
      message: "Email verified successfully.",
      verifiedEmail: result.verifiedEmail,
      sentToEmail: result.sentToEmail,
    };
  } catch (error) {
    console.error("verifyEmailAction error:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unable to verify email." };
  }
}

// Requests a new verification code email for pending registrations (accepting parent email for minors)
export async function resendVerificationAction(registrationEmail: string, parentEmail?: string): Promise<ActionResult> {
  try {
    await resendPendingVerification(registrationEmail, parentEmail);
    return { success: true, message: "Verification code sent successfully." };
  } catch (error) {
    console.error("resendVerificationAction error:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unable to resend verification code." };
  }
}

// Sets password credentials and finalizes pending user registration
export async function createPasswordAction(email: string, password: string, confirmPassword: string): Promise<ActionResult> {
  if (password !== confirmPassword) return { success: false, message: "Passwords do not match." };

  try {
    await completePendingRegistration(email, password);
    return { success: true, message: "Account created successfully. Please log in." };
  } catch (error) {
    console.error("createPasswordAction error:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unable to complete registration." };
  }
}

// Validates current session password before performing privileged actions
export async function verifyCurrentPasswordAction(currentPassword: string): Promise<ActionResult> {
  try {
    const sessionId = await getSessionCookie();
    if (!sessionId) return { success: false, message: "You are not logged in." };

    const user = await getCurrentUser(sessionId);
    if (!user) return { success: false, message: "Session expired." };

    const verified = await verifyCurrentPassword(user.id, currentPassword);
    if (!verified) return { success: false, message: "Incorrect password." };

    return { success: true, message: "Password verified." };
  } catch (error) {
    console.error("verifyCurrentPasswordAction error:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unable to verify password." };
  }
}

// Processes user authentication credentials and returns role-based redirect paths
export async function loginAction(prevState: ActionResult, formData: FormData): Promise<ActionResult & { redirectTo?: string }> {
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
    const user = await loginUser(parsed.data.email, parsed.data.password);
    let redirectTo = "/scout";

    switch (user.role) {
      case "SUPER_ADMIN":
        redirectTo = "/admin";
        break;
      case "COUNCIL_ADMIN":
        redirectTo = "/admin/login";
        break;
      default:
        redirectTo = "/scout";
        break;
    }

    return { success: true, message: `Welcome back, ${user.firstName}!`, redirectTo };
  } catch (error) {
    console.error("loginAction error:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unable to log in." };
  }
}

// Terminates active user session, clears session cookies, and redirects to login
export async function logout() {
  const sessionId = await getSessionCookie();
  if (sessionId) await deleteSession(sessionId);
  await clearSessionCookie();
  redirect("/login");
}