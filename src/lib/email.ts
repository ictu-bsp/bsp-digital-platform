import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.EMAIL_FROM ||
  "Boy Scouts of the Philippines <onboarding@resend.dev>";

export async function sendVerificationEmail(
  email: string,
  code: string
) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify Your Boy Scouts Account",

      html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#166534;margin-bottom:12px;">
          Boy Scouts of the Philippines
        </h2>

        <p>Hello,</p>

        <p>
          Thank you for registering for the
          <strong>BSP Integrated Digital Platform</strong>.
        </p>

        <p>
          Please use the verification code below to continue creating your account.
        </p>

        <div
          style="
            margin:32px 0;
            text-align:center;
            font-size:36px;
            font-weight:bold;
            letter-spacing:8px;
            color:#166534;
          "
        >
          ${code}
        </div>

        <p>
          This verification code will expire in
          <strong>10 minutes</strong>.
        </p>

        <hr style="margin:24px 0;" />

        <p style="font-size:13px;color:#6b7280;">
          If you did not request this account, you can safely ignore this email.
        </p>

        <p style="font-size:13px;color:#6b7280;">
          Boy Scouts of the Philippines
        </p>
      </div>
      `,

      text: `
Boy Scouts of the Philippines

Your verification code is:

${code}

This code expires in 10 minutes.

If you did not request this account, simply ignore this email.
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error("Email Error:", err);

    return {
      success: false,
      error: err,
    };
  }
}