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
    subject: `【${creatorName}】发布新内容：${postTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${creatorName} 发布新内容</h2>
        <p>亲爱的订阅者：</p>
        <p>您订阅的创作者 <strong>${creatorName}</strong> 刚刚发布了新内容：</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${postTitle}</h3>
          <a href="${postUrl}" style="color: #0066cc;">点击阅读</a>
        </div>
        <p>此邮件由 ContentPay 自动发送。</p>
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
    subject: "支付成功 - ContentPay",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>支付成功</h2>
        <p>您已成功购买以下内容：</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0;">${postTitle}</h3>
          <p style="color: #666; margin: 10px 0 0 0;">支付金额：${amount}</p>
        </div>
        <p>您现在可以访问完整内容了。</p>
        <p>此邮件由 ContentPay 自动发送。</p>
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
    subject: "订阅成功 - ContentPay",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>订阅成功</h2>
        <p>您已成功订阅 <strong>${creatorName}</strong> 的内容：</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>订阅计划：</strong>${plan === "yearly" ? "年付" : "月付"}</p>
          <p style="margin: 10px 0 0 0;"><strong>订阅金额：</strong>${amount}</p>
        </div>
        <p>您现在可以访问该创作者的所有付费内容了。</p>
        <p>此邮件由 ContentPay 自动发送。</p>
      </div>
    `,
  });
}
