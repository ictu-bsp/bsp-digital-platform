//src/lib/email.ts
import { Resend } from "resend";
// Initialize Resend client with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);
// Define sender address fallback using onboarding domain
const FROM_EMAIL = process.env.EMAIL_FROM || "Boy Scouts of the Philippines <onboarding@resend.dev>";
// Dispatches a 6-digit account verification code to specified email
export async function sendVerificationEmail(email: string, code: string) {
  try {
    // Validate existence of Resend API key before sending request
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is missing in environment variables.");
      return { success: false, error: "RESEND_API_KEY is missing." };
    }
    // Log outbound email attempt details to console
    console.log(`Sending verification code ${code} to ${email} via ${FROM_EMAIL}...`);
    // Execute email dispatch API call through Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify Your Boy Scouts Account",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;"><h2 style="color:#166534;margin-bottom:12px;">Boy Scouts of the Philippines</h2><p>Hello,</p><p>Thank you for registering for the <strong>BSP Integrated Digital Platform</strong>.</p><p>Please use the verification code below to continue creating your account.</p><div style="margin:32px 0;text-align:center;font-size:36px;font-weight:bold;letter-spacing:8px;color:#166534;">${code}</div><p>This verification code will expire in <strong>10 minutes</strong>.</p><hr style="margin:24px 0;" /><p style="font-size:13px;color:#6b7280;">If you did not request this account, you can safely ignore this email.</p><p style="font-size:13px;color:#6b7280;">Boy Scouts of the Philippines</p></div>`,
      text: `Boy Scouts of the Philippines\n\nYour verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this account, simply ignore this email.`
    });
    // Check if Resend returned an error response
    if (error) {
      console.error("❌ Resend API Error Details:", JSON.stringify(error, null, 2));
      return { success: false, error };
    }
    // Log success message and returned email identifier
    console.log(`✅ Verification email sent successfully. ID: ${data?.id}`);
    return { success: true, data };
  } catch (err) {
    // Catch and log unexpected runtime exceptions
    console.error("❌ Email Dispatch Catch Error:", err);
    return { success: false, error: err };
  }
}