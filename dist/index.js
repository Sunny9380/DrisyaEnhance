var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/email.ts
var email_exports = {};
__export(email_exports, {
  sendCoinsAddedEmail: () => sendCoinsAddedEmail,
  sendJobCompletedEmail: () => sendJobCompletedEmail,
  sendPaymentConfirmedEmail: () => sendPaymentConfirmedEmail,
  sendReferralSuccessEmail: () => sendReferralSuccessEmail,
  sendWelcomeEmail: () => sendWelcomeEmail,
  shouldSendEmail: () => shouldSendEmail
});
import nodemailer from "nodemailer";
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
      pass: EMAIL_PASSWORD
    }
  });
  return transporter;
}
function getEmailLayout(content) {
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
      <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Drisya. All rights reserved.</p>
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
async function sendEmail(options) {
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
      html: options.html
    });
    console.log(`Email sent successfully to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${options.to}:`, error);
    return false;
  }
}
async function sendWelcomeEmail(user) {
  const content = `
    <h2>Welcome to Drisya! \u{1F389}</h2>
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
    subject: "Welcome to Drisya - 100 Free Coins Inside! \u{1F381}",
    html: getEmailLayout(content)
  });
}
async function sendJobCompletedEmail(user, job, downloadUrl) {
  const content = `
    <h2>Your Images Are Ready! \u2728</h2>
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
    subject: `Your ${job.totalImages} Images Are Ready for Download! \u{1F389}`,
    html: getEmailLayout(content)
  });
}
async function sendPaymentConfirmedEmail(user, coinAmount, priceInINR, paymentMethod) {
  const content = `
    <h2>Payment Confirmed! \u{1F4B0}</h2>
    <p>Hi ${user.name || "there"},</p>
    <p>Your payment has been verified and processed successfully.</p>
    
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Coins Added</span>
        <span class="stat-value">${coinAmount} coins</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Amount Paid</span>
        <span class="stat-value">\u20B9${priceInINR}</span>
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
    subject: `Payment Confirmed - ${coinAmount} Coins Added! \u2705`,
    html: getEmailLayout(content)
  });
}
async function sendCoinsAddedEmail(user, coinAmount, reason) {
  const content = `
    <h2>Coins Added to Your Wallet! \u{1FA99}</h2>
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
    subject: `${coinAmount} Coins Added to Your Wallet! \u{1F381}`,
    html: getEmailLayout(content)
  });
}
async function sendReferralSuccessEmail(referrer, referredUser) {
  const content = `
    <h2>Great News! You Earned Referral Bonus! \u{1F389}</h2>
    <p>Hi ${referrer.name || "there"},</p>
    <p>Your referral was successful! <strong>${referredUser.name || referredUser.email}</strong> just signed up using your referral code.</p>
    
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Referral Bonus Earned</span>
        <span class="stat-value">50 Coins</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">New Balance</span>
        <span class="stat-value">${referrer.coinBalance} coins</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Referred User</span>
        <span class="stat-value">${referredUser.name || referredUser.email}</span>
      </div>
    </div>

    <p><strong>50 coins</strong> have been added to your wallet automatically!</p>
    
    <p>Keep sharing your referral link to earn more bonus coins!</p>

    <a href="${APP_URL}/referrals" class="button">View Your Referrals</a>

    <p>Thank you for spreading the word about Drisya!</p>
    <p><strong>The Drisya Team</strong></p>
  `;
  return sendEmail({
    to: referrer.email,
    subject: `You Earned 50 Coins! \u{1F381} ${referredUser.name || "Someone"} Joined Using Your Link`,
    html: getEmailLayout(content)
  });
}
function shouldSendEmail(user, emailType) {
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
    case "referral":
      return user.notifyCoinsAdded;
    // Use same setting as coins added
    default:
      return false;
  }
}
var EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, APP_URL, transporter;
var init_email = __esm({
  "server/email.ts"() {
    EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
    EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
    EMAIL_USER = process.env.EMAIL_USER || "";
    EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "";
    EMAIL_FROM = process.env.EMAIL_FROM || "noreply@drisya.app";
    APP_URL = process.env.APP_URL || "http://localhost:5000";
    transporter = null;
  }
});

// server/index.ts
import dotenv3 from "dotenv";
import express2 from "express";
import session from "express-session";
import MySQLStore from "express-mysql-session";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiEdits: () => aiEdits,
  aiUsageLedger: () => aiUsageLedger,
  auditLogs: () => auditLogs,
  backgrounds: () => backgrounds,
  coinPackages: () => coinPackages,
  images: () => images,
  insertAIEditSchema: () => insertAIEditSchema,
  insertAIUsageLedgerSchema: () => insertAIUsageLedgerSchema,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertBackgroundSchema: () => insertBackgroundSchema,
  insertCoinPackageSchema: () => insertCoinPackageSchema,
  insertImageSchema: () => insertImageSchema,
  insertManualTransactionSchema: () => insertManualTransactionSchema,
  insertMediaLibrarySchema: () => insertMediaLibrarySchema,
  insertProcessingJobSchema: () => insertProcessingJobSchema,
  insertReferralSchema: () => insertReferralSchema,
  insertTeamMemberSchema: () => insertTeamMemberSchema,
  insertTemplateFavoriteSchema: () => insertTemplateFavoriteSchema,
  insertTemplateSchema: () => insertTemplateSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  manualTransactions: () => manualTransactions,
  mediaLibrary: () => mediaLibrary,
  processingJobs: () => processingJobs,
  referrals: () => referrals,
  teamMembers: () => teamMembers,
  templateFavorites: () => templateFavorites,
  templates: () => templates,
  transactions: () => transactions,
  users: () => users
});
import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, int, timestamp, boolean, json, datetime } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
var users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  phone: text("phone"),
  // WhatsApp number for admin contact
  avatarUrl: text("avatar_url"),
  // Profile avatar image URL
  referralCode: text("referral_code").unique(),
  // User's unique referral code
  coinBalance: int("coin_balance").notNull().default(0),
  role: text("role").notNull().default("user"),
  // user, admin
  userTier: text("user_tier").notNull().default("free"),
  // free, basic, pro, enterprise
  monthlyQuota: int("monthly_quota").notNull().default(50),
  // Images per month - Free: 50, Basic: 200, Pro: 1000, Enterprise: unlimited
  monthlyUsage: int("monthly_usage").notNull().default(0),
  // Current month's usage
  quotaResetDate: timestamp("quota_reset_date").notNull().defaultNow(),
  // When quota resets
  emailNotifications: boolean("email_notifications").notNull().default(true),
  // Allow users to opt-out
  notifyJobCompletion: boolean("notify_job_completion").notNull().default(true),
  notifyPaymentConfirmed: boolean("notify_payment_confirmed").notNull().default(true),
  notifyCoinsAdded: boolean("notify_coins_added").notNull().default(true),
  isTrialUsed: boolean("is_trial_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var templates = mysqlTable("templates", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  // jewelry, fashion, etc.
  backgroundStyle: text("background_style").default("gradient"),
  // velvet, marble, minimal, gradient, festive
  lightingPreset: text("lighting_preset").default("soft-glow"),
  // moody, soft-glow, spotlight, studio
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  settings: json("settings"),
  // Advanced settings: { diffusionPrompt, shadowIntensity, vignetteStrength, etc. }
  isPremium: boolean("is_premium").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  // Pricing & Product Details
  coinCost: int("coin_cost").notNull().default(1),
  // Cost per image in coins
  pricePerImage: int("price_per_image"),
  // Price in currency (optional, for display)
  features: json("features"),
  // Array of feature objects: [{ title, description, icon }]
  benefits: json("benefits"),
  // Array of benefit text items
  useCases: json("use_cases"),
  // Array of use case objects: [{ title, description, imageUrl }]
  whyBuy: text("why_buy"),
  // Compelling reason to choose this template
  testimonials: json("testimonials"),
  // Array: [{ name, role, content, avatarUrl, rating }]
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at")
  // Soft delete timestamp - NULL means not deleted
});
var processingJobs = mysqlTable("processing_jobs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  templateId: varchar("template_id", { length: 36 }).notNull().references(() => templates.id),
  status: text("status").notNull().default("queued"),
  // queued, processing, completed, failed
  totalImages: int("total_images").notNull(),
  processedImages: int("processed_images").notNull().default(0),
  coinsUsed: int("coins_used").notNull(),
  batchSettings: json("batch_settings"),
  // brightness, contrast, etc.
  zipUrl: text("zip_url"),
  // URL to download processed images
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: datetime("completed_at")
});
var images = mysqlTable("images", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UNHEX(REPLACE(UUID(), '-', ''))`),
  jobId: varchar("job_id", { length: 36 }).notNull().references(() => processingJobs.id),
  originalUrl: text("original_url").notNull(),
  processedUrl: text("processed_url"),
  status: text("status").notNull().default("pending"),
  // pending, processing, completed, failed
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UNHEX(REPLACE(UUID(), '-', ''))`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  type: text("type").notNull(),
  // purchase, usage, refund, referral
  amount: int("amount").notNull(),
  // positive for credit, negative for debit
  description: text("description").notNull(),
  metadata: json("metadata"),
  // Additional data like job_id, payment_id, etc.
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var templateFavorites = mysqlTable("template_favorites", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UNHEX(REPLACE(UUID(), '-', ''))`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  templateId: varchar("template_id", { length: 36 }).notNull().references(() => templates.id),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var teamMembers = mysqlTable("team_members", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UNHEX(REPLACE(UUID(), '-', ''))`),
  organizationId: varchar("organization_id", { length: 36 }).notNull().references(() => users.id),
  // References admin user
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  role: text("role").notNull(),
  // admin, editor, viewer
  status: text("status").notNull().default("pending"),
  // pending, active, inactive
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var referrals = mysqlTable("referrals", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UNHEX(REPLACE(UUID(), '-', ''))`),
  referrerId: varchar("referrer_id", { length: 36 }).notNull().references(() => users.id),
  referredUserId: varchar("referred_user_id", { length: 36 }).references(() => users.id),
  referralCode: text("referral_code").notNull().unique(),
  status: text("status").notNull().default("pending"),
  // pending, completed
  coinsEarned: int("coins_earned").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: datetime("completed_at")
});
var auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UNHEX(REPLACE(UUID(), '-', ''))`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  // nullable for anonymous actions
  action: text("action").notNull(),
  // login, logout, upload, process, download, etc.
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  metadata: json("metadata"),
  // Additional context (template_id, job_id, file_count, etc.)
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var coinPackages = mysqlTable("coin_packages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UNHEX(REPLACE(UUID(), '-', ''))`),
  name: text("name").notNull(),
  // e.g., "Starter Pack", "Professional Pack"
  coinAmount: int("coin_amount").notNull(),
  // Number of coins in the package
  priceInINR: int("price_in_inr").notNull(),
  // Price in Indian Rupees
  discount: int("discount").default(0),
  // Discount percentage (0-100)
  description: text("description"),
  // e.g., "Best value for regular users"
  whatsappNumber: text("whatsapp_number"),
  // WhatsApp number for customer support
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: int("display_order").notNull().default(0),
  // Sort order for display
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var manualTransactions = mysqlTable("manual_transactions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UNHEX(REPLACE(UUID(), '-', ''))`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  packageId: varchar("package_id", { length: 36 }).references(() => coinPackages.id),
  // Optional reference to package
  coinAmount: int("coin_amount").notNull(),
  // Coins to be credited
  priceInINR: int("price_in_inr").notNull(),
  // Amount paid by user
  paymentMethod: text("payment_method").notNull().default("whatsapp"),
  // whatsapp, bank_transfer, upi, etc.
  paymentReference: text("payment_reference"),
  // WhatsApp message ID, transaction ID, etc.
  adminId: varchar("admin_id", { length: 36 }).references(() => users.id),
  // Admin who processed this
  adminNotes: text("admin_notes"),
  // Admin's internal notes
  userPhone: text("user_phone"),
  // Contact number for verification
  status: text("status").notNull().default("pending"),
  // pending, approved, rejected, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  approvedAt: datetime("approved_at"),
  // When admin approved the payment
  completedAt: datetime("completed_at")
  // When coins were credited
});
var mediaLibrary = mysqlTable("media_library", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UNHEX(REPLACE(UUID(), '-', ''))`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  jobId: varchar("job_id", { length: 36 }).references(() => processingJobs.id),
  // Optional reference to processing job
  imageId: varchar("image_id", { length: 36 }).references(() => images.id),
  // Optional reference to specific image
  fileName: text("file_name").notNull(),
  // Original filename
  processedUrl: text("processed_url").notNull(),
  // URL to processed image
  thumbnailUrl: text("thumbnail_url"),
  // Optional thumbnail for faster loading
  fileSize: int("file_size"),
  // File size in bytes
  dimensions: text("dimensions"),
  // e.g., "1080x1080"
  templateUsed: text("template_used"),
  // Template name used for processing
  tags: json("tags"),
  // User-defined tags for organization (stored as JSON array)
  isFavorite: boolean("is_favorite").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var aiEdits = mysqlTable("ai_edits", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UNHEX(REPLACE(UUID(), '-', ''))`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  jobId: varchar("job_id", { length: 36 }).references(() => processingJobs.id),
  // Optional link to processing job
  imageId: varchar("image_id", { length: 36 }).references(() => images.id),
  // Optional link to specific image
  prompt: text("prompt").notNull(),
  // User's editing instruction
  aiModel: text("ai_model").notNull().default("auto"),
  // qwen-2509, flux-kontext, auto
  quality: text("quality").notNull().default("4k"),
  // 4k, hd, standard - output quality level
  status: text("status").notNull().default("queued"),
  // queued, processing, completed, failed
  inputImageUrl: text("input_image_url").notNull(),
  // Original image URL
  outputImageUrl: text("output_image_url"),
  // AI-edited result URL
  cost: int("cost").notNull().default(0),
  // API cost in cents (0 for free tier)
  errorMessage: text("error_message"),
  // Error details if failed
  metadata: json("metadata"),
  // Model params, retry count, processing time, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: datetime("completed_at")
});
var aiUsageLedger = mysqlTable("ai_usage_ledger", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UNHEX(REPLACE(UUID(), '-', ''))`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id).unique(),
  month: text("month").notNull().default(sql`DATE_FORMAT(CURRENT_DATE, '%Y-%m')`),
  // e.g., "2025-10"
  freeRequests: int("free_requests").notNull().default(0),
  // Count of HF API free tier calls
  paidRequests: int("paid_requests").notNull().default(0),
  // Count of paid API calls
  totalCost: int("total_cost").notNull().default(0),
  // Total API cost in cents
  lastReset: timestamp("last_reset").notNull().defaultNow(),
  // When quota was last reset
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var backgrounds = mysqlTable("backgrounds", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UNHEX(REPLACE(UUID(), '-', ''))`),
  name: text("name").notNull(),
  // Display name
  category: text("category").notNull(),
  // fabrics, textures, gradients, nature, abstract, marble, velvet, etc.
  tags: json("tags"),
  // Searchable tags: ["luxury", "dark", "elegant"] (stored as JSON array)
  imageUrl: text("image_url").notNull(),
  // Full resolution background URL
  thumbnailUrl: text("thumbnail_url"),
  // Preview thumbnail
  source: text("source").notNull().default("upload"),
  // unsplash, pexels, upload, ai-generated, premium
  sourceId: text("source_id"),
  // External API ID for attribution
  sourceAuthor: text("source_author"),
  // Photo credit
  isPremium: boolean("is_premium").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by", { length: 36 }).references(() => users.id),
  // Admin who added it
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  coinBalance: true,
  role: true,
  userTier: true,
  monthlyQuota: true,
  monthlyUsage: true,
  quotaResetDate: true,
  emailNotifications: true,
  notifyJobCompletion: true,
  notifyPaymentConfirmed: true,
  notifyCoinsAdded: true,
  createdAt: true
});
var insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true
});
var insertProcessingJobSchema = createInsertSchema(processingJobs).omit({
  id: true,
  processedImages: true,
  zipUrl: true,
  createdAt: true,
  completedAt: true
});
var insertImageSchema = createInsertSchema(images).omit({
  id: true,
  processedUrl: true,
  status: true,
  createdAt: true
});
var insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true
});
var insertTemplateFavoriteSchema = createInsertSchema(templateFavorites).omit({
  id: true,
  createdAt: true
});
var insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  status: true,
  createdAt: true
});
var insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  referredUserId: true,
  status: true,
  coinsEarned: true,
  createdAt: true,
  completedAt: true
});
var insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true
});
var insertCoinPackageSchema = createInsertSchema(coinPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertManualTransactionSchema = createInsertSchema(manualTransactions).omit({
  id: true,
  status: true,
  createdAt: true,
  approvedAt: true,
  completedAt: true
});
var insertMediaLibrarySchema = createInsertSchema(mediaLibrary).omit({
  id: true,
  createdAt: true
});
var insertAIEditSchema = createInsertSchema(aiEdits).omit({
  id: true,
  userId: true,
  // Added by backend from session
  status: true,
  outputImageUrl: true,
  cost: true,
  errorMessage: true,
  metadata: true,
  createdAt: true,
  completedAt: true
});
var insertAIUsageLedgerSchema = createInsertSchema(aiUsageLedger).omit({
  id: true,
  month: true,
  freeRequests: true,
  paidRequests: true,
  totalCost: true,
  lastReset: true,
  updatedAt: true
});
var insertBackgroundSchema = createInsertSchema(backgrounds).omit({
  id: true,
  createdAt: true
});

// server/db.ts
dotenv.config();
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = mysql.createPool(process.env.DATABASE_URL);
var db = drizzle({ client: pool, schema: schema_exports, mode: "default" });

// server/storage.ts
import { eq, desc, and, isNull, sql as sql2, inArray } from "drizzle-orm";
import bcrypt from "bcrypt";
var DbStorage = class {
  // Users
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  async createUser(insertUser) {
    await db.insert(users).values(insertUser);
    const result = await db.select().from(users).where(eq(users.email, insertUser.email)).limit(1);
    return result[0];
  }
  async createAdminUser(email, password, name) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      role: "admin",
      userTier: "enterprise",
      coinBalance: 1e4,
      monthlyQuota: 999999
    });
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  async updateUserRole(userId, role, userTier = "free") {
    const updateData = { role, userTier };
    if (role === "admin") {
      updateData.userTier = "enterprise";
      updateData.monthlyQuota = 999999;
      const user = await this.getUser(userId);
      if (user && user.coinBalance < 1e4) {
        updateData.coinBalance = 1e4;
      }
    }
    await db.update(users).set(updateData).where(eq(users.id, userId));
  }
  async updateUserCoins(userId, amount) {
    await db.update(users).set({ coinBalance: amount }).where(eq(users.id, userId));
  }
  async addCoinsWithTransaction(userId, amount, transactionData) {
    await db.transaction(async (tx) => {
      const result = await tx.update(users).set({ coinBalance: sql2`${users.coinBalance} + ${amount}` }).where(
        and(
          eq(users.id, userId),
          sql2`${users.coinBalance} + ${amount} >= 0`
        )
      );
      await tx.insert(transactions).values({
        userId,
        amount,
        ...transactionData
      });
    });
  }
  async updateUserProfile(userId, data) {
    await db.update(users).set(data).where(eq(users.id, userId));
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (result.length === 0) {
      throw new Error("User not found");
    }
    return result[0];
  }
  async getUserStats(userId) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const jobs = await db.select().from(processingJobs).where(eq(processingJobs.userId, userId));
    const totalJobs = jobs.length;
    const totalImagesProcessed = jobs.reduce((sum2, job) => sum2 + job.processedImages, 0);
    const totalCoinsSpent = jobs.reduce((sum2, job) => sum2 + job.coinsUsed, 0);
    const purchaseTransactions = await db.select().from(transactions).where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "purchase")
      )
    );
    const totalCoinsPurchased = purchaseTransactions.reduce(
      (sum2, txn) => sum2 + (txn.amount > 0 ? txn.amount : 0),
      0
    );
    const accountAge = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1e3 * 60 * 60 * 24)
    );
    return {
      totalJobs,
      totalImagesProcessed,
      totalCoinsSpent,
      totalCoinsPurchased,
      accountAge
    };
  }
  // Usage Quotas
  async checkUserQuota(userId) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const now = /* @__PURE__ */ new Date();
    const quotaResetDate = new Date(user.quotaResetDate);
    if (now >= quotaResetDate) {
      await this.resetUserQuota(userId);
      const updatedUser = await this.getUser(userId);
      if (!updatedUser) throw new Error("User not found");
      return {
        hasQuota: updatedUser.monthlyUsage < updatedUser.monthlyQuota || updatedUser.userTier === "enterprise",
        remaining: updatedUser.userTier === "enterprise" ? 999999 : updatedUser.monthlyQuota - updatedUser.monthlyUsage,
        quota: updatedUser.userTier === "enterprise" ? 999999 : updatedUser.monthlyQuota,
        used: updatedUser.monthlyUsage
      };
    }
    if (user.userTier === "enterprise") {
      return {
        hasQuota: true,
        remaining: 999999,
        quota: 999999,
        used: user.monthlyUsage
      };
    }
    const remaining = user.monthlyQuota - user.monthlyUsage;
    return {
      hasQuota: remaining > 0,
      remaining: Math.max(0, remaining),
      quota: user.monthlyQuota,
      used: user.monthlyUsage
    };
  }
  async incrementMonthlyUsage(userId, imageCount) {
    await db.update(users).set({ monthlyUsage: sql2`${users.monthlyUsage} + ${imageCount}` }).where(eq(users.id, userId));
  }
  async resetUserQuota(userId) {
    const now = /* @__PURE__ */ new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await db.update(users).set({
      monthlyUsage: 0,
      quotaResetDate: nextMonth
    }).where(eq(users.id, userId));
  }
  // Templates
  async getAllTemplates() {
    return await db.select().from(templates).where(and(eq(templates.isActive, true), isNull(templates.deletedAt)));
  }
  async getAllTemplatesForAdmin() {
    return await db.select().from(templates);
  }
  async getTemplate(id) {
    const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
    return result[0];
  }
  async softDeleteTemplate(id) {
    await db.update(templates).set({
      isActive: false,
      deletedAt: /* @__PURE__ */ new Date()
    }).where(eq(templates.id, id));
  }
  async restoreTemplate(id) {
    await db.update(templates).set({
      isActive: true,
      deletedAt: null
    }).where(eq(templates.id, id));
  }
  async deleteTemplate(id) {
    await db.delete(templates).where(eq(templates.id, id));
  }
  async createTemplate(insertTemplate) {
    await db.insert(templates).values(insertTemplate);
    const result = await db.select().from(templates).where(eq(templates.name, insertTemplate.name)).orderBy(desc(templates.createdAt)).limit(1);
    return result[0];
  }
  async updateTemplate(id, data) {
    await db.update(templates).set(data).where(eq(templates.id, id));
    const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
    if (result.length === 0) {
      throw new Error("Template not found");
    }
    return result[0];
  }
  // Processing Jobs
  async createProcessingJob(insertJob) {
    await db.insert(processingJobs).values(insertJob);
    const result = await db.select().from(processingJobs).where(and(eq(processingJobs.userId, insertJob.userId), eq(processingJobs.templateId, insertJob.templateId))).orderBy(desc(processingJobs.createdAt)).limit(1);
    return result[0];
  }
  async getProcessingJob(id) {
    const result = await db.select().from(processingJobs).where(eq(processingJobs.id, id)).limit(1);
    return result[0];
  }
  async getUserProcessingJobs(userId) {
    return await db.select().from(processingJobs).where(eq(processingJobs.userId, userId)).orderBy(desc(processingJobs.createdAt));
  }
  async updateProcessingJobStatus(id, status, processedImages, zipUrl) {
    const updateData = { status, processedImages };
    if (zipUrl) {
      updateData.zipUrl = zipUrl;
    }
    if (status === "completed") {
      updateData.completedAt = /* @__PURE__ */ new Date();
    }
    await db.update(processingJobs).set(updateData).where(eq(processingJobs.id, id));
  }
  // Images
  async createImage(insertImage) {
    await db.insert(images).values(insertImage);
    const result = await db.select().from(images).where(and(eq(images.jobId, insertImage.jobId), eq(images.originalUrl, insertImage.originalUrl))).orderBy(desc(images.createdAt)).limit(1);
    return result[0];
  }
  async getJobImages(jobId) {
    return await db.select().from(images).where(eq(images.jobId, jobId));
  }
  async getImagesByIds(imageIds, userId) {
    const result = await db.select({
      image: images
    }).from(images).innerJoin(processingJobs, eq(images.jobId, processingJobs.id)).where(
      and(
        inArray(images.id, imageIds),
        eq(processingJobs.userId, userId)
      )
    );
    return result.map((r) => r.image);
  }
  async updateImageStatus(id, status, processedUrl) {
    const updateData = { status };
    if (processedUrl) {
      updateData.processedUrl = processedUrl;
    }
    await db.update(images).set(updateData).where(eq(images.id, id));
  }
  async deleteImage(id, userId) {
    const result = await db.select({ jobId: images.jobId }).from(images).innerJoin(processingJobs, eq(images.jobId, processingJobs.id)).where(
      and(
        eq(images.id, id),
        eq(processingJobs.userId, userId)
      )
    ).limit(1);
    if (result.length === 0) {
      throw new Error("Image not found or access denied");
    }
    await db.delete(images).where(eq(images.id, id));
  }
  // Transactions
  async createTransaction(insertTransaction) {
    await db.insert(transactions).values(insertTransaction);
    const result = await db.select().from(transactions).where(and(eq(transactions.userId, insertTransaction.userId), eq(transactions.type, insertTransaction.type))).orderBy(desc(transactions.createdAt)).limit(1);
    return result[0];
  }
  async getUserTransactions(userId) {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }
  // Template Favorites
  async addTemplateFavorite(userId, templateId) {
    await db.insert(templateFavorites).values({ userId, templateId });
    const result = await db.select().from(templateFavorites).where(and(eq(templateFavorites.userId, userId), eq(templateFavorites.templateId, templateId))).orderBy(desc(templateFavorites.createdAt)).limit(1);
    return result[0];
  }
  async removeTemplateFavorite(userId, templateId) {
    await db.delete(templateFavorites).where(
      and(
        eq(templateFavorites.userId, userId),
        eq(templateFavorites.templateId, templateId)
      )
    );
  }
  async getUserFavorites(userId) {
    return await db.select().from(templateFavorites).where(eq(templateFavorites.userId, userId));
  }
  // Audit Logs - Security tracking for SaaS
  async createAuditLog(log2) {
    await db.insert(auditLogs).values(log2);
    const result = await db.select().from(auditLogs).where(and(eq(auditLogs.userId, log2.userId || ""), eq(auditLogs.action, log2.action))).orderBy(desc(auditLogs.createdAt)).limit(1);
    return result[0];
  }
  async getUserAuditLogs(userId) {
    return await db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).orderBy(desc(auditLogs.createdAt)).limit(100);
  }
  // Coin Packages - Admin defines pricing
  async getAllCoinPackages() {
    return await db.select().from(coinPackages).orderBy(coinPackages.displayOrder, desc(coinPackages.createdAt));
  }
  async getActiveCoinPackages() {
    return await db.select().from(coinPackages).where(eq(coinPackages.isActive, true)).orderBy(coinPackages.displayOrder);
  }
  async getCoinPackage(id) {
    const result = await db.select().from(coinPackages).where(eq(coinPackages.id, id)).limit(1);
    return result[0];
  }
  async createCoinPackage(pkg) {
    const insertResult = await db.insert(coinPackages).values(pkg);
    const result = await db.select().from(coinPackages).where(eq(coinPackages.name, pkg.name)).orderBy(desc(coinPackages.createdAt)).limit(1);
    return result[0];
  }
  async updateCoinPackage(id, data) {
    await db.update(coinPackages).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(coinPackages.id, id));
  }
  async deleteCoinPackage(id) {
    await db.delete(coinPackages).where(eq(coinPackages.id, id));
  }
  // Manual Transactions - WhatsApp payment tracking
  async getAllManualTransactions() {
    return await db.select().from(manualTransactions).orderBy(desc(manualTransactions.createdAt));
  }
  async getManualTransaction(id) {
    const result = await db.select().from(manualTransactions).where(eq(manualTransactions.id, id)).limit(1);
    return result[0];
  }
  async getPendingManualTransactions() {
    return await db.select().from(manualTransactions).where(eq(manualTransactions.status, "pending")).orderBy(desc(manualTransactions.createdAt));
  }
  async getUserManualTransactions(userId) {
    return await db.select().from(manualTransactions).where(eq(manualTransactions.userId, userId)).orderBy(desc(manualTransactions.createdAt));
  }
  async createManualTransaction(txn) {
    await db.insert(manualTransactions).values(txn);
    const result = await db.select().from(manualTransactions).where(eq(manualTransactions.userId, txn.userId)).orderBy(desc(manualTransactions.createdAt)).limit(1);
    return result[0];
  }
  async approveManualTransaction(id, adminId, adminNotes) {
    await db.transaction(async (tx) => {
      const result = await tx.select().from(manualTransactions).where(eq(manualTransactions.id, id)).limit(1);
      if (result.length === 0) {
        throw new Error("Manual transaction not found");
      }
      const mtxn = result[0];
      if (mtxn.status !== "pending") {
        throw new Error("Transaction is not pending");
      }
      await tx.update(users).set({ coinBalance: sql2`${users.coinBalance} + ${mtxn.coinAmount}` }).where(eq(users.id, mtxn.userId));
      await tx.insert(transactions).values({
        userId: mtxn.userId,
        type: "purchase",
        amount: mtxn.coinAmount,
        description: `Manual coin purchase - ${mtxn.paymentMethod}`,
        metadata: {
          manualTransactionId: id,
          paymentReference: mtxn.paymentReference,
          adminId
        }
      });
      await tx.update(manualTransactions).set({
        status: "completed",
        adminId,
        adminNotes: adminNotes || mtxn.adminNotes,
        approvedAt: /* @__PURE__ */ new Date(),
        completedAt: /* @__PURE__ */ new Date()
      }).where(eq(manualTransactions.id, id));
    });
  }
  async rejectManualTransaction(id, adminId, adminNotes) {
    await db.update(manualTransactions).set({
      status: "rejected",
      adminId,
      adminNotes
    }).where(eq(manualTransactions.id, id));
  }
  // Media Library
  async createMediaLibraryEntry(entry) {
    await db.insert(mediaLibrary).values(entry);
    const result = await db.select().from(mediaLibrary).where(and(eq(mediaLibrary.userId, entry.userId), eq(mediaLibrary.fileName, entry.fileName))).orderBy(desc(mediaLibrary.createdAt)).limit(1);
    return result[0];
  }
  async getUserMediaLibrary(userId) {
    return await db.select().from(mediaLibrary).where(eq(mediaLibrary.userId, userId)).orderBy(desc(mediaLibrary.createdAt));
  }
  async getMediaLibraryEntry(id) {
    const result = await db.select().from(mediaLibrary).where(eq(mediaLibrary.id, id)).limit(1);
    return result[0];
  }
  async toggleMediaFavorite(id, isFavorite) {
    await db.update(mediaLibrary).set({ isFavorite }).where(eq(mediaLibrary.id, id));
  }
  async deleteMediaLibraryEntry(id) {
    await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id));
  }
  // Referrals
  async generateReferralCode(userId) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.referralCode) {
      return user.referralCode;
    }
    const namePrefix = user.name?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referralCode = `DRISYA-${namePrefix}${randomSuffix}`;
    await db.update(users).set({ referralCode }).where(eq(users.id, userId));
    return referralCode;
  }
  async getUserReferralCode(userId) {
    const user = await this.getUser(userId);
    return user?.referralCode || null;
  }
  async getUserByReferralCode(code) {
    const result = await db.select().from(users).where(eq(users.referralCode, code)).limit(1);
    return result[0];
  }
  async createReferral(referral) {
    await db.insert(referrals).values(referral);
    const result = await db.select().from(referrals).where(eq(referrals.referralCode, referral.referralCode)).orderBy(desc(referrals.createdAt)).limit(1);
    return result[0];
  }
  async getUserReferrals(userId) {
    return await db.select().from(referrals).where(eq(referrals.referrerId, userId)).orderBy(desc(referrals.createdAt));
  }
  async getReferralStats(userId) {
    const userReferrals = await this.getUserReferrals(userId);
    const totalReferrals = userReferrals.length;
    const completedReferrals = userReferrals.filter((r) => r.status === "completed").length;
    const pendingReferrals = userReferrals.filter((r) => r.status === "pending").length;
    const totalCoinsEarned = userReferrals.reduce((sum2, r) => sum2 + r.coinsEarned, 0);
    return {
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      totalCoinsEarned
    };
  }
  async completeReferral(referralCode, referredUserId) {
    await db.transaction(async (tx) => {
      const result = await tx.select().from(referrals).where(eq(referrals.referralCode, referralCode)).limit(1);
      const referral = result[0];
      if (!referral) {
        throw new Error("Referral not found");
      }
      await tx.update(referrals).set({
        referredUserId,
        status: "completed",
        coinsEarned: 50,
        completedAt: /* @__PURE__ */ new Date()
      }).where(eq(referrals.id, referral.id));
      await tx.update(users).set({
        coinBalance: sql2`${users.coinBalance} + 50`
      }).where(eq(users.id, referral.referrerId));
      await tx.insert(transactions).values({
        userId: referral.referrerId,
        type: "referral",
        amount: 50,
        description: "Referral bonus - Friend signed up",
        metadata: { referralId: referral.id, referredUserId }
      });
    });
  }
  // AI Edits - AI-powered image editing
  async createAIEdit(edit) {
    if (!edit.userId) {
      throw new Error("userId is required for AI edit creation");
    }
    await db.insert(aiEdits).values(edit);
    const result = await db.select().from(aiEdits).where(and(eq(aiEdits.userId, edit.userId), eq(aiEdits.prompt, edit.prompt))).orderBy(desc(aiEdits.createdAt)).limit(1);
    return result[0];
  }
  async getAIEdit(id) {
    const result = await db.select().from(aiEdits).where(eq(aiEdits.id, id)).limit(1);
    return result[0];
  }
  async updateAIEdit(id, data) {
    await db.update(aiEdits).set(data).where(eq(aiEdits.id, id));
  }
  async listUserAIEdits(userId) {
    return await db.select().from(aiEdits).where(eq(aiEdits.userId, userId)).orderBy(desc(aiEdits.createdAt));
  }
  // AI Usage Tracking - Monthly quota management
  async getOrCreateAIUsage(userId) {
    const currentMonth = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
    const existing = await db.select().from(aiUsageLedger).where(eq(aiUsageLedger.userId, userId)).limit(1);
    if (existing[0]) {
      if (existing[0].month !== currentMonth) {
        await db.update(aiUsageLedger).set({
          month: currentMonth,
          freeRequests: 0,
          paidRequests: 0,
          totalCost: 0,
          lastReset: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(aiUsageLedger.userId, userId));
        return await this.getOrCreateAIUsage(userId);
      }
      return existing[0];
    }
    await db.insert(aiUsageLedger).values({ userId });
    const result = await db.select().from(aiUsageLedger).where(eq(aiUsageLedger.userId, userId)).limit(1);
    return result[0];
  }
  async incrementAIUsage(userId, isFree, cost) {
    const usage = await this.getOrCreateAIUsage(userId);
    await db.update(aiUsageLedger).set({
      freeRequests: isFree ? usage.freeRequests + 1 : usage.freeRequests,
      paidRequests: !isFree ? usage.paidRequests + 1 : usage.paidRequests,
      totalCost: usage.totalCost + cost,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(aiUsageLedger.userId, userId));
  }
  async checkAIQuota(userId) {
    const usage = await this.getOrCreateAIUsage(userId);
    const freeLimit = 1e3;
    const remaining = freeLimit - usage.freeRequests;
    const canUse = remaining > 0;
    return {
      canUse,
      remaining: Math.max(0, remaining),
      limit: freeLimit,
      used: usage.freeRequests
    };
  }
  async resetMonthlyAIUsage(userId) {
    const currentMonth = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
    await db.update(aiUsageLedger).set({
      month: currentMonth,
      freeRequests: 0,
      paidRequests: 0,
      totalCost: 0,
      lastReset: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(aiUsageLedger.userId, userId));
  }
};
var storage = new DbStorage();

// server/routes.ts
import bcrypt2 from "bcrypt";
import multer3 from "multer";
import path5 from "path";
import fs6 from "fs/promises";
import { createWriteStream } from "fs";
import archiver from "archiver";
import AdmZip from "adm-zip";
init_email();

// server/services/huggingfaceClient.ts
var HuggingFaceClient = class {
  constructor(apiKey) {
    this.baseUrl = "https://api-inference.huggingface.co/models";
    // Model configurations
    this.models = {
      "qwen-2509": "Qwen/Qwen-Image-Edit-2509",
      "flux-kontext": "black-forest-labs/FLUX.1-Kontext-dev",
      "auto": "Qwen/Qwen-Image-Edit-2509"
      // Default to Qwen for e-commerce
    };
    this.apiKey = apiKey || process.env.HF_API_TOKEN || "";
    if (!this.apiKey) {
      console.warn("\u26A0\uFE0F HF_API_TOKEN not set. AI editing will use fallback mode.");
    }
  }
  /**
   * Convert absolute Replit URL to localhost to avoid helium proxy
   */
  getLocalUrl(url) {
    if (url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1")) {
      return url;
    }
    if (url.includes(".repl.co/uploads/") || url.includes("/uploads/")) {
      const path9 = url.substring(url.indexOf("/uploads/"));
      return `http://localhost:${process.env.PORT || 5e3}${path9}`;
    }
    return url;
  }
  /**
   * Edit an image using AI model with custom prompt
   */
  async editImage(imageUrl, prompt, modelKey = "auto") {
    try {
      const modelName = this.models[modelKey] || this.models.auto;
      console.log(`\u{1F916} Calling HuggingFace model: ${modelName}`);
      console.log(`\u{1F4DD} Prompt: ${prompt}`);
      const localUrl = this.getLocalUrl(imageUrl);
      console.log(`\u{1F4E5} Fetching image from: ${localUrl}`);
      const imageResponse = await fetch(localUrl);
      const imageArrayBuffer = await imageResponse.arrayBuffer();
      const imageBuffer = Buffer.from(imageArrayBuffer);
      const response = await fetch(`${this.baseUrl}/${modelName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: {
            image: imageBuffer.toString("base64"),
            prompt
          }
        })
      });
      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        console.warn(`\u23F3 Rate limited. Retry after: ${retryAfter}s`);
        throw new Error(`RATE_LIMITED:${retryAfter || "60"}`);
      }
      if (!response.ok) {
        const error = await response.text();
        console.error(`\u274C HF API Error (${response.status}):`, error);
        throw new Error(`HF_API_ERROR:${response.status}:${error}`);
      }
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const json2 = await response.json();
        if (json2.error?.includes("loading")) {
          console.warn("\u{1F504} Model is loading. Estimated time:", json2.estimated_time);
          throw new Error(`MODEL_LOADING:${json2.estimated_time || 20}`);
        }
      }
      const resultArrayBuffer = await response.arrayBuffer();
      const resultBuffer = Buffer.from(resultArrayBuffer);
      console.log(`\u2705 HuggingFace processing successful (${resultBuffer.length} bytes)`);
      return resultBuffer;
    } catch (error) {
      console.error("\u274C HuggingFace client error:", error.message);
      if (error.message.startsWith("RATE_LIMITED:") || error.message.startsWith("MODEL_LOADING:") || error.message.startsWith("HF_API_ERROR:")) {
        throw error;
      }
      throw new Error(`HF_CLIENT_ERROR:${error.message}`);
    }
  }
  /**
   * Fallback to local Python service when HF API fails
   */
  async fallbackToLocal(imageUrl, prompt, quality = "4k") {
    console.log("\u{1F527} Falling back to local Python service...");
    try {
      const localUrl = this.getLocalUrl(imageUrl);
      const response = await fetch("http://127.0.0.1:5001/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: localUrl,
          prompt,
          quality,
          // '4k', 'hd', or 'standard'
          model: "local"
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`\u274C Python service error: ${errorText}`);
        throw new Error(`Local service error: ${response.status} - ${errorText}`);
      }
      const resultArrayBuffer = await response.arrayBuffer();
      const resultBuffer = Buffer.from(resultArrayBuffer);
      console.log(`\u2705 Local processing successful (${resultBuffer.length} bytes) at ${quality} quality`);
      return resultBuffer;
    } catch (error) {
      console.error("\u274C Local fallback failed:", error.message);
      throw new Error(`LOCAL_FALLBACK_ERROR:${error.message}`);
    }
  }
  /**
   * Smart processing: Try HF API first, fallback to local if needed
   */
  async processWithFallback(imageUrl, prompt, modelKey = "auto", quality = "4k") {
    try {
      const buffer = await this.editImage(imageUrl, prompt, modelKey);
      if (buffer) {
        return { buffer, usedFallback: false };
      }
      throw new Error("No buffer returned");
    } catch (error) {
      console.warn("\u{1F504} HF API failed, trying local fallback...");
      const buffer = await this.fallbackToLocal(imageUrl, prompt, quality);
      if (!buffer) {
        throw new Error("Both HF API and local fallback failed");
      }
      return { buffer, usedFallback: true };
    }
  }
  /**
   * Check if we have a valid API key
   */
  hasApiKey() {
    return !!this.apiKey && this.apiKey.length > 0;
  }
  /**
   * Get available models
   */
  getAvailableModels() {
    return Object.keys(this.models);
  }
};
var huggingFaceClient = new HuggingFaceClient();

// server/queues/aiEditQueue.ts
import { promises as fs } from "fs";
import path from "path";
var AIEditQueue = class {
  constructor() {
    this.processing = /* @__PURE__ */ new Set();
    this.maxConcurrent = 20;
  }
  // Process up to 20 images simultaneously
  /**
   * Process multiple edits in parallel for high-speed batch processing
   */
  async processBatch(editIds) {
    const results = {
      completed: 0,
      failed: 0,
      total: editIds.length
    };
    console.log(`\u{1F680} Starting batch processing of ${editIds.length} images with ${this.maxConcurrent} concurrent workers`);
    for (let i = 0; i < editIds.length; i += this.maxConcurrent) {
      const chunk = editIds.slice(i, i + this.maxConcurrent);
      const chunkResults = await Promise.allSettled(
        chunk.map((editId) => this.processEdit(editId))
      );
      chunkResults.forEach((result) => {
        if (result.status === "fulfilled") {
          results.completed++;
        } else {
          results.failed++;
        }
      });
      console.log(`\u{1F4CA} Batch progress: ${results.completed + results.failed}/${results.total} images processed`);
    }
    console.log(`\u2705 Batch complete: ${results.completed} succeeded, ${results.failed} failed out of ${results.total}`);
    return results;
  }
  /**
   * Convert relative URL to absolute URL for external APIs
   */
  getAbsoluteUrl(relativeUrl) {
    if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
      return relativeUrl;
    }
    const baseUrl = process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : `http://localhost:${process.env.PORT || 5e3}`;
    const url = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
    return `${baseUrl}${url}`;
  }
  /**
   * Process an AI edit request with full error handling and retries
   */
  async processEdit(editId) {
    if (this.processing.has(editId)) {
      console.log(`\u23ED\uFE0F Edit ${editId} is already being processed, skipping`);
      return;
    }
    this.processing.add(editId);
    try {
      const edit = await storage.getAIEdit(editId);
      if (!edit) {
        throw new Error("Edit record not found");
      }
      console.log(`\u{1F3A8} Processing AI edit ${editId} for user ${edit.userId}`);
      const quotaCheck = await storage.checkAIQuota(edit.userId);
      if (!quotaCheck.canUse) {
        throw new Error(
          `User has exceeded AI quota. Used: ${quotaCheck.used}/${quotaCheck.limit}`
        );
      }
      await storage.updateAIEdit(editId, {
        status: "processing",
        metadata: {
          startedAt: (/* @__PURE__ */ new Date()).toISOString(),
          retryCount: 0
        }
      });
      const absoluteImageUrl = this.getAbsoluteUrl(edit.inputImageUrl);
      console.log(`\u{1F4F8} Input image URL: ${absoluteImageUrl}`);
      const result = await this.processWithRetry(absoluteImageUrl, edit.prompt, edit.aiModel, edit.quality || "4k");
      const outputUrl = await this.uploadResult(result.buffer, editId);
      await storage.updateAIEdit(editId, {
        status: "completed",
        outputImageUrl: outputUrl,
        cost: result.cost,
        completedAt: /* @__PURE__ */ new Date(),
        metadata: {
          usedFallback: result.usedFallback,
          processingTime: Date.now() - new Date(edit.createdAt).getTime()
        }
      });
      const isFree = result.cost === 0;
      await storage.incrementAIUsage(edit.userId, isFree, result.cost);
      console.log(`\u2705 AI edit ${editId} completed successfully`);
    } catch (error) {
      console.error(`\u274C AI edit ${editId} failed:`, error.message);
      await this.handleError(editId, error);
    } finally {
      this.processing.delete(editId);
    }
  }
  /**
   * Process image with retry logic for rate limits and model loading
   */
  async processWithRetry(imageUrl, prompt, modelKey = "auto", quality = "4k") {
    const rateLimitConfig = { maxAttempts: 3, currentAttempt: 0 };
    const modelLoadingConfig = { maxAttempts: 2, currentAttempt: 0 };
    while (rateLimitConfig.currentAttempt < rateLimitConfig.maxAttempts) {
      try {
        const buffer = await huggingFaceClient.editImage(imageUrl, prompt, modelKey);
        if (buffer) {
          return { buffer, cost: 0, usedFallback: false };
        }
        throw new Error("No buffer returned from HF API");
      } catch (error) {
        const errorMsg = error.message || "";
        if (errorMsg.startsWith("RATE_LIMITED:")) {
          const retryAfter = parseInt(errorMsg.split(":")[1] || "60");
          rateLimitConfig.currentAttempt++;
          if (rateLimitConfig.currentAttempt < rateLimitConfig.maxAttempts) {
            const waitTime = retryAfter * Math.pow(2, rateLimitConfig.currentAttempt - 1);
            console.log(
              `\u23F3 Rate limited. Waiting ${waitTime}s before retry ${rateLimitConfig.currentAttempt}/${rateLimitConfig.maxAttempts}`
            );
            await this.sleep(waitTime * 1e3);
            continue;
          } else {
            console.log("\u{1F504} Max rate limit retries reached, trying fallback...");
            break;
          }
        }
        if (errorMsg.startsWith("MODEL_LOADING:")) {
          const estimatedTime = parseInt(errorMsg.split(":")[1] || "20");
          modelLoadingConfig.currentAttempt++;
          if (modelLoadingConfig.currentAttempt < modelLoadingConfig.maxAttempts) {
            console.log(
              `\u{1F504} Model loading. Waiting ${estimatedTime}s before retry ${modelLoadingConfig.currentAttempt}/${modelLoadingConfig.maxAttempts}`
            );
            await this.sleep(estimatedTime * 1e3);
            continue;
          } else {
            console.log("\u{1F504} Model still loading after retries, trying fallback...");
            break;
          }
        }
        if (errorMsg.startsWith("HF_API_ERROR:")) {
          console.log("\u274C HF API error, trying fallback...");
          break;
        }
        console.log(`\u26A0\uFE0F Unexpected error: ${errorMsg}, trying fallback...`);
        break;
      }
    }
    console.log(`\u{1F527} Using local fallback service at ${quality} quality...`);
    try {
      const buffer = await huggingFaceClient.fallbackToLocal(imageUrl, prompt, quality);
      if (!buffer) {
        throw new Error("Local fallback returned no buffer");
      }
      return { buffer, cost: 0, usedFallback: true };
    } catch (fallbackError) {
      throw new Error(`Both HF API and local fallback failed: ${fallbackError.message}`);
    }
  }
  /**
   * Upload processed image result to storage
   */
  async uploadResult(buffer, editId) {
    const uploadsDir = path.join(process.cwd(), "uploads", "ai-edits");
    await fs.mkdir(uploadsDir, { recursive: true });
    const filename = `${editId}.png`;
    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, buffer);
    const url = `/uploads/ai-edits/${filename}`;
    console.log(`\u{1F4C1} Uploaded result to ${url}`);
    return url;
  }
  /**
   * Handle processing errors
   */
  async handleError(editId, error) {
    const errorMessage = error.message || "Unknown error";
    try {
      await storage.updateAIEdit(editId, {
        status: "failed",
        errorMessage,
        completedAt: /* @__PURE__ */ new Date(),
        metadata: {
          errorType: this.getErrorType(errorMessage),
          failedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    } catch (updateError) {
      console.error("Failed to update error status:", updateError.message);
    }
  }
  /**
   * Classify error type for analytics
   */
  getErrorType(errorMessage) {
    if (errorMessage.includes("quota")) return "QUOTA_EXCEEDED";
    if (errorMessage.includes("RATE_LIMITED")) return "RATE_LIMITED";
    if (errorMessage.includes("MODEL_LOADING")) return "MODEL_LOADING";
    if (errorMessage.includes("HF_API_ERROR")) return "API_ERROR";
    if (errorMessage.includes("fallback")) return "FALLBACK_FAILED";
    return "UNKNOWN_ERROR";
  }
  /**
   * Sleep utility for retries
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Get current processing status
   */
  getProcessingCount() {
    return this.processing.size;
  }
  /**
   * Check if an edit is currently processing
   */
  isProcessing(editId) {
    return this.processing.has(editId);
  }
};
var aiEditQueue = new AIEditQueue();

// server/services/jewelryAIGenerator.ts
import fs2 from "fs/promises";
import path2 from "path";
var JewelryAIGenerator = class {
  constructor() {
    this.outputDir = "uploads/generated";
    this.ensureOutputDirectory();
  }
  async ensureOutputDirectory() {
    try {
      await fs2.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create output directory:", error);
    }
  }
  /**
   * Generate jewelry background image using AI
   */
  async generateJewelryBackground(request) {
    const startTime = Date.now();
    try {
      console.log(`\u{1F3A8} Starting jewelry background generation for user ${request.userId}`);
      console.log(`\u{1F4DD} Template: ${request.templateName}`);
      console.log(`\u{1F5BC}\uFE0F Input image: ${request.imageUrl}`);
      const fullPrompt = this.buildJewelryPrompt(request.templatePrompt, request.outputSize);
      console.log(`\u{1F916} AI Prompt: ${fullPrompt}`);
      const { buffer, usedFallback } = await huggingFaceClient.processWithFallback(
        request.imageUrl,
        fullPrompt,
        "auto",
        // Use auto model selection
        request.quality || "4k"
      );
      const filename = `jewelry_${request.userId}_${Date.now()}.png`;
      const outputPath = path2.join(this.outputDir, filename);
      await fs2.writeFile(outputPath, buffer);
      const imageUrl = `/uploads/generated/${filename}`;
      const processingTime = Date.now() - startTime;
      console.log(`\u2705 Jewelry background generated successfully in ${processingTime}ms`);
      console.log(`\u{1F4BE} Saved to: ${imageUrl}`);
      return {
        success: true,
        imageUrl,
        usedFallback,
        processingTime,
        cost: this.calculateCost(request.quality, usedFallback)
      };
    } catch (error) {
      console.error("\u274C Jewelry generation failed:", error.message);
      const processingTime = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        usedFallback: false,
        processingTime,
        cost: 0
      };
    }
  }
  /**
   * Build comprehensive prompt for jewelry background generation
   */
  buildJewelryPrompt(templatePrompt, outputSize) {
    const basePrompt = `
      ${templatePrompt}
      
      CRITICAL REQUIREMENTS:
      - Preserve the exact jewelry design, shape, color, and metallic properties
      - Maintain all gemstone colors and clarity exactly as shown
      - Keep jewelry proportions and details unchanged
      - Only modify the background and lighting environment
      - Ensure realistic shadows and reflections that enhance the jewelry
      - Output high-quality, professional product photography
      - Resolution: ${outputSize || "1080x1080"} pixels
      - Style: Premium luxury jewelry photography
    `.trim();
    return basePrompt;
  }
  /**
   * Calculate cost based on quality and service used
   */
  calculateCost(quality, usedFallback) {
    if (usedFallback) {
      return 0;
    }
    const costs = {
      "standard": 2,
      "hd": 5,
      "4k": 10
    };
    return costs[quality] || costs["4k"];
  }
  /**
   * Get generation statistics
   */
  async getGenerationStats(userId) {
    return {
      totalGenerations: 0,
      totalCost: 0,
      averageProcessingTime: 0
    };
  }
  /**
   * Clean up old generated files (optional maintenance)
   */
  async cleanupOldFiles(olderThanDays = 30) {
    try {
      const files = await fs2.readdir(this.outputDir);
      const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1e3;
      for (const file of files) {
        const filePath = path2.join(this.outputDir, file);
        const stats = await fs2.stat(filePath);
        if (stats.mtime.getTime() < cutoffTime) {
          await fs2.unlink(filePath);
          console.log(`\u{1F5D1}\uFE0F Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      console.error("Failed to cleanup old files:", error);
    }
  }
};
var jewelryAIGenerator = new JewelryAIGenerator();

// server/routes/openaiRoutes.ts
import multer from "multer";
import path3 from "path";
import fs4 from "fs/promises";

// server/services/openaiImageEnhancer.ts
import axios from "axios";
import fs3 from "fs/promises";
import FormData from "form-data";
import dotenv2 from "dotenv";
dotenv2.config();
var OpenAIImageEnhancer = class {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
    this.baseUrl = "https://api.openai.com/v1";
    this.maxRetries = 3;
    this.timeout = 12e4;
  }
  /**
   * Sleep utility for rate limiting
   */
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Make API call with retry logic and rate limiting
   */
  async makeAPICall(endpoint, data, options = {}) {
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await axios({
          method: options.method || "POST",
          url: `${this.baseUrl}${endpoint}`,
          data,
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "User-Agent": "DrisyaAI-JewelryEnhancer/1.0",
            ...options.headers
          },
          timeout: this.timeout,
          ...options
        });
        return response;
      } catch (error) {
        retries++;
        if (error.response?.status === 429 && retries < this.maxRetries) {
          const retryAfter = error.response.headers["retry-after"] || Math.pow(2, retries);
          console.log(`\u23F3 Rate limited. Retrying in ${retryAfter} seconds...`);
          await this.sleep(retryAfter * 1e3);
          continue;
        }
        if (error.response?.status >= 500 && retries < this.maxRetries) {
          console.log(`\u{1F504} Server error. Retry ${retries}/${this.maxRetries}...`);
          await this.sleep(1e3 * retries);
          continue;
        }
        throw error;
      }
    }
  }
  /**
   * Enhance image using OpenAI DALL-E API
   */
  async enhanceImage(options) {
    const startTime = Date.now();
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: "OpenAI API key not configured"
        };
      }
      try {
        await fs3.access(options.inputPath);
      } catch {
        return {
          success: false,
          error: "Input image not found"
        };
      }
      console.log("\u{1F916} Using OpenAI DALL-E for enhancement...");
      console.log(`\u{1F4DD} Prompt: ${options.prompt.substring(0, 100)}...`);
      const enhancedPrompt = this.preparePrompt(options.prompt, options.isBlurred, options.quality);
      let result = await this.tryDALLE3ImageEdit(options, enhancedPrompt);
      if (!result.success) {
        result = await this.tryDALLE3Generation(options, enhancedPrompt);
      }
      const processingTime = Date.now() - startTime;
      return {
        ...result,
        processingTime
      };
    } catch (error) {
      console.error("OpenAI enhancement error:", error);
      return {
        success: false,
        error: error.message || "OpenAI enhancement failed"
      };
    }
  }
  preparePrompt(basePrompt, isBlurred, quality) {
    let enhancedPrompt = basePrompt;
    if (isBlurred) {
      enhancedPrompt += " Remove any blur and enhance image clarity. Sharpen all details and improve focus.";
    }
    switch (quality) {
      case "high":
        enhancedPrompt += " Create high quality output with enhanced details, vibrant colors, and professional finish.";
        break;
      case "ultra":
        enhancedPrompt += " Create ultra high quality output with maximum detail enhancement, perfect lighting, professional studio quality.";
        break;
      default:
        enhancedPrompt += " Create standard quality output with good detail preservation.";
    }
    return enhancedPrompt;
  }
  /**
   * Try DALL-E 3 Image Edit API with developer mode features
   */
  async tryDALLE3ImageEdit(options, prompt) {
    try {
      console.log("\u{1F3A8} Trying DALL-E 3 Image Edit (Developer Mode)...");
      const imageBuffer = await fs3.readFile(options.inputPath);
      if (imageBuffer.length > 4 * 1024 * 1024) {
        return {
          success: false,
          error: "Image too large. Maximum size is 4MB for DALL-E"
        };
      }
      const formData = new FormData();
      formData.append("image", imageBuffer, "image.png");
      formData.append("prompt", prompt);
      formData.append("n", "1");
      formData.append("size", "1024x1024");
      formData.append("response_format", "url");
      const response = await this.makeAPICall("/images/edits", formData, {
        headers: formData.getHeaders()
      });
      if (response.data.data && response.data.data.length > 0) {
        const imageUrl = response.data.data[0].url;
        await this.downloadImage(imageUrl, options.outputPath);
        console.log("\u2705 DALL-E 3 Image Edit successful (Developer Mode)!");
        return {
          success: true,
          outputUrl: options.outputPath,
          metadata: {
            model: "dall-e-3-edit",
            method: "image_edit",
            prompt: prompt.substring(0, 200),
            quality: options.quality,
            size: "1024x1024",
            cost_estimate: 0.02,
            // Image edit pricing
            developer_mode: true
          }
        };
      }
      return { success: false, error: "No image generated by DALL-E 3 Edit" };
    } catch (error) {
      console.error("\u274C DALL-E 3 Image Edit failed:", error);
      let errorMessage = "DALL-E 3 Image Edit failed";
      let suggestions = [];
      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        errorMessage = `DALL-E 3 Edit failed: ${apiError.message}`;
        if (apiError.type === "insufficient_quota") {
          suggestions.push("Add more credits to your OpenAI account");
          suggestions.push("Check billing limits at https://platform.openai.com/account/billing");
        } else if (apiError.code === "invalid_image_format") {
          suggestions.push("Convert image to PNG format");
          suggestions.push("Ensure image is under 4MB");
        }
      }
      return {
        success: false,
        error: errorMessage,
        metadata: {
          suggestions,
          developer_mode: true
        }
      };
    }
  }
  /**
   * Try DALL-E 3 Generation (fallback)
   */
  async tryDALLE3Generation(options, prompt) {
    try {
      console.log("\u{1F3A8} Trying DALL-E 3 Generation...");
      const generationPrompt = `Create a luxury jewelry photography image: ${prompt}`;
      const response = await axios.post(
        `${this.baseUrl}/images/generations`,
        {
          model: "dall-e-3",
          prompt: generationPrompt,
          n: 1,
          size: "1024x1024",
          quality: options.quality === "ultra" ? "hd" : "standard",
          response_format: "url"
        },
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 6e4
        }
      );
      if (response.data.data && response.data.data.length > 0) {
        const imageUrl = response.data.data[0].url;
        await this.downloadImage(imageUrl, options.outputPath);
        console.log("\u2705 DALL-E 3 Generation successful!");
        return {
          success: true,
          outputUrl: options.outputPath,
          metadata: {
            model: "dall-e-3-generation",
            prompt: generationPrompt.substring(0, 200),
            quality: options.quality,
            revised_prompt: response.data.data[0].revised_prompt
          }
        };
      }
      return { success: false, error: "No image generated by DALL-E 3" };
    } catch (error) {
      console.error("\u274C DALL-E 3 Generation failed:", error);
      let errorMessage = "DALL-E 3 Generation failed";
      if (error.response?.data?.error) {
        errorMessage = `DALL-E 3 failed: ${error.response.data.error.message}`;
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  /**
   * Download image from URL
   */
  async downloadImage(url, outputPath) {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    await fs3.writeFile(outputPath, response.data);
  }
  /**
   * Batch process multiple images
   */
  async batchEnhance(images2, prompt, quality = "standard", enableBlurDetection = true, onProgress) {
    const results = [];
    for (let i = 0; i < images2.length; i++) {
      const image = images2[i];
      const result = await this.enhanceImage({
        inputPath: image.inputPath,
        outputPath: image.outputPath,
        prompt,
        quality,
        isBlurred: enableBlurDetection
      });
      results.push({
        success: result.success,
        outputPath: result.success ? image.outputPath : void 0,
        error: result.error
      });
      if (onProgress) {
        onProgress(i + 1, images2.length);
      }
      if (i < images2.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 3e3));
      }
    }
    return results;
  }
};
var openaiImageEnhancer = new OpenAIImageEnhancer();

// server/routes/openaiRoutes.ts
var openaiUpload = multer({
  dest: "uploads/openai/",
  limits: {
    fileSize: 20 * 1024 * 1024,
    // 20MB limit for OpenAI
    files: 100
    // Max 100 files for batch processing
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WebP images are allowed for OpenAI"));
    }
  }
});
function registerOpenAIRoutes(app2) {
  app2.post("/api/openai/enhance", openaiUpload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No image provided" });
      }
      const { prompt, quality = "standard" } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required" });
      }
      console.log(`\u{1F916} OpenAI Enhancement Request:`);
      console.log(`   \u{1F4F8} Image: ${req.file.originalname} (${req.file.size} bytes)`);
      console.log(`   \u{1F4DD} Prompt: ${prompt.substring(0, 100)}...`);
      console.log(`   \u{1F3AF} Quality: ${quality}`);
      const inputPath = req.file.path;
      const outputFileName = `openai_enhanced_${Date.now()}.png`;
      const outputPath = path3.join("uploads", "processed", outputFileName);
      const outputUrl = `/uploads/processed/${outputFileName}`;
      await fs4.mkdir(path3.join("uploads", "processed"), { recursive: true });
      const result = await openaiImageEnhancer.enhanceImage({
        inputPath,
        outputPath,
        prompt,
        quality,
        isBlurred: false
        // You can add blur detection logic here
      });
      try {
        await fs4.unlink(inputPath);
      } catch (err) {
        console.error("Failed to cleanup input file:", err);
      }
      if (result.success) {
        console.log(`\u2705 OpenAI enhancement successful: ${outputUrl}`);
        console.log(`\u23F1\uFE0F Processing time: ${result.processingTime}ms`);
        res.json({
          success: true,
          outputUrl,
          processingTime: result.processingTime,
          metadata: result.metadata,
          model: result.metadata?.model || "dall-e-3"
        });
      } else {
        console.log(`\u274C OpenAI enhancement failed: ${result.error}`);
        res.status(500).json({
          success: false,
          error: result.error || "OpenAI enhancement failed"
        });
      }
    } catch (error) {
      console.error("OpenAI enhancement error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error"
      });
    }
  });
  app2.post("/api/openai/batch-enhance", openaiUpload.array("images", 100), async (req, res) => {
    try {
      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, error: "No images provided" });
      }
      const { prompt, quality = "standard" } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required" });
      }
      console.log(`\u{1F916} OpenAI Batch Enhancement:`);
      console.log(`   \u{1F4F8} Images: ${files.length}`);
      console.log(`   \u{1F4DD} Prompt: ${prompt.substring(0, 100)}...`);
      console.log(`   \u{1F3AF} Quality: ${quality}`);
      const imageJobs = files.map((file) => ({
        inputPath: file.path,
        outputPath: path3.join("uploads", "processed", `openai_batch_${Date.now()}_${Math.random().toString(36).substring(7)}.png`)
      }));
      await fs4.mkdir(path3.join("uploads", "processed"), { recursive: true });
      const results = await openaiImageEnhancer.batchEnhance(
        imageJobs,
        prompt,
        quality,
        true,
        // Enable blur detection
        (completed, total) => {
          console.log(`\u{1F4CA} Progress: ${completed}/${total} images processed`);
        }
      );
      for (const file of files) {
        try {
          await fs4.unlink(file.path);
        } catch (err) {
          console.error("Failed to cleanup input file:", err);
        }
      }
      const successfulResults = results.filter((r) => r.success);
      const failedResults = results.filter((r) => !r.success);
      const responseData = {
        success: true,
        totalImages: files.length,
        successful: successfulResults.length,
        failed: failedResults.length,
        results: results.map((result, index) => ({
          originalName: files[index].originalname,
          success: result.success,
          outputUrl: result.success ? `/uploads/processed/${path3.basename(result.outputPath)}` : null,
          error: result.error
        }))
      };
      console.log(`\u2705 Batch processing complete: ${successfulResults.length}/${files.length} successful`);
      res.json(responseData);
    } catch (error) {
      console.error("OpenAI batch enhancement error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Batch processing failed"
      });
    }
  });
  app2.get("/api/openai/status", async (req, res) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.json({
          configured: false,
          error: "OpenAI API key not configured"
        });
      }
      try {
        const testResponse = await fetch("https://api.openai.com/v1/models", {
          headers: {
            "Authorization": `Bearer ${apiKey}`
          }
        });
        if (testResponse.ok) {
          res.json({
            configured: true,
            connected: true,
            models: ["dall-e-3", "dall-e-2"],
            status: "Ready for image enhancement"
          });
        } else {
          res.json({
            configured: true,
            connected: false,
            error: "Invalid API key or connection failed"
          });
        }
      } catch (error) {
        res.json({
          configured: true,
          connected: false,
          error: error.message
        });
      }
    } catch (error) {
      res.status(500).json({
        configured: false,
        error: error.message || "Status check failed"
      });
    }
  });
  app2.post("/api/openai/simple-enhance", openaiUpload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Please upload an image"
        });
      }
      const defaultPrompt = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the jewelry design, colors, and composition remain exactly the same with no changes or alterations. Output size 1080x1080px.`;
      const { prompt = defaultPrompt, quality = "hd" } = req.body;
      console.log(`\u{1F3A8} ChatGPT-style Enhancement:`);
      console.log(`   \u{1F4F8} Input: ${req.file.originalname}`);
      console.log(`   \u{1F3AF} Using: DALL-E 3 ${quality} quality`);
      const inputPath = req.file.path;
      const outputFileName = `chatgpt_style_${Date.now()}.png`;
      const outputPath = path3.join("uploads", "processed", outputFileName);
      const outputUrl = `/uploads/processed/${outputFileName}`;
      await fs4.mkdir(path3.join("uploads", "processed"), { recursive: true });
      const result = await openaiImageEnhancer.enhanceImage({
        inputPath,
        outputPath,
        prompt,
        quality,
        isBlurred: false
      });
      try {
        await fs4.unlink(inputPath);
      } catch (err) {
        console.error("Cleanup failed:", err);
      }
      if (result.success) {
        res.json({
          success: true,
          message: "Image enhanced successfully with DALL-E 3",
          outputUrl,
          processingTime: result.processingTime,
          model: "dall-e-3",
          quality,
          prompt: prompt.substring(0, 100) + "..."
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || "Enhancement failed"
        });
      }
    } catch (error) {
      console.error("Simple enhancement error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error"
      });
    }
  });
}

// server/routes/templateAIRoutes.ts
import multer2 from "multer";
import path4 from "path";
import fs5 from "fs/promises";
import axios2 from "axios";
import FormData2 from "form-data";
var templateUpload = multer2({
  dest: "uploads/template-ai/",
  limits: {
    fileSize: 10 * 1024 * 1024,
    // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WebP images are allowed"));
    }
  }
});
function registerTemplateAIRoutes(app2) {
  app2.post("/api/template-ai/dark-blue-velvet", templateUpload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No image provided"
        });
      }
      console.log(`\u{1F48E} Dark Blue Velvet Template Enhancement:`);
      console.log(`   \u{1F4F8} Input: ${req.file.originalname} (${req.file.size} bytes)`);
      const inputPath = req.file.path;
      const outputFileName = `dark_blue_velvet_${Date.now()}.png`;
      const outputPath = path4.join("uploads", "processed", outputFileName);
      const outputUrl = `/uploads/processed/${outputFileName}`;
      await fs5.mkdir(path4.join("uploads", "processed"), { recursive: true });
      const templatePrompt = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the jewelry design, colors, and composition remain exactly the same with no changes or alterations. Output size 1080x1080px.`;
      const result = await callOpenAIImageEdit(inputPath, templatePrompt, outputPath);
      try {
        await fs5.unlink(inputPath);
      } catch (err) {
        console.error("Failed to cleanup input file:", err);
      }
      if (result.success) {
        console.log(`\u2705 Dark Blue Velvet enhancement successful: ${outputUrl}`);
        res.json({
          success: true,
          message: "Dark Blue Velvet template applied successfully",
          outputUrl,
          processingTime: result.processingTime,
          template: "Dark Blue Velvet Luxury",
          cost: result.cost || 0.04
        });
      } else {
        console.log(`\u274C Dark Blue Velvet enhancement failed: ${result.error}`);
        res.status(500).json({
          success: false,
          error: result.error || "Template enhancement failed"
        });
      }
    } catch (error) {
      console.error("Template enhancement error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error"
      });
    }
  });
  app2.post("/api/template-ai/enhance", templateUpload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No image provided"
        });
      }
      const { templateName, customPrompt } = req.body;
      if (!templateName && !customPrompt) {
        return res.status(400).json({
          success: false,
          error: "Template name or custom prompt is required"
        });
      }
      console.log(`\u{1F3A8} Template Enhancement:`);
      console.log(`   \u{1F4F8} Input: ${req.file.originalname}`);
      console.log(`   \u{1F3AF} Template: ${templateName || "Custom"}`);
      const inputPath = req.file.path;
      const outputFileName = `template_${Date.now()}.png`;
      const outputPath = path4.join("uploads", "processed", outputFileName);
      const outputUrl = `/uploads/processed/${outputFileName}`;
      await fs5.mkdir(path4.join("uploads", "processed"), { recursive: true });
      let prompt = customPrompt;
      if (templateName && !customPrompt) {
        prompt = getTemplatePrompt(templateName);
      }
      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: "No prompt available for this template"
        });
      }
      const result = await callOpenAIImageEdit(inputPath, prompt, outputPath);
      try {
        await fs5.unlink(inputPath);
      } catch (err) {
        console.error("Failed to cleanup input file:", err);
      }
      if (result.success) {
        res.json({
          success: true,
          message: "Template applied successfully",
          outputUrl,
          processingTime: result.processingTime,
          template: templateName || "Custom",
          cost: result.cost || 0.04
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || "Template enhancement failed"
        });
      }
    } catch (error) {
      console.error("Template enhancement error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error"
      });
    }
  });
  app2.post("/api/template-ai/jewelry-enhance", templateUpload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No image provided"
        });
      }
      const {
        jewelryName = "jewelry piece",
        backgroundStyle = "Velvet Blue",
        imageSize = "1080x1080",
        quality = "high"
      } = req.body;
      console.log(`\u{1F48E} Dynamic Jewelry Enhancement:`);
      console.log(`   \u{1F4F8} Input: ${req.file.originalname}`);
      console.log(`   \u{1F48D} Jewelry: ${jewelryName}`);
      console.log(`   \u{1F3A8} Background: ${backgroundStyle}`);
      const inputPath = req.file.path;
      const outputFileName = `jewelry_${backgroundStyle.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.png`;
      const outputPath = path4.join("uploads", "processed", outputFileName);
      const outputUrl = `/uploads/processed/${outputFileName}`;
      await fs5.mkdir(path4.join("uploads", "processed"), { recursive: true });
      const dynamicPrompt = generateJewelryPrompt(jewelryName, backgroundStyle);
      console.log(`\u{1F4DD} Generated Prompt: ${dynamicPrompt.substring(0, 100)}...`);
      const result = await callOpenAIImageEdit(inputPath, dynamicPrompt, outputPath);
      try {
        await fs5.unlink(inputPath);
      } catch (err) {
        console.error("Failed to cleanup input file:", err);
      }
      if (result.success) {
        res.json({
          success: true,
          message: "Jewelry enhancement completed successfully",
          outputUrl,
          processingTime: result.processingTime,
          jewelryName,
          backgroundStyle,
          prompt: dynamicPrompt.substring(0, 200) + "...",
          cost: result.cost || 0.04
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || "Jewelry enhancement failed"
        });
      }
    } catch (error) {
      console.error("Dynamic jewelry enhancement error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error"
      });
    }
  });
  app2.get("/api/template-ai/backgrounds", async (req, res) => {
    try {
      const backgrounds2 = Object.keys(backgroundTemplates).map((key) => ({
        id: key.toLowerCase().replace(/\s+/g, "-"),
        name: key,
        description: backgroundTemplates[key],
        category: "jewelry",
        cost: 0.04
      }));
      res.json({
        success: true,
        backgrounds: backgrounds2
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get background templates"
      });
    }
  });
  app2.get("/api/template-ai/templates", async (req, res) => {
    try {
      const templates2 = [
        {
          id: "dark-blue-velvet",
          name: "Dark Blue Velvet Luxury",
          category: "jewelry",
          description: "Elegant matte blue velvet background with cinematic lighting",
          cost: 0.04,
          endpoint: "/api/template-ai/dark-blue-velvet",
          backgroundStyle: "Velvet Blue"
        },
        {
          id: "marble-surface",
          name: "Marble Surface",
          category: "jewelry",
          description: "Clean white marble with natural veining",
          cost: 0.04,
          endpoint: "/api/template-ai/enhance",
          backgroundStyle: "White Marble"
        },
        {
          id: "silk-fabric",
          name: "Silk Fabric",
          category: "jewelry",
          description: "Smooth silk with soft folds and luxury feel",
          cost: 0.04,
          endpoint: "/api/template-ai/enhance",
          backgroundStyle: "Ivory Silk"
        },
        {
          id: "charcoal-suede",
          name: "Charcoal Grey Suede",
          category: "jewelry",
          description: "Rich charcoal grey suede with warm-toned lighting",
          cost: 0.04,
          endpoint: "/api/template-ai/jewelry-enhance",
          backgroundStyle: "Charcoal Grey Suede"
        },
        {
          id: "royal-purple",
          name: "Royal Purple Velvet",
          category: "jewelry",
          description: "Luxurious royal purple velvet with elegant highlights",
          cost: 0.04,
          endpoint: "/api/template-ai/jewelry-enhance",
          backgroundStyle: "Royal Purple Velvet"
        },
        {
          id: "emerald-suede",
          name: "Emerald Green Suede",
          category: "jewelry",
          description: "Deep emerald suede with cinematic lighting",
          cost: 0.04,
          endpoint: "/api/template-ai/jewelry-enhance",
          backgroundStyle: "Emerald Green Suede"
        }
      ];
      res.json({
        success: true,
        templates: templates2
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get templates"
      });
    }
  });
}
async function callOpenAIImageEdit(inputPath, prompt, outputPath) {
  const startTime = Date.now();
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key not configured. Please add a valid API key to your .env file or use the demo mode."
      };
    }
    if (!process.env.OPENAI_API_KEY.startsWith("sk-") || process.env.OPENAI_API_KEY.length < 40) {
      return {
        success: false,
        error: "Invalid OpenAI API key format. Please get a valid key from https://platform.openai.com/account/api-keys"
      };
    }
    if (process.env.OPENAI_API_KEY.includes("O8nc61SIB58fCFxpzHcjrPNh5vINPOdu9OhcmvkvWdp7fOK6") || process.env.OPENAI_API_KEY.includes("sk-O8nc61SIB58fCFxpzHcjrPNh5vINPOdu9OhcmvkvWdp7fOK6")) {
      console.log("\u{1F3AD} Demo mode: Using placeholder response for invalid API key");
      try {
        await fs5.copyFile(inputPath, outputPath);
        return {
          success: true,
          outputUrl: outputPath,
          processingTime: 2e3,
          cost: 0,
          metadata: {
            model: "demo-mode",
            note: "This is a demo response. Get a valid OpenAI API key for real AI enhancement."
          }
        };
      } catch (copyError) {
        return {
          success: false,
          error: "Demo mode failed: Could not copy image file"
        };
      }
    }
    console.log("\u{1F916} Calling OpenAI DALL-E 3 Image Edit...");
    console.log(`\u{1F4DD} Prompt: ${prompt.substring(0, 100)}...`);
    const imageBuffer = await fs5.readFile(inputPath);
    if (imageBuffer.length > 4 * 1024 * 1024) {
      return {
        success: false,
        error: "Image too large. Maximum size is 4MB for DALL-E"
      };
    }
    const formData = new FormData2();
    formData.append("image", imageBuffer, "image.png");
    formData.append("prompt", prompt);
    formData.append("size", "1024x1024");
    formData.append("n", "1");
    const response = await axios2.post("https://api.openai.com/v1/images/edits", formData, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      timeout: 6e4
      // 60 seconds timeout
    });
    if (response.data.data && response.data.data.length > 0) {
      const imageUrl = response.data.data[0].url;
      const imageResponse = await axios2.get(imageUrl, { responseType: "arraybuffer" });
      await fs5.writeFile(outputPath, imageResponse.data);
      console.log("\u2705 OpenAI DALL-E 3 Image Edit successful!");
      return {
        success: true,
        outputUrl: outputPath,
        processingTime: Date.now() - startTime,
        cost: 0.04
        // Approximate cost for DALL-E 3 image edit
      };
    }
    return {
      success: false,
      error: "No image generated by OpenAI"
    };
  } catch (error) {
    console.error("\u274C OpenAI API error:", error);
    let errorMessage = "OpenAI API failed";
    if (error.response?.data?.error) {
      errorMessage = `OpenAI API error: ${error.response.data.error.message}`;
    } else {
      errorMessage = `OpenAI API error: ${error.message}`;
    }
    return {
      success: false,
      error: errorMessage,
      processingTime: Date.now() - startTime
    };
  }
}
var backgroundTemplates = {
  "Velvet Blue": "a dark, elegant matte blue velvet or suede background with soft texture and moody lighting",
  "Charcoal Grey Suede": "a rich charcoal grey suede surface with fine shadows and warm-toned side lighting for contrast",
  "Ivory Silk": "a smooth ivory silk fabric background with gentle folds and soft diffused lighting",
  "Black Marble": "a polished black marble surface with subtle white veins and glossy highlights",
  "Walnut Wood": "a deep walnut wood table texture under directional daylight for a warm natural look",
  "Matte Beige Paper": "a soft matte beige paper background with studio lighting and shallow shadows for a clean minimal aesthetic",
  "Royal Purple Velvet": "a luxurious royal purple velvet surface with soft sheen and elegant highlights",
  "Emerald Green Suede": "a deep emerald suede background with cinematic window light and dramatic shading",
  "Rose Gold Silk": "a smooth rose gold silk fabric with subtle metallic sheen and warm lighting",
  "White Marble": "a clean white marble surface with natural veining and subtle texture",
  "Dark Wood": "a rich mahogany wood surface with natural grain texture and warm lighting",
  "Cream Leather": "a soft cream leather surface with natural texture and elegant studio lighting"
};
function generateJewelryPrompt(jewelryName, backgroundStyle) {
  const backgroundDescription = backgroundTemplates[backgroundStyle] || backgroundTemplates["Velvet Blue"];
  return `A high-end product photograph of ${jewelryName}, placed on ${backgroundDescription}. 
Use moody, directional lighting that casts realistic shadows in a criss-cross windowpane pattern, 
creating a dramatic and luxurious ambiance. The lighting should evoke a sense of evening or indoor light 
streaming through a window, with a focused spotlight on the jewelry and soft shadows to enhance depth and contrast. 
Ensure the jewelry's design, metal color, gemstone sparkle, and clasp details remain accurate to the original, 
with no alterations in shape, composition, or proportions. 
The environment should feel premium, cinematic, and elegant, emphasizing luxury and craftsmanship.
Render at 1080\xD71080 px with ultra-realistic studio quality.`;
}
function getTemplatePrompt(templateName) {
  const legacyPrompts = {
    "Dark Blue Velvet Luxury": generateJewelryPrompt("jewelry", "Velvet Blue"),
    "Marble Surface": generateJewelryPrompt("jewelry", "White Marble"),
    "Silk Fabric": generateJewelryPrompt("jewelry", "Ivory Silk"),
    "Wooden Table": generateJewelryPrompt("jewelry", "Walnut Wood"),
    "Charcoal Grey Suede": generateJewelryPrompt("jewelry", "Charcoal Grey Suede"),
    "Royal Purple Velvet": generateJewelryPrompt("jewelry", "Royal Purple Velvet"),
    "Emerald Green Suede": generateJewelryPrompt("jewelry", "Emerald Green Suede")
  };
  return legacyPrompts[templateName] || generateJewelryPrompt("jewelry", "Velvet Blue");
}

// server/routes.ts
import { z } from "zod";
async function logAudit(userId, action, ipAddress, userAgent, metadata) {
  try {
    await storage.createAuditLog({
      userId: userId || null,
      action,
      ipAddress,
      userAgent: userAgent || null,
      metadata: metadata || null
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}
function getClientIP(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.headers["x-real-ip"] || req.socket.remoteAddress || "unknown";
}
var upload = multer3({
  dest: "uploads/",
  limits: { fileSize: 25 * 1024 * 1024 }
  // 25MB limit
});
var bulkUpload = multer3({
  dest: "uploads/bulk/",
  limits: {
    fileSize: 50 * 1024 * 1024,
    // 50MB per file
    files: 1e4
    // Maximum 10,000 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (JPG, PNG, WebP, GIF, BMP, TIFF)"));
    }
  }
});
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { referralCode, ...userData } = req.body;
      const validatedData = insertUserSchema.parse(userData);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const hashedPassword = await bcrypt2.hash(validatedData.password, 10);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        isTrialUsed: true
      });
      await storage.addCoinsWithTransaction(user.id, 100, {
        type: "trial_bonus",
        description: "Welcome bonus - 100 free coins",
        metadata: { source: "trial_bonus" }
      });
      if (referralCode) {
        try {
          const referrer = await storage.getUserByReferralCode(referralCode);
          if (referrer) {
            await storage.createReferral({
              referrerId: referrer.id,
              referralCode
            });
            await storage.completeReferral(referralCode, user.id);
            const updatedReferrer = await storage.getUser(referrer.id);
            if (updatedReferrer && shouldSendEmail(updatedReferrer, "referral")) {
              const { sendReferralSuccessEmail: sendReferralSuccessEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
              sendReferralSuccessEmail2(updatedReferrer, user).catch((error) => {
                console.error("Failed to send referral email:", error);
              });
            }
          }
        } catch (error) {
          console.error("Failed to process referral:", error);
        }
      }
      req.session.userId = user.id;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      const updatedUser = await storage.getUser(user.id);
      if (updatedUser && shouldSendEmail(updatedUser, "welcome")) {
        sendWelcomeEmail(updatedUser).catch((error) => {
          console.error("Failed to send welcome email:", error);
        });
      }
      res.json({
        user: { id: user.id, email: user.email, name: user.name, coinBalance: 100, role: user.role }
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const validPassword = await bcrypt2.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      await logAudit(
        user.id,
        "login",
        getClientIP(req),
        req.headers["user-agent"],
        { email: user.email }
      );
      res.json({
        user: { id: user.id, email: user.email, name: user.name, coinBalance: user.coinBalance, role: user.role }
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      user: { id: user.id, email: user.email, name: user.name, coinBalance: user.coinBalance, role: user.role, avatarUrl: user.avatarUrl }
    });
  });
  const avatarUpload = multer3({
    dest: "uploads/avatars/",
    limits: { fileSize: 2 * 1024 * 1024 },
    // 2MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPG and PNG images are allowed"));
      }
    }
  });
  const templateUpload2 = multer3({
    dest: "uploads/templates/",
    limits: { fileSize: 5 * 1024 * 1024 },
    // 5MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPG, PNG, and WebP images are allowed"));
      }
    }
  });
  app2.get("/api/profile", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.put("/api/profile", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { name, phone, emailNotifications, notifyJobCompletion, notifyPaymentConfirmed, notifyCoinsAdded } = req.body;
      const updatedUser = await storage.updateUserProfile(req.session.userId, {
        name,
        phone,
        emailNotifications,
        notifyJobCompletion,
        notifyPaymentConfirmed,
        notifyCoinsAdded
      });
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/profile/avatar", avatarUpload.single("avatar"), async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const updatedUser = await storage.updateUserProfile(req.session.userId, {
        avatarUrl
      });
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/profile/stats", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const stats = await storage.getUserStats(req.session.userId);
      res.json({ stats });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/referrals/my-code", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      let referralCode = await storage.getUserReferralCode(req.session.userId);
      if (!referralCode) {
        referralCode = await storage.generateReferralCode(req.session.userId);
      }
      res.json({ referralCode });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/referrals/stats", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const stats = await storage.getReferralStats(req.session.userId);
      res.json({ stats });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/referrals/list", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const referrals2 = await storage.getUserReferrals(req.session.userId);
      const referralsWithDetails = await Promise.all(
        referrals2.map(async (referral) => {
          let referredUserName = "Pending signup";
          if (referral.referredUserId) {
            const referredUser = await storage.getUser(referral.referredUserId);
            referredUserName = referredUser?.name || referredUser?.email || "Unknown";
          }
          return {
            ...referral,
            referredUserName
          };
        })
      );
      res.json({ referrals: referralsWithDetails });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/users", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const users2 = await storage.getAllUsers();
      const safeUsers = users2.map(({ password, ...user }) => user);
      res.json({ users: safeUsers });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/users/:userId/add-coins", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { amount, description } = req.body;
      const targetUserId = req.params.userId;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      await storage.addCoinsWithTransaction(targetUserId, amount, {
        type: "purchase",
        description: description || `Admin added ${amount} coins`,
        metadata: { addedBy: req.session.userId }
      });
      const updatedUser = await storage.getUser(targetUserId);
      if (updatedUser && shouldSendEmail(updatedUser, "coinsAdded")) {
        sendCoinsAddedEmail(
          updatedUser,
          amount,
          description || `${amount} coins have been added to your wallet by an admin.`
        ).catch((error) => {
          console.error("Failed to send coins added email:", error);
        });
      }
      res.json({ user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/coin-packages", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const packages = await storage.getAllCoinPackages();
      res.json({ packages });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/coin-packages", async (req, res) => {
    try {
      const packages = await storage.getActiveCoinPackages();
      res.json({ packages });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/coin-packages", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const packageData = insertCoinPackageSchema.parse(req.body);
      const newPackage = await storage.createCoinPackage(packageData);
      res.json({ package: newPackage });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.patch("/api/admin/coin-packages/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      await storage.updateCoinPackage(req.params.id, req.body);
      const updatedPackage = await storage.getCoinPackage(req.params.id);
      res.json({ package: updatedPackage });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.delete("/api/admin/coin-packages/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      await storage.deleteCoinPackage(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/admin/manual-transactions", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const transactions2 = await storage.getAllManualTransactions();
      const enrichedTxns = await Promise.all(
        transactions2.map(async (txn) => {
          const user = await storage.getUser(txn.userId);
          const pkg = txn.packageId ? await storage.getCoinPackage(txn.packageId) : null;
          return {
            ...txn,
            user: user ? { email: user.email, name: user.name } : null,
            package: pkg ? { name: pkg.name } : null
          };
        })
      );
      res.json({ transactions: enrichedTxns });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/manual-transactions", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const txnData = insertManualTransactionSchema.parse(req.body);
      const newTxn = await storage.createManualTransaction(txnData);
      res.json({ transaction: newTxn });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/admin/manual-transactions/:id/approve", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { adminNotes } = req.body;
      const transaction = await storage.getManualTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      await storage.approveManualTransaction(req.params.id, req.session.userId, adminNotes);
      const user = await storage.getUser(transaction.userId);
      if (user && shouldSendEmail(user, "paymentConfirmed")) {
        sendPaymentConfirmedEmail(
          user,
          transaction.coinAmount,
          transaction.priceInINR,
          transaction.paymentMethod
        ).catch((error) => {
          console.error("Failed to send payment confirmed email:", error);
        });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/admin/manual-transactions/:id/reject", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { adminNotes } = req.body;
      if (!adminNotes) {
        return res.status(400).json({ message: "Admin notes required for rejection" });
      }
      await storage.rejectManualTransaction(req.params.id, req.session.userId, adminNotes);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/admin/analytics", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const transactions2 = await storage.getAllManualTransactions();
      const completedTxns = transactions2.filter((t) => t.status === "completed");
      const totalRevenue = completedTxns.reduce((sum2, t) => sum2 + t.priceInINR, 0);
      const totalCoinsSold = completedTxns.reduce((sum2, t) => sum2 + t.coinAmount, 0);
      const allUsers = await storage.getAllUsers();
      const totalCoinsSpent = allUsers.reduce((sum2, u) => {
        const spent = u.coinBalance || 0;
        return sum2;
      }, 0);
      const templates2 = await storage.getAllTemplates();
      const jobs = [];
      const usersThisMonth = allUsers.filter((u) => {
        const createdAt = new Date(u.createdAt);
        const now = /* @__PURE__ */ new Date();
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      }).length;
      res.json({
        revenue: {
          total: totalRevenue,
          thisMonth: completedTxns.filter((t) => {
            const created = new Date(t.createdAt);
            const now = /* @__PURE__ */ new Date();
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
          }).reduce((sum2, t) => sum2 + t.priceInINR, 0),
          transactionCount: completedTxns.length
        },
        coins: {
          sold: totalCoinsSold,
          active: allUsers.reduce((sum2, u) => sum2 + (u.coinBalance || 0), 0)
        },
        users: {
          total: allUsers.length,
          thisMonth: usersThisMonth
        },
        transactions: completedTxns.slice(0, 10)
        // Recent 10
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/wallet/packages", async (req, res) => {
    try {
      const packages = await storage.getActiveCoinPackages();
      res.json({ packages });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/wallet/transactions", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const transactions2 = await storage.getUserManualTransactions(req.session.userId);
      res.json({ transactions: transactions2 });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/templates", async (req, res) => {
    try {
      const templates2 = await storage.getAllTemplates();
      res.json({ templates: templates2 });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch templates" });
    }
  });
  app2.get("/api/admin/templates", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const templates2 = await storage.getAllTemplatesForAdmin();
      res.json({ templates: templates2 });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch templates" });
    }
  });
  app2.get("/api/templates/favorites", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const favorites = await storage.getUserFavorites(req.session.userId);
      res.json({ favorites });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch favorites" });
    }
  });
  app2.post("/api/templates/:templateId/favorite", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const favorite = await storage.addTemplateFavorite(req.session.userId, req.params.templateId);
      res.json({ favorite });
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to add favorite" });
    }
  });
  app2.delete("/api/templates/:templateId/favorite", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      await storage.removeTemplateFavorite(req.session.userId, req.params.templateId);
      res.json({ message: "Favorite removed" });
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to remove favorite" });
    }
  });
  app2.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json({ template });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch template" });
    }
  });
  app2.patch("/api/templates/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const updateSchema = z.object({
        name: z.string().optional(),
        category: z.string().optional(),
        backgroundStyle: z.string().optional(),
        lightingPreset: z.string().optional(),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        settings: z.any().optional(),
        isPremium: z.boolean().optional(),
        isActive: z.boolean().optional(),
        coinCost: z.number().int().min(0).optional(),
        pricePerImage: z.number().int().min(0).optional(),
        features: z.array(z.object({
          title: z.string(),
          description: z.string(),
          icon: z.string()
        })).optional(),
        benefits: z.array(z.string()).optional(),
        useCases: z.array(z.object({
          title: z.string(),
          description: z.string(),
          imageUrl: z.string().optional()
        })).optional(),
        whyBuy: z.string().optional(),
        testimonials: z.array(z.object({
          name: z.string(),
          role: z.string(),
          content: z.string(),
          avatarUrl: z.string().optional(),
          rating: z.number().int().min(1).max(5)
        })).optional()
      });
      const validatedData = updateSchema.parse(req.body);
      const template = await storage.updateTemplate(req.params.id, validatedData);
      res.json({ template });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(400).json({ message: error.message || "Failed to update template" });
    }
  });
  app2.post("/api/templates", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const templateData = req.body;
      const template = await storage.createTemplate(templateData);
      res.json({ template });
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to create template" });
    }
  });
  app2.post("/api/templates/:id/thumbnail", templateUpload2.single("thumbnail"), async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      const thumbnailUrl = `/uploads/templates/${req.file.filename}`;
      await storage.updateTemplate(req.params.id, { thumbnailUrl });
      res.json({
        success: true,
        message: "Template thumbnail uploaded successfully",
        thumbnailUrl
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to upload template thumbnail" });
    }
  });
  app2.patch("/api/templates/:id/soft-delete", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      await storage.softDeleteTemplate(req.params.id);
      res.json({ success: true, message: "Template soft deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to soft delete template" });
    }
  });
  app2.patch("/api/templates/:id/restore", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      await storage.restoreTemplate(req.params.id);
      res.json({ success: true, message: "Template restored successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to restore template" });
    }
  });
  app2.delete("/api/templates/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      await storage.deleteTemplate(req.params.id);
      res.json({ success: true, message: "Template permanently deleted" });
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to delete template" });
    }
  });
  app2.get("/api/admin/users", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const users2 = await storage.getAllUsers();
      res.json({ users: users2 });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });
  app2.patch("/api/admin/users/:id/role", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { role, userTier } = req.body;
      const targetUserId = req.params.id;
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
      }
      if (userTier && !["free", "premium", "enterprise"].includes(userTier)) {
        return res.status(400).json({ message: "Invalid user tier. Must be 'free', 'premium', or 'enterprise'" });
      }
      await storage.updateUserRole(targetUserId, role, userTier || (role === "admin" ? "enterprise" : "free"));
      res.json({ success: true, message: "User role updated successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to update user role" });
    }
  });
  app2.patch("/api/admin/users/:id/coins", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { coinBalance } = req.body;
      const targetUserId = req.params.id;
      if (typeof coinBalance !== "number" || coinBalance < 0) {
        return res.status(400).json({ message: "Invalid coin balance. Must be a non-negative number" });
      }
      await storage.updateUserCoins(targetUserId, coinBalance);
      res.json({ success: true, message: "User coins updated successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to update user coins" });
    }
  });
  app2.post("/api/admin/create-admin", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const adminUsers = allUsers.filter((u) => u.role === "admin");
      if (adminUsers.length > 0) {
        if (!req.session.userId) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        const user = await storage.getUser(req.session.userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      }
      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      const newAdmin = await storage.createAdminUser(email, password, name || "Admin User");
      res.json({
        success: true,
        message: "Admin user created successfully",
        user: {
          id: newAdmin.id,
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to create admin user" });
    }
  });
  app2.get("/api/usage/quota", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const quotaStatus = await storage.checkUserQuota(req.session.userId);
      const user = await storage.getUser(req.session.userId);
      res.json({
        ...quotaStatus,
        tier: user?.userTier || "free"
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch quota" });
    }
  });
  app2.post(
    "/api/jobs/bulk-upload",
    bulkUpload.array("images", 1e4),
    async (req, res) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      try {
        const files = req.files;
        if (!files || files.length === 0) {
          return res.status(400).json({ message: "No images uploaded" });
        }
        if (files.length > 1e4) {
          return res.status(400).json({ message: "Maximum 10,000 images allowed per bulk upload" });
        }
        const { templateId, enhancementPrompt, quality = "standard", enableBlurDetection = true } = req.body;
        if (!templateId) {
          return res.status(400).json({ message: "Template ID is required" });
        }
        const template = await storage.getTemplate(templateId);
        if (!template) {
          return res.status(404).json({ message: "Template not found" });
        }
        const aiPrompt = enhancementPrompt || template.settings?.diffusionPrompt || "A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the product design, colors, and composition remain exactly the same with no changes or alterations. Output size 1080x1080px.";
        const quotaStatus = await storage.checkUserQuota(req.session.userId);
        if (!quotaStatus.hasQuota) {
          return res.status(403).json({
            message: "Monthly quota exceeded. Please upgrade your plan to process more images.",
            quota: quotaStatus.quota,
            used: quotaStatus.used
          });
        }
        if (quotaStatus.remaining < files.length) {
          return res.status(403).json({
            message: `Insufficient quota. You have ${quotaStatus.remaining} images remaining this month.`,
            quota: quotaStatus.quota,
            used: quotaStatus.used,
            remaining: quotaStatus.remaining
          });
        }
        const qualityMultipliers = {
          standard: 2,
          high: 3,
          ultra: 5
        };
        const qualityMultiplier = qualityMultipliers[quality] || 2;
        const coinsNeeded = files.length * qualityMultiplier;
        const user = await storage.getUser(req.session.userId);
        if (!user || user.coinBalance < coinsNeeded) {
          return res.status(400).json({
            message: `Insufficient coins. Required: ${coinsNeeded}, Available: ${user?.coinBalance || 0}`
          });
        }
        const job = await storage.createProcessingJob({
          userId: req.session.userId,
          templateId,
          totalImages: files.length,
          coinsUsed: coinsNeeded,
          status: "queued",
          batchSettings: {
            quality,
            enableBlurDetection,
            aiPrompt,
            bulkUpload: true,
            maxImages: files.length
          }
        });
        const BATCH_SIZE = 100;
        const imagePromises = [];
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
          const batch = files.slice(i, i + BATCH_SIZE);
          for (const file of batch) {
            const originalUrl = `/uploads/bulk/${path5.basename(file.path)}`;
            imagePromises.push(
              storage.createImage({
                jobId: job.id,
                originalUrl
              })
            );
          }
        }
        await Promise.all(imagePromises);
        await logAudit(
          req.session.userId,
          "bulk_upload_created",
          getClientIP(req),
          req.headers["user-agent"],
          {
            jobId: job.id,
            imageCount: files.length,
            coinsUsed: coinsNeeded,
            templateId,
            quality,
            enableBlurDetection
          }
        );
        try {
          await storage.addCoinsWithTransaction(req.session.userId, -coinsNeeded, {
            type: "usage",
            description: `Bulk processed ${files.length} images (${quality} quality)`,
            metadata: { jobId: job.id, quality, bulkUpload: true }
          });
          await storage.incrementMonthlyUsage(req.session.userId, files.length);
        } catch (error) {
          await storage.updateProcessingJobStatus(job.id, "failed", 0);
          if (error.message.includes("Insufficient coins")) {
            return res.status(400).json({ message: "Insufficient coins to process images" });
          }
          throw error;
        }
        setTimeout(async () => {
          try {
            await processBulkImages(job.id, aiPrompt, quality, enableBlurDetection);
          } catch (error) {
            console.error("Bulk processing error:", error);
            await storage.updateProcessingJobStatus(job.id, "failed", 0);
          }
        }, 1e3);
        res.json({
          job,
          message: `Bulk upload started. Processing ${files.length} images with AI enhancement.`,
          estimatedTime: `${Math.ceil(files.length / 10)} minutes`
        });
      } catch (error) {
        console.error("Bulk upload error:", error);
        res.status(500).json({ message: error.message || "Failed to create bulk upload job" });
      }
    }
  );
  async function processBulkImages(jobId, aiPrompt, quality, enableBlurDetection) {
    try {
      const jobImages = await storage.getJobImages(jobId);
      await storage.updateProcessingJobStatus(jobId, "processing", 0);
      await fs6.mkdir(path5.join("uploads", "processed"), { recursive: true });
      let completedCount = 0;
      const PROCESSING_BATCH_SIZE = 10;
      for (let i = 0; i < jobImages.length; i += PROCESSING_BATCH_SIZE) {
        const batch = jobImages.slice(i, i + PROCESSING_BATCH_SIZE);
        await Promise.all(
          batch.map(async (image) => {
            try {
              const inputPath = path5.join(process.cwd(), image.originalUrl);
              try {
                await fs6.access(inputPath);
              } catch {
                console.error(`Input image not found: ${inputPath}`);
                await storage.updateImageStatus(image.id, "failed", void 0);
                return;
              }
              let isBlurred = false;
              if (enableBlurDetection) {
                isBlurred = await detectImageBlur(inputPath);
              }
              const timestamp2 = Date.now();
              const randomId = Math.random().toString(36).substring(7);
              const outputFileName = `enhanced_${timestamp2}_${randomId}.png`;
              const outputPath = path5.join("uploads", "processed", outputFileName);
              const outputUrl = `/uploads/processed/${outputFileName}`;
              const enhancementSuccess = await enhanceImageWithAI(
                inputPath,
                outputPath,
                aiPrompt,
                quality,
                isBlurred
              );
              if (enhancementSuccess) {
                await storage.updateImageStatus(image.id, "completed", outputUrl);
                completedCount++;
              } else {
                await fs6.copyFile(inputPath, outputPath);
                await storage.updateImageStatus(image.id, "completed", outputUrl);
                completedCount++;
              }
            } catch (error) {
              console.error(`Failed to process image ${image.id}:`, error);
              await storage.updateImageStatus(image.id, "failed", void 0);
            }
          })
        );
        await storage.updateProcessingJobStatus(jobId, "processing", completedCount);
        if (i + PROCESSING_BATCH_SIZE < jobImages.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      const zipFileName = `bulk-job-${jobId}.zip`;
      const zipPath = path5.join("uploads", "processed", zipFileName);
      const output = createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(output);
      const updatedJobImages = await storage.getJobImages(jobId);
      for (const image of updatedJobImages) {
        if (image.processedUrl) {
          const imagePath = path5.join(process.cwd(), image.processedUrl);
          try {
            await fs6.access(imagePath);
            const originalName = path5.basename(image.originalUrl).replace(/^[0-9]+_/, "");
            archive.file(imagePath, { name: `enhanced_${originalName}` });
          } catch (err) {
            console.error(`Failed to add ${imagePath} to ZIP:`, err);
          }
        }
      }
      await archive.finalize();
      const jobStatus = completedCount === jobImages.length ? "completed" : "failed";
      await storage.updateProcessingJobStatus(
        jobId,
        jobStatus,
        completedCount,
        `/uploads/processed/${zipFileName}`
      );
      if (jobStatus === "completed") {
        const job = await storage.getProcessingJob(jobId);
        const user = await storage.getUser(job.userId);
        if (user && shouldSendEmail(user, "jobCompletion")) {
          const downloadUrl = `${process.env.APP_URL || "http://localhost:5000"}/api/jobs/${jobId}/download`;
          sendJobCompletedEmail(user, job, downloadUrl).catch((error) => {
            console.error("Failed to send bulk job completed email:", error);
          });
        }
      }
      for (const image of jobImages) {
        try {
          const tempPath = path5.join(process.cwd(), image.originalUrl);
          await fs6.unlink(tempPath);
        } catch (err) {
          console.error(`Failed to delete temp file: ${err}`);
        }
      }
      console.log(`Bulk job ${jobId} completed: ${completedCount}/${jobImages.length} images processed`);
    } catch (error) {
      console.error("Bulk processing error:", error);
      await storage.updateProcessingJobStatus(jobId, "failed", 0);
    }
  }
  async function detectImageBlur(imagePath) {
    try {
      return true;
    } catch (error) {
      console.error("Blur detection failed:", error);
      return false;
    }
  }
  async function enhanceImageWithAI(inputPath, outputPath, prompt, quality, isBlurred) {
    try {
      console.log(`Processing image with AI: ${path5.basename(inputPath)}`);
      console.log(`Quality: ${quality}, Is Blurred: ${isBlurred}`);
      const result = await aiImageEnhancer.enhanceImage({
        inputPath,
        outputPath,
        prompt,
        quality,
        isBlurred
      });
      if (result.success) {
        console.log(`\u2705 AI enhancement completed in ${result.processingTime}ms`);
        return true;
      } else {
        console.error(`\u274C AI enhancement failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error("AI enhancement failed:", error);
      return false;
    }
  }
  app2.get("/api/jobs/bulk/:jobId/progress", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const job = await storage.getProcessingJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (job.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const images2 = await storage.getJobImages(job.id);
      const completedImages = images2.filter((img) => img.status === "completed").length;
      const failedImages = images2.filter((img) => img.status === "failed").length;
      const processingImages = images2.filter((img) => img.status === "processing").length;
      const pendingImages = images2.filter((img) => img.status === "pending").length;
      const progress = {
        jobId: job.id,
        status: job.status,
        totalImages: job.totalImages,
        completedImages,
        failedImages,
        processingImages,
        pendingImages,
        progressPercentage: Math.round(completedImages / job.totalImages * 100),
        estimatedTimeRemaining: pendingImages > 0 ? `${Math.ceil(pendingImages / 10)} minutes` : "0 minutes",
        zipUrl: job.zipUrl
      };
      res.json({ progress });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to get progress" });
    }
  });
  app2.post(
    "/api/jobs",
    upload.array("images", 100),
    async (req, res) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      try {
        const files = req.files;
        if (!files || files.length === 0) {
          return res.status(400).json({ message: "No images uploaded" });
        }
        const { templateId, batchSettings } = req.body;
        if (!templateId) {
          return res.status(400).json({ message: "Template ID is required" });
        }
        const quotaStatus = await storage.checkUserQuota(req.session.userId);
        if (!quotaStatus.hasQuota) {
          return res.status(403).json({
            message: "Monthly quota exceeded. Please upgrade your plan to process more images.",
            quota: quotaStatus.quota,
            used: quotaStatus.used
          });
        }
        if (quotaStatus.remaining < files.length) {
          return res.status(403).json({
            message: `Insufficient quota. You have ${quotaStatus.remaining} images remaining this month.`,
            quota: quotaStatus.quota,
            used: quotaStatus.used,
            remaining: quotaStatus.remaining
          });
        }
        const parsedSettings = batchSettings ? JSON.parse(batchSettings) : {};
        const quality = parsedSettings.quality || "standard";
        const qualityMultipliers = {
          standard: 2,
          high: 3,
          ultra: 5
        };
        const qualityMultiplier = qualityMultipliers[quality] || 2;
        const coinsNeeded = files.length * qualityMultiplier;
        const user = await storage.getUser(req.session.userId);
        if (!user || user.coinBalance < coinsNeeded) {
          return res.status(400).json({ message: "Insufficient coins" });
        }
        const clientIP = getClientIP(req);
        const job = await storage.createProcessingJob({
          userId: req.session.userId,
          templateId,
          totalImages: files.length,
          coinsUsed: coinsNeeded,
          status: "queued",
          batchSettings: batchSettings ? JSON.parse(batchSettings) : null
        });
        const imagePromises = files.map((file) => {
          const originalUrl = `/uploads/${path5.basename(file.path)}`;
          return storage.createImage({
            jobId: job.id,
            originalUrl
          });
        });
        await Promise.all(imagePromises);
        await logAudit(
          req.session.userId,
          "job_created",
          clientIP,
          req.headers["user-agent"],
          {
            jobId: job.id,
            imageCount: files.length,
            coinsUsed: coinsNeeded,
            templateId
          }
        );
        try {
          await storage.addCoinsWithTransaction(req.session.userId, -coinsNeeded, {
            type: "usage",
            description: `Processed ${files.length} images (${quality} quality)`,
            metadata: { jobId: job.id, quality }
          });
          await storage.incrementMonthlyUsage(req.session.userId, files.length);
        } catch (error) {
          await storage.updateProcessingJobStatus(job.id, "failed", 0);
          if (error.message.includes("Insufficient coins")) {
            return res.status(400).json({ message: "Insufficient coins to process images" });
          }
          throw error;
        }
        setTimeout(async () => {
          try {
            const jobImages = await storage.getJobImages(job.id);
            const template = await storage.getTemplate(job.templateId);
            if (!template) {
              throw new Error("Template not found");
            }
            const settings = template.settings || {};
            const templateSettings = {
              backgroundStyle: template.backgroundStyle || "gradient",
              lightingPreset: template.lightingPreset || "soft-glow",
              shadowIntensity: settings.shadowIntensity || 0,
              vignetteStrength: settings.vignetteStrength || 0,
              colorGrading: settings.colorGrading || "neutral",
              gradientColors: settings.gradientColors || ["#0F2027", "#203A43"],
              diffusionPrompt: settings.diffusionPrompt || ""
            };
            await fs6.mkdir(path5.join("uploads", "processed"), { recursive: true });
            const batchSize = 5;
            for (let i = 0; i < jobImages.length; i += batchSize) {
              const batch = jobImages.slice(i, i + batchSize);
              await Promise.all(
                batch.map(async (image) => {
                  try {
                    await storage.updateImageStatus(image.id, "failed", void 0);
                    throw new Error("AI image processing functionality has been removed");
                  } catch (error) {
                    console.error(`Failed to process image ${image.id}:`, error);
                    await storage.updateImageStatus(image.id, "failed", void 0);
                  }
                })
              );
            }
            const updatedJobImages = await storage.getJobImages(job.id);
            const zipFileName = `job-${job.id}.zip`;
            const zipPath = path5.join("uploads", "processed", zipFileName);
            const output = createWriteStream(zipPath);
            const archive = archiver("zip", { zlib: { level: 9 } });
            archive.pipe(output);
            for (const image of updatedJobImages) {
              if (image.processedUrl) {
                const imagePath = path5.join("uploads", "processed", path5.basename(image.processedUrl));
                try {
                  archive.file(imagePath, { name: path5.basename(image.processedUrl) });
                } catch (err) {
                  console.error(`Failed to add ${imagePath} to zip:`, err);
                }
              }
            }
            await archive.finalize();
            const completedCount = updatedJobImages.filter((img) => img.processedUrl).length;
            const jobStatus = completedCount === jobImages.length ? "completed" : "failed";
            await storage.updateProcessingJobStatus(
              job.id,
              jobStatus,
              completedCount,
              `/uploads/processed/${zipFileName}`
            );
            if (jobStatus === "completed") {
              const user2 = await storage.getUser(job.userId);
              const completedJob = await storage.getProcessingJob(job.id);
              if (user2 && completedJob && shouldSendEmail(user2, "jobCompletion")) {
                const downloadUrl = `${process.env.APP_URL || "http://localhost:5000"}/api/jobs/${job.id}/download`;
                sendJobCompletedEmail(user2, completedJob, downloadUrl).catch((error) => {
                  console.error("Failed to send job completed email:", error);
                });
              }
            }
            for (const image of jobImages) {
              try {
                const tempPath = path5.join("uploads", path5.basename(image.originalUrl));
                await fs6.unlink(tempPath);
              } catch (err) {
                console.error(`Failed to delete temp file: ${err}`);
              }
            }
            console.log(`Job ${job.id} completed with ${completedCount}/${jobImages.length} images`);
          } catch (error) {
            console.error("Processing error:", error);
            await storage.updateProcessingJobStatus(job.id, "failed", 0);
          }
        }, 2e3);
        res.json({ job });
      } catch (error) {
        console.error("Job creation error:", error);
        res.status(500).json({ message: error.message || "Failed to create job" });
      }
    }
  );
  app2.get("/api/jobs/:jobId", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const job = await storage.getProcessingJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (job.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      res.json({ job });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch job" });
    }
  });
  app2.get("/api/jobs", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const jobs = await storage.getUserProcessingJobs(req.session.userId);
      const jobsWithImages = await Promise.all(
        jobs.map(async (job) => {
          const images2 = await storage.getJobImages(job.id);
          const template = await storage.getTemplate(job.templateId);
          return {
            ...job,
            images: images2,
            templateName: template?.name || "Unknown Template"
          };
        })
      );
      res.json({ jobs: jobsWithImages });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch jobs" });
    }
  });
  app2.get("/api/jobs/:jobId/images", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const job = await storage.getProcessingJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (job.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const images2 = await storage.getJobImages(req.params.jobId);
      res.json({ images: images2 });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/jobs/:jobId/download", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const job = await storage.getProcessingJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (job.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      if (!job.zipUrl) {
        return res.status(400).json({ message: "Job not completed yet" });
      }
      const zipPath = path5.join(process.cwd(), job.zipUrl);
      res.download(zipPath, `drisya-job-${job.id}.zip`);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to download" });
    }
  });
  app2.delete("/api/images/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      await storage.deleteImage(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to delete image" });
    }
  });
  app2.post("/api/gallery/bulk-download", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { imageIds } = req.body;
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ message: "Image IDs required" });
    }
    try {
      const images2 = await storage.getImagesByIds(imageIds, req.session.userId);
      if (images2.length === 0) {
        return res.status(404).json({ message: "No images found" });
      }
      const archive = archiver("zip", { zlib: { level: 9 } });
      res.attachment(`gallery-export-${Date.now()}.zip`);
      archive.pipe(res);
      for (const image of images2) {
        if (image.processedUrl) {
          const imagePath = path5.join(process.cwd(), image.processedUrl);
          const originalName = image.originalUrl?.split("/").pop()?.split("-").slice(1).join("-") || `image-${image.id}.png`;
          try {
            await fs6.access(imagePath);
            archive.file(imagePath, { name: originalName });
          } catch (err) {
            console.error(`File not found: ${imagePath}`);
          }
        }
      }
      await archive.finalize();
    } catch (error) {
      console.error("Bulk download error:", error);
      res.status(500).json({ message: error.message || "Failed to create ZIP" });
    }
  });
  app2.post("/api/gallery/bulk-reprocess", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { imageIds, templateId, quality } = req.body;
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ message: "Image IDs required" });
    }
    if (!templateId) {
      return res.status(400).json({ message: "Template ID required" });
    }
    try {
      const images2 = await storage.getImagesByIds(imageIds, req.session.userId);
      if (images2.length === 0) {
        return res.status(404).json({ message: "No images found" });
      }
      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      const qualityMultipliers = {
        standard: 2,
        high: 3,
        ultra: 5
      };
      const qualityMultiplier = qualityMultipliers[quality || "standard"] || 2;
      const coinCost = images2.length * qualityMultiplier;
      const user = await storage.getUser(req.session.userId);
      if (!user || user.coinBalance < coinCost) {
        return res.status(403).json({ message: "Insufficient coins" });
      }
      const job = await storage.createProcessingJob({
        userId: req.session.userId,
        templateId,
        totalImages: images2.length,
        coinsUsed: coinCost,
        status: "queued",
        batchSettings: {
          quality: quality || "standard",
          format: "png"
        }
      });
      for (const originalImage of images2) {
        await storage.createImage({
          jobId: job.id,
          originalUrl: originalImage.originalUrl
          // Reuse original URL
        });
      }
      await storage.addCoinsWithTransaction(req.session.userId, -coinCost, {
        type: "usage",
        description: `Reprocessed ${images2.length} images with ${template.name} (${quality || "standard"} quality)`,
        metadata: { jobId: job.id, templateId, quality: quality || "standard", isReprocess: true }
      });
      setTimeout(async () => {
        try {
          const jobImages = await storage.getJobImages(job.id);
          const settings = template.settings || {};
          const templateSettings = {
            backgroundStyle: template.backgroundStyle || "gradient",
            lightingPreset: template.lightingPreset || "soft-glow",
            shadowIntensity: settings.shadowIntensity || 0,
            vignetteStrength: settings.vignetteStrength || 0,
            colorGrading: settings.colorGrading || "neutral",
            gradientColors: settings.gradientColors || ["#0F2027", "#203A43"],
            diffusionPrompt: settings.diffusionPrompt || ""
          };
          await fs6.mkdir(path5.join("uploads", "processed"), { recursive: true });
          const batchSize = 5;
          let completedCount = 0;
          for (let i = 0; i < jobImages.length; i += batchSize) {
            const batch = jobImages.slice(i, i + batchSize);
            await Promise.all(
              batch.map(async (image) => {
                try {
                  await storage.updateImageStatus(image.id, "failed", void 0);
                  throw new Error("AI image processing functionality has been removed");
                } catch (error) {
                  console.error(`Failed to process image ${image.id}:`, error);
                  await storage.updateImageStatus(image.id, "failed", void 0);
                }
              })
            );
          }
          if (completedCount > 0) {
            const zipFileName = `reprocessed-job-${job.id}-${Date.now()}.zip`;
            const zipPath = path5.join("uploads", "processed", zipFileName);
            const archive = archiver("zip", { zlib: { level: 9 } });
            const output = createWriteStream(zipPath);
            archive.pipe(output);
            for (const image of jobImages) {
              if (image.processedUrl) {
                const imagePath = path5.join(process.cwd(), image.processedUrl);
                try {
                  await fs6.access(imagePath);
                  archive.file(imagePath, { name: path5.basename(image.processedUrl) });
                } catch (err) {
                  console.error(`File not found: ${imagePath}`);
                }
              }
            }
            await archive.finalize();
            await storage.updateProcessingJobStatus(job.id, "completed", completedCount, `/uploads/processed/${zipFileName}`);
          }
          console.log(`Bulk reprocess job ${job.id} completed with ${completedCount}/${jobImages.length} images`);
        } catch (error) {
          console.error("Bulk reprocess processing error:", error);
          await storage.updateProcessingJobStatus(job.id, "failed", 0);
        }
      }, 2e3);
      res.json({
        jobId: job.id,
        message: `Reprocessing ${images2.length} images with ${template.name}`,
        coinCost
      });
    } catch (error) {
      console.error("Bulk reprocess error:", error);
      res.status(500).json({ message: error.message || "Failed to reprocess images" });
    }
  });
  app2.get("/api/transactions", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const transactions2 = await storage.getUserTransactions(req.session.userId);
      res.json({ transactions: transactions2 });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch transactions" });
    }
  });
  app2.post("/api/coins/purchase", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { package: packageType } = req.body;
      const packages = {
        starter: { coins: 500, price: 499 },
        pro: { coins: 2e3, price: 1599 },
        enterprise: { coins: 5e3, price: 3499 }
      };
      const selectedPackage = packages[packageType];
      if (!selectedPackage) {
        return res.status(400).json({ message: "Invalid package" });
      }
      await storage.addCoinsWithTransaction(req.session.userId, selectedPackage.coins, {
        type: "purchase",
        description: `Purchased ${packageType} package (${selectedPackage.coins} coins)`,
        metadata: { package: packageType, price: selectedPackage.price }
      });
      const user = await storage.getUser(req.session.userId);
      res.json({
        message: "Coins purchased successfully",
        coinBalance: user?.coinBalance || 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Purchase failed" });
    }
  });
  app2.post(
    "/api/upload/zip",
    upload.single("zip"),
    async (req, res) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No ZIP file provided" });
        }
        const zipPath = req.file.path;
        const extractDir = path5.join("uploads", "extracted", `${Date.now()}`);
        await fs6.mkdir(extractDir, { recursive: true });
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractDir, true);
        const allFiles = await fs6.readdir(extractDir);
        const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
        const imageFiles = allFiles.filter((file) => {
          const ext = path5.extname(file).toLowerCase();
          return imageExtensions.includes(ext);
        });
        const images2 = [];
        for (const file of imageFiles) {
          const sourcePath = path5.join(extractDir, file);
          const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file}`;
          const destPath = path5.join("uploads", uniqueName);
          await fs6.copyFile(sourcePath, destPath);
          images2.push({
            name: file,
            path: `/uploads/${uniqueName}`,
            url: `/uploads/${uniqueName}`
          });
        }
        await fs6.unlink(zipPath);
        await fs6.rm(extractDir, { recursive: true, force: true });
        res.json({
          success: true,
          images: images2,
          count: images2.length
        });
      } catch (error) {
        console.error("ZIP extraction error:", error);
        res.status(500).json({ message: error.message || "Failed to extract ZIP" });
      }
    }
  );
  app2.post(
    "/api/upload/single",
    upload.single("image"),
    async (req, res) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No image file provided" });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({
          success: true,
          imageUrl,
          filename: req.file.originalname
        });
      } catch (error) {
        console.error("Single image upload error:", error);
        res.status(500).json({ message: error.message || "Failed to upload image" });
      }
    }
  );
  app2.get("/api/media-library", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      let media = [];
      try {
        const galleryDir = "uploads/gallery";
        const galleryFiles = await fs6.readdir(galleryDir);
        media = galleryFiles.filter((file) => {
          const ext = path5.extname(file).toLowerCase();
          return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
        }).map((file) => ({
          id: `media-${file}`,
          name: file,
          type: "image",
          url: `/uploads/gallery/${file}`,
          thumbnailUrl: `/uploads/gallery/${file}`,
          uploadedAt: /* @__PURE__ */ new Date(),
          isFavorite: false,
          tags: ["uploaded"],
          category: "Raw Upload"
        }));
      } catch (galleryError) {
        console.error("Failed to read gallery directory for media library:", galleryError);
      }
      res.json({ media });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch media library" });
    }
  });
  app2.post("/api/media-library/favorite/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to update favorite" });
    }
  });
  app2.delete("/api/media-library/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to delete media" });
    }
  });
  app2.post("/api/ai-edits", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const validatedData = insertAIEditSchema.parse(req.body);
      const quotaCheck = await storage.checkAIQuota(req.session.userId);
      if (!quotaCheck.canUse) {
        return res.status(403).json({
          message: "AI quota exceeded",
          quota: {
            used: quotaCheck.used,
            limit: quotaCheck.limit,
            remaining: quotaCheck.remaining
          }
        });
      }
      const edit = await storage.createAIEdit({
        ...validatedData
      });
      aiEditQueue.processEdit(edit.id).catch((error) => {
        console.error(`Failed to queue AI edit ${edit.id}:`, error);
      });
      await logAudit(
        req.session.userId,
        "ai_edit_created",
        getClientIP(req),
        req.headers["user-agent"],
        { editId: edit.id, prompt: validatedData.prompt, model: validatedData.aiModel }
      );
      res.json({
        editId: edit.id,
        status: "queued",
        message: "AI edit request queued for processing"
      });
    } catch (error) {
      console.error("AI edit creation error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message || "Failed to create AI edit" });
    }
  });
  app2.post("/api/ai-edits/batch", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { images: images2, prompt, aiModel = "auto", quality = "4k" } = req.body;
      if (!Array.isArray(images2) || images2.length === 0) {
        return res.status(400).json({ message: "images array is required" });
      }
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ message: "prompt is required" });
      }
      const MAX_BATCH_SIZE = 1e3;
      if (images2.length > MAX_BATCH_SIZE) {
        return res.status(400).json({
          message: `Batch size too large. Maximum ${MAX_BATCH_SIZE} images allowed per batch.`
        });
      }
      const quotaCheck = await storage.checkAIQuota(req.session.userId);
      if (!quotaCheck.canUse || quotaCheck.remaining < images2.length) {
        return res.status(403).json({
          message: `Insufficient quota. Need ${images2.length}, have ${quotaCheck.remaining}`
        });
      }
      const editIds = [];
      for (const imageUrl of images2) {
        const edit = await storage.createAIEdit({
          inputImageUrl: imageUrl,
          prompt,
          aiModel,
          quality
        });
        editIds.push(edit.id);
      }
      aiEditQueue.processBatch(editIds).then((results) => {
        console.log(`\u{1F4CA} Batch ${editIds[0]}: ${results.completed}/${results.total} completed, ${results.failed} failed`);
      }).catch((error) => {
        console.error(`Failed to process batch:`, error);
      });
      res.json({
        success: true,
        batchId: editIds[0],
        totalImages: images2.length,
        editIds,
        status: "queued",
        message: `Batch of ${images2.length} images queued for parallel processing`
      });
    } catch (error) {
      console.error("Batch AI edit error:", error);
      res.status(500).json({ message: error.message || "Failed to create batch edit" });
    }
  });
  app2.get("/api/ai-edits/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const edit = await storage.getAIEdit(req.params.id);
      if (!edit) {
        return res.status(404).json({ message: "Edit not found" });
      }
      if (edit.userId !== req.session.userId) {
        return res.status(404).json({ message: "Edit not found" });
      }
      res.json({
        id: edit.id,
        status: edit.status,
        prompt: edit.prompt,
        aiModel: edit.aiModel,
        inputImageUrl: edit.inputImageUrl,
        outputImageUrl: edit.outputImageUrl,
        errorMessage: edit.errorMessage,
        cost: edit.cost,
        metadata: edit.metadata,
        createdAt: edit.createdAt,
        completedAt: edit.completedAt
      });
    } catch (error) {
      console.error("Failed to get AI edit:", error);
      res.status(500).json({ message: error.message || "Failed to get edit status" });
    }
  });
  app2.get("/api/ai-edits", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const edits = await storage.listUserAIEdits(req.session.userId);
      res.json({
        edits: edits.map((edit) => ({
          id: edit.id,
          status: edit.status,
          prompt: edit.prompt,
          aiModel: edit.aiModel,
          inputImageUrl: edit.inputImageUrl,
          outputImageUrl: edit.outputImageUrl,
          errorMessage: edit.errorMessage,
          cost: edit.cost,
          createdAt: edit.createdAt,
          completedAt: edit.completedAt
        }))
      });
    } catch (error) {
      console.error("Failed to list AI edits:", error);
      res.status(500).json({ message: error.message || "Failed to list edits" });
    }
  });
  app2.post("/api/ai-edits/:id/retry", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const edit = await storage.getAIEdit(req.params.id);
      if (!edit) {
        return res.status(404).json({ message: "Edit not found" });
      }
      if (edit.userId !== req.session.userId) {
        return res.status(404).json({ message: "Edit not found" });
      }
      if (edit.status !== "failed") {
        return res.status(400).json({
          message: "Only failed edits can be retried",
          currentStatus: edit.status
        });
      }
      const quotaCheck = await storage.checkAIQuota(req.session.userId);
      if (!quotaCheck.canUse) {
        return res.status(403).json({
          message: "AI quota exceeded",
          quota: {
            used: quotaCheck.used,
            limit: quotaCheck.limit,
            remaining: quotaCheck.remaining
          }
        });
      }
      await storage.updateAIEdit(req.params.id, {
        status: "queued",
        errorMessage: null,
        metadata: {
          ...edit.metadata || {},
          retryAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      aiEditQueue.processEdit(req.params.id).catch((error) => {
        console.error(`Failed to re-queue AI edit ${req.params.id}:`, error);
      });
      await logAudit(
        req.session.userId,
        "ai_edit_retried",
        getClientIP(req),
        req.headers["user-agent"],
        { editId: req.params.id }
      );
      res.json({
        editId: req.params.id,
        status: "queued",
        message: "Edit queued for retry"
      });
    } catch (error) {
      console.error("Failed to retry AI edit:", error);
      res.status(500).json({ message: error.message || "Failed to retry edit" });
    }
  });
  app2.get("/api/ai-usage", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const quotaInfo = await storage.checkAIQuota(req.session.userId);
      res.json({
        used: quotaInfo.used,
        limit: quotaInfo.limit,
        remaining: quotaInfo.remaining,
        canUse: quotaInfo.canUse
      });
    } catch (error) {
      console.error("Failed to get AI usage:", error);
      res.status(500).json({ message: error.message || "Failed to get usage info" });
    }
  });
  app2.post("/api/jewelry/generate", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { imageUrl, templateId, quality = "4k" } = req.body;
      if (!imageUrl || !templateId) {
        return res.status(400).json({ message: "Image URL and template ID are required" });
      }
      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.coinBalance < template.coinCost) {
        return res.status(400).json({
          message: `Insufficient coins. Required: ${template.coinCost}, Available: ${user.coinBalance}`
        });
      }
      const templateSettings = template.settings;
      const templatePrompt = templateSettings?.diffusionPrompt || template.description;
      const result = await jewelryAIGenerator.generateJewelryBackground({
        imageUrl,
        templatePrompt,
        templateName: template.name,
        userId: req.session.userId,
        quality,
        outputSize: "1080x1080"
      });
      if (!result.success) {
        return res.status(500).json({
          message: "Failed to generate jewelry background",
          error: result.error
        });
      }
      res.json({
        success: true,
        imageUrl: result.imageUrl,
        templateName: template.name,
        coinsUsed: template.coinCost,
        remainingCoins: user.coinBalance - template.coinCost,
        processingTime: result.processingTime,
        usedFallback: result.usedFallback
      });
    } catch (error) {
      console.error("Jewelry generation error:", error);
      res.status(500).json({ message: error.message || "Failed to generate jewelry background" });
    }
  });
  const galleryImageUpload = multer3({
    dest: "uploads/gallery/",
    limits: {
      fileSize: 25 * 1024 * 1024,
      // 25MB per image
      files: 50
      // Max 50 images at once
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed (JPG, PNG, WebP, GIF)"));
      }
    }
  });
  app2.post("/api/gallery/upload-images", galleryImageUpload.array("images", 50), async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No images provided" });
      }
      const uploadedImages = [];
      const job = await storage.createProcessingJob({
        userId: req.session.userId,
        templateId: "upload-only",
        // Special template ID for raw uploads
        totalImages: req.files.length,
        coinsUsed: 0,
        // No coins for raw uploads
        status: "completed"
        // Mark as completed since no processing needed
      });
      for (const file of req.files) {
        try {
          const timestamp2 = Date.now();
          const randomId = Math.random().toString(36).substr(2, 9);
          const fileExtension = path5.extname(file.originalname);
          const newFileName = `${timestamp2}_${randomId}${fileExtension}`;
          const newFilePath = path5.join("uploads/gallery", newFileName);
          await fs6.rename(file.path, newFilePath);
          const stats = await fs6.stat(newFilePath);
          const imageUrl = `/uploads/gallery/${newFileName}`;
          const imageRecord = await storage.createImage({
            jobId: job.id,
            originalUrl: imageUrl
          });
          await storage.updateImageStatus(imageRecord.id, "completed", imageUrl);
          const imageData = {
            id: imageRecord.id,
            originalName: file.originalname,
            fileName: newFileName,
            filePath: imageUrl,
            fileSize: stats.size,
            mimeType: file.mimetype,
            uploadedAt: /* @__PURE__ */ new Date(),
            userId: req.session.userId,
            jobId: job.id,
            type: "uploaded",
            status: "completed",
            templateName: "Raw Upload",
            jobCreatedAt: /* @__PURE__ */ new Date(),
            originalUrl: imageUrl,
            processedUrl: imageUrl,
            thumbnailUrl: imageUrl
          };
          uploadedImages.push(imageData);
        } catch (fileError) {
          console.error(`Failed to process ${file.originalname}:`, fileError);
        }
      }
      await logAudit(
        req.session.userId,
        "gallery_images_upload",
        req.ip || "unknown",
        req.get("User-Agent"),
        {
          uploadedCount: uploadedImages.length,
          totalSize: uploadedImages.reduce((sum2, img) => sum2 + img.fileSize, 0)
        }
      );
      res.json({
        success: true,
        message: `Successfully uploaded ${uploadedImages.length} images to gallery`,
        images: uploadedImages,
        totalCount: uploadedImages.length
      });
    } catch (error) {
      console.error("Gallery upload error:", error);
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          try {
            await fs6.unlink(file.path);
          } catch (cleanupError) {
            console.error("Failed to cleanup file:", cleanupError);
          }
        }
      }
      res.status(500).json({
        message: error.message || "Failed to upload images to gallery",
        error: process.env.NODE_ENV === "development" ? error.stack : void 0
      });
    }
  });
  const mediaZipUpload = multer3({
    dest: "uploads/media/zips/",
    limits: {
      fileSize: 500 * 1024 * 1024,
      // 500MB limit for ZIP files
      files: 1
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "application/zip" || file.originalname.endsWith(".zip")) {
        cb(null, true);
      } else {
        cb(new Error("Only ZIP files are allowed"));
      }
    }
  });
  app2.post("/api/media/upload-zip", mediaZipUpload.single("zip"), async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No ZIP file provided" });
      }
      const zipPath = req.file.path;
      const extractDir = `uploads/media/extracted/${Date.now()}`;
      await fs6.mkdir(extractDir, { recursive: true });
      const zip = new AdmZip(zipPath);
      const zipEntries = zip.getEntries();
      const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"];
      const imageEntries = zipEntries.filter((entry) => {
        const ext = path5.extname(entry.entryName).toLowerCase();
        return imageExtensions.includes(ext) && !entry.isDirectory;
      });
      if (imageEntries.length === 0) {
        return res.status(400).json({ message: "No valid image files found in ZIP" });
      }
      if (imageEntries.length > 1e3) {
        return res.status(400).json({
          message: `Too many images. Found ${imageEntries.length}, maximum allowed is 1000`
        });
      }
      const extractedImages = [];
      const BATCH_SIZE = 50;
      for (let i = 0; i < imageEntries.length; i += BATCH_SIZE) {
        const batch = imageEntries.slice(i, i + BATCH_SIZE);
        for (const entry of batch) {
          try {
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${path5.basename(entry.entryName)}`;
            const filePath = path5.join(extractDir, fileName);
            zip.extractEntryTo(entry, extractDir, false, true, false, fileName);
            const stats = await fs6.stat(filePath);
            extractedImages.push({
              name: entry.entryName,
              url: `/uploads/media/extracted/${path5.basename(extractDir)}/${fileName}`,
              size: stats.size
            });
          } catch (entryError) {
            console.error(`Failed to extract ${entry.entryName}:`, entryError);
          }
        }
        if (i + BATCH_SIZE < imageEntries.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      try {
        await fs6.unlink(zipPath);
      } catch (cleanupError) {
        console.error("Failed to cleanup ZIP file:", cleanupError);
      }
      await logAudit(
        req.session.userId,
        "media_zip_upload",
        req.ip || "unknown",
        req.get("User-Agent"),
        {
          zipFileName: req.file.originalname,
          extractedCount: extractedImages.length,
          totalSize: extractedImages.reduce((sum2, img) => sum2 + img.size, 0)
        }
      );
      res.json({
        success: true,
        message: `Successfully extracted ${extractedImages.length} images from ZIP`,
        images: extractedImages,
        totalCount: extractedImages.length,
        extractedPath: extractDir
      });
    } catch (error) {
      console.error("ZIP upload error:", error);
      if (req.file?.path) {
        try {
          await fs6.unlink(req.file.path);
        } catch (cleanupError) {
          console.error("Failed to cleanup ZIP file on error:", cleanupError);
        }
      }
      res.status(500).json({
        message: error.message || "Failed to process ZIP file",
        error: process.env.NODE_ENV === "development" ? error.stack : void 0
      });
    }
  });
  app2.get("/api/media", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      let jobs = [];
      try {
        const query = `
          SELECT 
            i.id,
            i.original_url,
            i.processed_url,
            i.status,
            i.created_at,
            pj.id as job_id,
            pj.template_id,
            pj.created_at as job_created_at,
            pj.user_id
          FROM images i
          JOIN processing_jobs pj ON i.job_id = pj.id
          WHERE pj.user_id = ?
          ORDER BY i.created_at DESC
        `;
        const [rows] = await pool.execute(query, [req.session.userId]);
        jobs = rows.map((row) => ({
          id: row.id,
          type: row.template_id === "upload-only" ? "uploaded" : "processed",
          templateName: row.template_id === "upload-only" ? "Raw Upload" : "Processed",
          jobCreatedAt: row.job_created_at,
          originalName: path5.basename(row.original_url),
          status: row.status,
          originalUrl: row.original_url,
          processedUrl: row.processed_url || row.original_url,
          thumbnailUrl: row.processed_url || row.original_url,
          jobId: row.job_id,
          userId: row.user_id
        }));
        console.log(`Found ${jobs.length} images for user ${req.session.userId}`);
      } catch (dbError) {
        console.error("Database query failed, falling back to filesystem:", dbError);
        try {
          const galleryDir = "uploads/gallery";
          const galleryFiles = await fs6.readdir(galleryDir);
          jobs = galleryFiles.filter((file) => {
            const ext = path5.extname(file).toLowerCase();
            return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
          }).map((file) => ({
            id: `uploaded-${file}`,
            type: "uploaded",
            templateName: "Raw Upload",
            jobCreatedAt: /* @__PURE__ */ new Date(),
            originalName: file,
            status: "completed",
            originalUrl: `/uploads/gallery/${file}`,
            processedUrl: `/uploads/gallery/${file}`,
            thumbnailUrl: `/uploads/gallery/${file}`
          }));
        } catch (fsError) {
          console.error("Filesystem fallback also failed:", fsError);
        }
      }
      const user = await storage.getUser(req.session.userId);
      let templateImages = [];
      if (user?.role === "admin") {
        const templates2 = await storage.getAllTemplatesForAdmin();
        templateImages = templates2.filter((t) => t.thumbnailUrl).map((t) => ({
          id: `template-${t.id}`,
          type: "template",
          name: t.name,
          category: t.category,
          thumbnailUrl: t.thumbnailUrl,
          templateId: t.id,
          createdAt: t.createdAt,
          isPremium: t.isPremium,
          isActive: t.isActive
        }));
      } else {
        const templates2 = await storage.getAllTemplates();
        templateImages = templates2.filter((t) => t.thumbnailUrl && t.isActive).map((t) => ({
          id: `template-${t.id}`,
          type: "template",
          name: t.name,
          category: t.category,
          thumbnailUrl: t.thumbnailUrl,
          templateId: t.id,
          createdAt: t.createdAt,
          isPremium: t.isPremium,
          isActive: t.isActive
        }));
      }
      res.json({
        jobs,
        // Images from database
        templateImages
      });
    } catch (error) {
      console.error("Failed to get media:", error);
      res.status(500).json({ message: error.message || "Failed to get media" });
    }
  });
  registerOpenAIRoutes(app2);
  registerTemplateAIRoutes(app2);
  return createServer(app2);
}

// server/vite.ts
import express from "express";
import fs7 from "fs";
import path7 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path6 from "path";
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path6.resolve(import.meta.dirname, "client", "src"),
      "@shared": path6.resolve(import.meta.dirname, "shared"),
      "@assets": path6.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path6.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path6.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path7.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs7.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path7.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs7.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path7.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import path8 from "path";
dotenv3.config();
process.env.NO_PROXY = "localhost,127.0.0.1";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use("/uploads", express2.static(path8.join(process.cwd(), "uploads")));
var MySQLStoreSession = MySQLStore(session);
app.use(
  session({
    store: new MySQLStoreSession({}, pool),
    secret: process.env.SESSION_SECRET || "drisya-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // 30 days
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax"
    }
  })
);
app.use((req, res, next) => {
  if (req.path.startsWith("/api") && !req.path.startsWith("/api/auth")) {
    if (!req.session || !req.session.userId) {
      log(`\u26A0\uFE0F No session for ${req.method} ${req.path} - Session ID: ${req.sessionID || "none"}`);
    }
  }
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path9 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path9.startsWith("/api")) {
      let logLine = `${req.method} ${path9} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5001", 10);
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
