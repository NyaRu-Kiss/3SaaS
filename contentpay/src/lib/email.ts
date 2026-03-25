import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ContentPay" <noreply@contentpay.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export async function sendNewPostNotification(
  subscriberEmail: string,
  creatorName: string,
  postTitle: string,
  postUrl: string
) {
  return sendEmail({
    to: subscriberEmail,
    subject: `[${creatorName}] New Post: ${postTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Content from ${creatorName}</h2>
        <p>Dear Subscriber,</p>
        <p>Your subscribed creator <strong>${creatorName}</strong> just published new content:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${postTitle}</h3>
          <a href="${postUrl}" style="color: #0066cc;">Click to read</a>
        </div>
        <p>This email was automatically sent by ContentPay.</p>
      </div>
    `,
  });
}

export async function sendPaymentSuccessEmail(
  email: string,
  postTitle: string,
  amount: string
) {
  return sendEmail({
    to: email,
    subject: "Payment Successful - ContentPay",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Successful</h2>
        <p>You have successfully purchased the following content:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0;">${postTitle}</h3>
          <p style="color: #666; margin: 10px 0 0 0;">Amount paid: ${amount}</p>
        </div>
        <p>You can now access the full content.</p>
        <p>This email was automatically sent by ContentPay.</p>
      </div>
    `,
  });
}

export async function sendSubscriptionConfirmationEmail(
  email: string,
  creatorName: string,
  plan: string,
  amount: string
) {
  return sendEmail({
    to: email,
    subject: "Subscription Confirmed - ContentPay",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Subscription Confirmed</h2>
        <p>You have successfully subscribed to <strong>${creatorName}</strong>:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Plan:</strong> ${plan === "yearly" ? "Yearly" : "Monthly"}</p>
          <p style="margin: 10px 0 0 0;"><strong>Amount:</strong> ${amount}</p>
        </div>
        <p>You now have access to all paid content from this creator.</p>
        <p>This email was automatically sent by ContentPay.</p>
      </div>
    `,
  });
}
