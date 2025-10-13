import nodemailer from "nodemailer";
import type { User, ProcessingJob } from "@shared/schema";

const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@drisya.app";

const APP_URL = process.env.APP_URL || "http://localhost:5000";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn("Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD environment variables.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  return transporter;
}

function getEmailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Drisya</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
      border-top: 1px solid #e9ecef;
    }
    .stats {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .stat-item:last-child {
      border-bottom: none;
    }
    .stat-label {
      color: #6c757d;
      font-weight: 500;
    }
    .stat-value {
      color: #333333;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">Drisya</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Drisya. All rights reserved.</p>
      <p>Professional AI-powered image enhancement platform</p>
      <p style="margin-top: 15px;">
        <a href="${APP_URL}/settings" style="color: #667eea; text-decoration: none;">Notification Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transport = getTransporter();
  
  if (!transport) {
    console.warn("Email service not configured, skipping email send");
    return false;
  }

  try {
    await transport.sendMail({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    
    console.log(`Email sent successfully to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${options.to}:`, error);
    return false;
  }
}

export async function sendWelcomeEmail(user: User): Promise<boolean> {
  const content = `
    <h2>Welcome to Drisya! 🎉</h2>
    <p>Hi ${user.name || "there"},</p>
    <p>Thank you for joining Drisya, your professional AI-powered image enhancement platform.</p>
    
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Welcome Bonus</span>
        <span class="stat-value">100 Coins</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Account Email</span>
        <span class="stat-value">${user.email}</span>
      </div>
    </div>

    <p>You've received <strong>100 free coins</strong> to get started! Use them to process your first batch of images with our AI-powered enhancement templates.</p>
    
    <h3>What you can do with Drisya:</h3>
    <ul>
      <li>Upload bulk images and process them in seconds</li>
      <li>Choose from professional templates for jewelry, fashion, and more</li>
      <li>Remove backgrounds automatically with AI</li>
      <li>Download high-quality processed images</li>
    </ul>

    <a href="${APP_URL}/upload" class="button">Start Processing Images</a>

    <p>If you have any questions, feel free to reach out to our support team.</p>
    <p>Happy enhancing!</p>
    <p><strong>The Drisya Team</strong></p>
  `;

  return sendEmail({
    to: user.email,
    subject: "Welcome to Drisya - 100 Free Coins Inside! 🎁",
    html: getEmailLayout(content),
  });
}

export async function sendJobCompletedEmail(
  user: User,
  job: ProcessingJob,
  downloadUrl: string
): Promise<boolean> {
  const content = `
    <h2>Your Images Are Ready! ✨</h2>
    <p>Hi ${user.name || "there"},</p>
    <p>Great news! Your image processing job has been completed successfully.</p>
    
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Total Images</span>
        <span class="stat-value">${job.totalImages} images</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Coins Used</span>
        <span class="stat-value">${job.coinsUsed} coins</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Status</span>
        <span class="stat-value">Completed</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Processed At</span>
        <span class="stat-value">${job.completedAt ? new Date(job.completedAt).toLocaleString() : "Just now"}</span>
      </div>
    </div>

    <p>All your images have been enhanced and are ready for download.</p>

    <a href="${downloadUrl}" class="button">Download Processed Images</a>

    <p>Your download link will be available for 30 days. Make sure to save your images!</p>
    
    <p><strong>Remaining Balance:</strong> ${user.coinBalance} coins</p>
    
    <p>Need more coins? <a href="${APP_URL}/wallet" style="color: #667eea;">Visit your wallet</a> to purchase more.</p>

    <p>Thank you for using Drisya!</p>
    <p><strong>The Drisya Team</strong></p>
  `;

  return sendEmail({
    to: user.email,
    subject: `Your ${job.totalImages} Images Are Ready for Download! 🎉`,
    html: getEmailLayout(content),
  });
}

export async function sendPaymentConfirmedEmail(
  user: User,
  coinAmount: number,
  priceInINR: number,
  paymentMethod: string
): Promise<boolean> {
  const content = `
    <h2>Payment Confirmed! 💰</h2>
    <p>Hi ${user.name || "there"},</p>
    <p>Your payment has been verified and processed successfully.</p>
    
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Coins Added</span>
        <span class="stat-value">${coinAmount} coins</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Amount Paid</span>
        <span class="stat-value">₹${priceInINR}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Payment Method</span>
        <span class="stat-value">${paymentMethod}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">New Balance</span>
        <span class="stat-value">${user.coinBalance} coins</span>
      </div>
    </div>

    <p>Your coins have been added to your wallet and are ready to use!</p>

    <a href="${APP_URL}/upload" class="button">Start Processing Images</a>

    <p>Thank you for your purchase!</p>
    <p><strong>The Drisya Team</strong></p>
  `;

  return sendEmail({
    to: user.email,
    subject: `Payment Confirmed - ${coinAmount} Coins Added! ✅`,
    html: getEmailLayout(content),
  });
}

export async function sendCoinsAddedEmail(
  user: User,
  coinAmount: number,
  reason: string
): Promise<boolean> {
  const content = `
    <h2>Coins Added to Your Wallet! 🪙</h2>
    <p>Hi ${user.name || "there"},</p>
    <p>${reason}</p>
    
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Coins Added</span>
        <span class="stat-value">${coinAmount} coins</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">New Balance</span>
        <span class="stat-value">${user.coinBalance} coins</span>
      </div>
    </div>

    <p>Your coins are ready to use!</p>

    <a href="${APP_URL}/upload" class="button">Start Processing Images</a>

    <p>Thank you for using Drisya!</p>
    <p><strong>The Drisya Team</strong></p>
  `;

  return sendEmail({
    to: user.email,
    subject: `${coinAmount} Coins Added to Your Wallet! 🎁`,
    html: getEmailLayout(content),
  });
}

export function shouldSendEmail(user: User, emailType: "welcome" | "jobCompletion" | "paymentConfirmed" | "coinsAdded"): boolean {
  if (!user.emailNotifications) {
    return false;
  }

  switch (emailType) {
    case "welcome":
      return true;
    case "jobCompletion":
      return user.notifyJobCompletion;
    case "paymentConfirmed":
      return user.notifyPaymentConfirmed;
    case "coinsAdded":
      return user.notifyCoinsAdded;
    default:
      return false;
  }
}
