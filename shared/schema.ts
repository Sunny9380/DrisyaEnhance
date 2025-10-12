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
  coinBalance: integer("coin_balance").notNull().default(0),
  role: text("role").notNull().default("user"), // user, admin
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Templates table
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  settings: jsonb("settings"), // JSON settings for the template
  isActive: boolean("is_active").notNull().default(true),
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

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  coinBalance: true,
  role: true,
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
