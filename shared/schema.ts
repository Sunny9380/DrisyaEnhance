import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  phone: text("phone"), // WhatsApp number for admin contact
  avatarUrl: text("avatar_url"), // Profile avatar image URL
  referralCode: text("referral_code").unique(), // User's unique referral code
  coinBalance: integer("coin_balance").notNull().default(0),
  role: text("role").notNull().default("user"), // user, admin
  userTier: text("user_tier").notNull().default("free"), // free, basic, pro, enterprise
  monthlyQuota: integer("monthly_quota").notNull().default(50), // Images per month - Free: 50, Basic: 200, Pro: 1000, Enterprise: unlimited
  monthlyUsage: integer("monthly_usage").notNull().default(0), // Current month's usage
  quotaResetDate: timestamp("quota_reset_date").notNull().defaultNow(), // When quota resets
  emailNotifications: boolean("email_notifications").notNull().default(true), // Allow users to opt-out
  notifyJobCompletion: boolean("notify_job_completion").notNull().default(true),
  notifyPaymentConfirmed: boolean("notify_payment_confirmed").notNull().default(true),
  notifyCoinsAdded: boolean("notify_coins_added").notNull().default(true),
  isTrialUsed: boolean("is_trial_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Templates table
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // jewelry, fashion, etc.
  backgroundStyle: text("background_style").default("gradient"), // velvet, marble, minimal, gradient, festive
  lightingPreset: text("lighting_preset").default("soft-glow"), // moody, soft-glow, spotlight, studio
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  settings: jsonb("settings"), // Advanced settings: { diffusionPrompt, shadowIntensity, vignetteStrength, etc. }
  isPremium: boolean("is_premium").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  // Pricing & Product Details
  coinCost: integer("coin_cost").notNull().default(1), // Cost per image in coins
  pricePerImage: integer("price_per_image"), // Price in currency (optional, for display)
  features: jsonb("features"), // Array of feature objects: [{ title, description, icon }]
  benefits: jsonb("benefits"), // Array of benefit text items
  useCases: jsonb("use_cases"), // Array of use case objects: [{ title, description, imageUrl }]
  whyBuy: text("why_buy"), // Compelling reason to choose this template
  testimonials: jsonb("testimonials"), // Array: [{ name, role, content, avatarUrl, rating }]
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Processing jobs table
export const processingJobs = pgTable("processing_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  templateId: varchar("template_id").notNull().references(() => templates.id),
  status: text("status").notNull().default("queued"), // queued, processing, completed, failed
  totalImages: integer("total_images").notNull(),
  processedImages: integer("processed_images").notNull().default(0),
  coinsUsed: integer("coins_used").notNull(),
  batchSettings: jsonb("batch_settings"), // brightness, contrast, etc.
  zipUrl: text("zip_url"), // URL to download processed images
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Images table
export const images = pgTable("images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => processingJobs.id),
  originalUrl: text("original_url").notNull(),
  processedUrl: text("processed_url"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Transactions table for coin purchases and usage
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // purchase, usage, refund, referral
  amount: integer("amount").notNull(), // positive for credit, negative for debit
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // Additional data like job_id, payment_id, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Template favorites
export const templateFavorites = pgTable("template_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  templateId: varchar("template_id").notNull().references(() => templates.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Team members
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => users.id), // References admin user
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // admin, editor, viewer
  status: text("status").notNull().default("pending"), // pending, active, inactive
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Referrals
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  referredUserId: varchar("referred_user_id").references(() => users.id),
  referralCode: text("referral_code").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, completed
  coinsEarned: integer("coins_earned").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Security Audit Logs - Track IP addresses and user actions for SaaS security
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // nullable for anonymous actions
  action: text("action").notNull(), // login, logout, upload, process, download, etc.
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"), // Additional context (template_id, job_id, file_count, etc.)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Coin Packages - Admin defines pricing packages (e.g., 100 coins = ₹500)
export const coinPackages = pgTable("coin_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // e.g., "Starter Pack", "Professional Pack"
  coinAmount: integer("coin_amount").notNull(), // Number of coins in the package
  priceInINR: integer("price_in_inr").notNull(), // Price in Indian Rupees
  discount: integer("discount").default(0), // Discount percentage (0-100)
  description: text("description"), // e.g., "Best value for regular users"
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0), // Sort order for display
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Manual Transactions - Track WhatsApp/manual payments and admin fulfillment
export const manualTransactions = pgTable("manual_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  packageId: varchar("package_id").references(() => coinPackages.id), // Optional reference to package
  coinAmount: integer("coin_amount").notNull(), // Coins to be credited
  priceInINR: integer("price_in_inr").notNull(), // Amount paid by user
  paymentMethod: text("payment_method").notNull().default("whatsapp"), // whatsapp, bank_transfer, upi, etc.
  paymentReference: text("payment_reference"), // WhatsApp message ID, transaction ID, etc.
  adminId: varchar("admin_id").references(() => users.id), // Admin who processed this
  adminNotes: text("admin_notes"), // Admin's internal notes
  userPhone: text("user_phone"), // Contact number for verification
  status: text("status").notNull().default("pending"), // pending, approved, rejected, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"), // When admin approved the payment
  completedAt: timestamp("completed_at"), // When coins were credited
});

// Media Library - Store all processed images for user access and management
export const mediaLibrary = pgTable("media_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobId: varchar("job_id").references(() => processingJobs.id), // Optional reference to processing job
  imageId: varchar("image_id").references(() => images.id), // Optional reference to specific image
  fileName: text("file_name").notNull(), // Original filename
  processedUrl: text("processed_url").notNull(), // URL to processed image
  thumbnailUrl: text("thumbnail_url"), // Optional thumbnail for faster loading
  fileSize: integer("file_size"), // File size in bytes
  dimensions: text("dimensions"), // e.g., "1080x1080"
  templateUsed: text("template_used"), // Template name used for processing
  tags: text("tags").array(), // User-defined tags for organization
  isFavorite: boolean("is_favorite").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// AI Edits - Track AI-powered image editing requests
export const aiEdits = pgTable("ai_edits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobId: varchar("job_id").references(() => processingJobs.id), // Optional link to processing job
  imageId: varchar("image_id").references(() => images.id), // Optional link to specific image
  prompt: text("prompt").notNull(), // User's editing instruction
  aiModel: text("ai_model").notNull().default("auto"), // qwen-2509, flux-kontext, auto
  status: text("status").notNull().default("queued"), // queued, processing, completed, failed
  inputImageUrl: text("input_image_url").notNull(), // Original image URL
  outputImageUrl: text("output_image_url"), // AI-edited result URL
  cost: integer("cost").notNull().default(0), // API cost in cents (0 for free tier)
  errorMessage: text("error_message"), // Error details if failed
  metadata: jsonb("metadata"), // Model params, retry count, processing time, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// AI Usage Ledger - Track monthly quota usage per user
export const aiUsageLedger = pgTable("ai_usage_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  month: text("month").notNull().default(sql`to_char(CURRENT_DATE, 'YYYY-MM')`), // e.g., "2025-10"
  freeRequests: integer("free_requests").notNull().default(0), // Count of HF API free tier calls
  paidRequests: integer("paid_requests").notNull().default(0), // Count of paid API calls
  totalCost: integer("total_cost").notNull().default(0), // Total API cost in cents
  lastReset: timestamp("last_reset").notNull().defaultNow(), // When quota was last reset
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
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
  createdAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
});

export const insertProcessingJobSchema = createInsertSchema(processingJobs).omit({
  id: true,
  processedImages: true,
  zipUrl: true,
  createdAt: true,
  completedAt: true,
});

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  processedUrl: true,
  status: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertTemplateFavoriteSchema = createInsertSchema(templateFavorites).omit({
  id: true,
  createdAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  referredUserId: true,
  status: true,
  coinsEarned: true,
  createdAt: true,
  completedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertCoinPackageSchema = createInsertSchema(coinPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertManualTransactionSchema = createInsertSchema(manualTransactions).omit({
  id: true,
  status: true,
  createdAt: true,
  approvedAt: true,
  completedAt: true,
});

export const insertMediaLibrarySchema = createInsertSchema(mediaLibrary).omit({
  id: true,
  createdAt: true,
});

export const insertAIEditSchema = createInsertSchema(aiEdits).omit({
  id: true,
  userId: true, // Added by backend from session
  status: true,
  outputImageUrl: true,
  cost: true,
  errorMessage: true,
  metadata: true,
  createdAt: true,
  completedAt: true,
});

export const insertAIUsageLedgerSchema = createInsertSchema(aiUsageLedger).omit({
  id: true,
  month: true,
  freeRequests: true,
  paidRequests: true,
  totalCost: true,
  lastReset: true,
  updatedAt: true,
});

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

export type InsertProcessingJob = z.infer<typeof insertProcessingJobSchema>;
export type ProcessingJob = typeof processingJobs.$inferSelect;

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertTemplateFavorite = z.infer<typeof insertTemplateFavoriteSchema>;
export type TemplateFavorite = typeof templateFavorites.$inferSelect;

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertCoinPackage = z.infer<typeof insertCoinPackageSchema>;
export type CoinPackage = typeof coinPackages.$inferSelect;

export type InsertManualTransaction = z.infer<typeof insertManualTransactionSchema>;
export type ManualTransaction = typeof manualTransactions.$inferSelect;

export type InsertMediaLibrary = z.infer<typeof insertMediaLibrarySchema>;
export type MediaLibrary = typeof mediaLibrary.$inferSelect;

export type InsertAIEdit = z.infer<typeof insertAIEditSchema>;
export type AIEdit = typeof aiEdits.$inferSelect;

export type InsertAIUsageLedger = z.infer<typeof insertAIUsageLedgerSchema>;
export type AIUsageLedger = typeof aiUsageLedger.$inferSelect;
