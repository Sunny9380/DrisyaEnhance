import { db } from "./db";
import {
  type User,
  type InsertUser,
  type Template,
  type InsertTemplate,
  type ProcessingJob,
  type InsertProcessingJob,
  type Image,
  type InsertImage,
  type Transaction,
  type InsertTransaction,
  type TemplateFavorite,
  type InsertTemplateFavorite,
  type AuditLog,
  type InsertAuditLog,
  type CoinPackage,
  type InsertCoinPackage,
  type ManualTransaction,
  type InsertManualTransaction,
  type MediaLibrary,
  type InsertMediaLibrary,
  type Referral,
  type InsertReferral,
  type AIEdit,
  type InsertAIEdit,
  type AIUsageLedger,
  type InsertAIUsageLedger,
  users,
  templates,
  processingJobs,
  images,
  transactions,
  templateFavorites,
  auditLogs,
  coinPackages,
  manualTransactions,
  mediaLibrary,
  referrals,
  aiEdits,
  aiUsageLedger,
} from "@shared/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: string, data: Partial<Pick<User, 'name' | 'phone' | 'avatarUrl' | 'emailNotifications' | 'notifyJobCompletion' | 'notifyPaymentConfirmed' | 'notifyCoinsAdded'>>): Promise<User>;
  getUserStats(userId: string): Promise<{
    totalJobs: number;
    totalImagesProcessed: number;
    totalCoinsSpent: number;
    totalCoinsPurchased: number;
    accountAge: number;
  }>;
  updateUserCoins(userId: string, amount: number): Promise<void>;
  addCoinsWithTransaction(
    userId: string,
    amount: number,
    transactionData: Omit<InsertTransaction, "userId" | "amount">
  ): Promise<void>;

  // Usage Quotas
  checkUserQuota(userId: string): Promise<{ hasQuota: boolean; remaining: number; quota: number; used: number }>;
  incrementMonthlyUsage(userId: string, imageCount: number): Promise<void>;
  resetUserQuota(userId: string): Promise<void>;

  // Templates
  getAllTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, data: Partial<InsertTemplate>): Promise<Template>;

  // Processing Jobs
  createProcessingJob(job: InsertProcessingJob): Promise<ProcessingJob>;
  getProcessingJob(id: string): Promise<ProcessingJob | undefined>;
  getUserProcessingJobs(userId: string): Promise<ProcessingJob[]>;
  updateProcessingJobStatus(
    id: string,
    status: string,
    processedImages: number,
    zipUrl?: string
  ): Promise<void>;

  // Images
  createImage(image: InsertImage): Promise<Image>;
  getJobImages(jobId: string): Promise<Image[]>;
  getImagesByIds(imageIds: string[], userId: string): Promise<Image[]>;
  updateImageStatus(id: string, status: string, processedUrl?: string): Promise<void>;
  deleteImage(id: string, userId: string): Promise<void>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;

  // Template Favorites
  addTemplateFavorite(userId: string, templateId: string): Promise<TemplateFavorite>;
  removeTemplateFavorite(userId: string, templateId: string): Promise<void>;
  getUserFavorites(userId: string): Promise<TemplateFavorite[]>;

  // Audit Logs - Security tracking for SaaS
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getUserAuditLogs(userId: string): Promise<AuditLog[]>;

  // Coin Packages - Admin defines pricing
  getAllCoinPackages(): Promise<CoinPackage[]>;
  getActiveCoinPackages(): Promise<CoinPackage[]>;
  getCoinPackage(id: string): Promise<CoinPackage | undefined>;
  createCoinPackage(pkg: InsertCoinPackage): Promise<CoinPackage>;
  updateCoinPackage(id: string, data: Partial<InsertCoinPackage>): Promise<void>;
  deleteCoinPackage(id: string): Promise<void>;

  // Manual Transactions - WhatsApp payment tracking
  getAllManualTransactions(): Promise<ManualTransaction[]>;
  getManualTransaction(id: string): Promise<ManualTransaction | undefined>;
  getPendingManualTransactions(): Promise<ManualTransaction[]>;
  getUserManualTransactions(userId: string): Promise<ManualTransaction[]>;
  createManualTransaction(txn: InsertManualTransaction): Promise<ManualTransaction>;
  approveManualTransaction(id: string, adminId: string, adminNotes?: string): Promise<void>;
  rejectManualTransaction(id: string, adminId: string, adminNotes: string): Promise<void>;

  // Media Library - Save all processed images
  createMediaLibraryEntry(entry: InsertMediaLibrary): Promise<MediaLibrary>;
  getUserMediaLibrary(userId: string): Promise<MediaLibrary[]>;
  getMediaLibraryEntry(id: string): Promise<MediaLibrary | undefined>;
  toggleMediaFavorite(id: string, isFavorite: boolean): Promise<void>;
  deleteMediaLibraryEntry(id: string): Promise<void>;

  // Referrals - Referral program
  generateReferralCode(userId: string): Promise<string>;
  getUserReferralCode(userId: string): Promise<string | null>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  getUserReferrals(userId: string): Promise<Referral[]>;
  getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalCoinsEarned: number;
  }>;
  completeReferral(referralCode: string, referredUserId: string): Promise<void>;

  // AI Edits - AI-powered image editing
  createAIEdit(edit: InsertAIEdit): Promise<AIEdit>;
  getAIEdit(id: string): Promise<AIEdit | undefined>;
  updateAIEdit(id: string, data: Partial<AIEdit>): Promise<void>;
  listUserAIEdits(userId: string): Promise<AIEdit[]>;
  
  // AI Usage Tracking - Monthly quota management
  getOrCreateAIUsage(userId: string): Promise<AIUsageLedger>;
  incrementAIUsage(userId: string, isFree: boolean, cost: number): Promise<void>;
  checkAIQuota(userId: string): Promise<{ canUse: boolean; remaining: number; limit: number; used: number }>;
  resetMonthlyAIUsage(userId: string): Promise<void>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserCoins(userId: string, amount: number): Promise<void> {
    await db
      .update(users)
      .set({ coinBalance: sql`${users.coinBalance} + ${amount}` })
      .where(eq(users.id, userId));
  }

  async addCoinsWithTransaction(
    userId: string,
    amount: number,
    transactionData: Omit<InsertTransaction, "userId" | "amount">
  ): Promise<void> {
    await db.transaction(async (tx) => {
      // Update user balance with row-level check for negative balance
      const result = await tx
        .update(users)
        .set({ coinBalance: sql`${users.coinBalance} + ${amount}` })
        .where(
          and(
            eq(users.id, userId),
            sql`${users.coinBalance} + ${amount} >= 0`
          )
        )
        .returning();

      if (result.length === 0) {
        throw new Error("Insufficient coins or user not found");
      }

      // Create transaction record
      await tx.insert(transactions).values({
        userId,
        amount,
        ...transactionData,
      });
    });
  }

  async updateUserProfile(
    userId: string, 
    data: Partial<Pick<User, 'name' | 'phone' | 'avatarUrl' | 'emailNotifications' | 'notifyJobCompletion' | 'notifyPaymentConfirmed' | 'notifyCoinsAdded'>>
  ): Promise<User> {
    const result = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    
    if (result.length === 0) {
      throw new Error("User not found");
    }
    
    return result[0];
  }

  async getUserStats(userId: string): Promise<{
    totalJobs: number;
    totalImagesProcessed: number;
    totalCoinsSpent: number;
    totalCoinsPurchased: number;
    accountAge: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const jobs = await db
      .select()
      .from(processingJobs)
      .where(eq(processingJobs.userId, userId));

    const totalJobs = jobs.length;
    const totalImagesProcessed = jobs.reduce((sum, job) => sum + job.processedImages, 0);
    const totalCoinsSpent = jobs.reduce((sum, job) => sum + job.coinsUsed, 0);

    const purchaseTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "purchase")
        )
      );

    const totalCoinsPurchased = purchaseTransactions.reduce(
      (sum, txn) => sum + (txn.amount > 0 ? txn.amount : 0),
      0
    );

    const accountAge = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      totalJobs,
      totalImagesProcessed,
      totalCoinsSpent,
      totalCoinsPurchased,
      accountAge,
    };
  }

  // Usage Quotas
  async checkUserQuota(userId: string): Promise<{ hasQuota: boolean; remaining: number; quota: number; used: number }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if quota needs to be reset (monthly)
    const now = new Date();
    const quotaResetDate = new Date(user.quotaResetDate);
    
    if (now >= quotaResetDate) {
      await this.resetUserQuota(userId);
      // Get updated user data
      const updatedUser = await this.getUser(userId);
      if (!updatedUser) throw new Error("User not found");
      
      return {
        hasQuota: updatedUser.monthlyUsage < updatedUser.monthlyQuota || updatedUser.userTier === "enterprise",
        remaining: updatedUser.userTier === "enterprise" ? 999999 : updatedUser.monthlyQuota - updatedUser.monthlyUsage,
        quota: updatedUser.userTier === "enterprise" ? 999999 : updatedUser.monthlyQuota,
        used: updatedUser.monthlyUsage,
      };
    }

    // Enterprise tier has unlimited quota
    if (user.userTier === "enterprise") {
      return {
        hasQuota: true,
        remaining: 999999,
        quota: 999999,
        used: user.monthlyUsage,
      };
    }

    const remaining = user.monthlyQuota - user.monthlyUsage;
    return {
      hasQuota: remaining > 0,
      remaining: Math.max(0, remaining),
      quota: user.monthlyQuota,
      used: user.monthlyUsage,
    };
  }

  async incrementMonthlyUsage(userId: string, imageCount: number): Promise<void> {
    await db
      .update(users)
      .set({ monthlyUsage: sql`${users.monthlyUsage} + ${imageCount}` })
      .where(eq(users.id, userId));
  }

  async resetUserQuota(userId: string): Promise<void> {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    await db
      .update(users)
      .set({ 
        monthlyUsage: 0,
        quotaResetDate: nextMonth,
      })
      .where(eq(users.id, userId));
  }

  // Templates
  async getAllTemplates(): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.isActive, true));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
    return result[0];
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const result = await db.insert(templates).values(insertTemplate).returning();
    return result[0];
  }

  async updateTemplate(id: string, data: Partial<InsertTemplate>): Promise<Template> {
    const result = await db
      .update(templates)
      .set(data)
      .where(eq(templates.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Template not found");
    }
    
    return result[0];
  }

  // Processing Jobs
  async createProcessingJob(insertJob: InsertProcessingJob): Promise<ProcessingJob> {
    const result = await db.insert(processingJobs).values(insertJob).returning();
    return result[0];
  }

  async getProcessingJob(id: string): Promise<ProcessingJob | undefined> {
    const result = await db
      .select()
      .from(processingJobs)
      .where(eq(processingJobs.id, id))
      .limit(1);
    return result[0];
  }

  async getUserProcessingJobs(userId: string): Promise<ProcessingJob[]> {
    return await db
      .select()
      .from(processingJobs)
      .where(eq(processingJobs.userId, userId))
      .orderBy(desc(processingJobs.createdAt));
  }

  async updateProcessingJobStatus(
    id: string,
    status: string,
    processedImages: number,
    zipUrl?: string
  ): Promise<void> {
    const updateData: any = { status, processedImages };
    if (zipUrl) {
      updateData.zipUrl = zipUrl;
    }
    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    await db.update(processingJobs).set(updateData).where(eq(processingJobs.id, id));
  }

  // Images
  async createImage(insertImage: InsertImage): Promise<Image> {
    const result = await db.insert(images).values(insertImage).returning();
    return result[0];
  }

  async getJobImages(jobId: string): Promise<Image[]> {
    return await db.select().from(images).where(eq(images.jobId, jobId));
  }

  async getImagesByIds(imageIds: string[], userId: string): Promise<Image[]> {
    // Get images that belong to jobs owned by this user
    const result = await db
      .select({
        image: images,
      })
      .from(images)
      .innerJoin(processingJobs, eq(images.jobId, processingJobs.id))
      .where(
        and(
          inArray(images.id, imageIds),
          eq(processingJobs.userId, userId)
        )
      );
    
    return result.map(r => r.image);
  }

  async updateImageStatus(id: string, status: string, processedUrl?: string): Promise<void> {
    const updateData: any = { status };
    if (processedUrl) {
      updateData.processedUrl = processedUrl;
    }

    await db.update(images).set(updateData).where(eq(images.id, id));
  }

  async deleteImage(id: string, userId: string): Promise<void> {
    // Only delete if the image belongs to a job owned by this user
    const result = await db
      .select({ jobId: images.jobId })
      .from(images)
      .innerJoin(processingJobs, eq(images.jobId, processingJobs.id))
      .where(
        and(
          eq(images.id, id),
          eq(processingJobs.userId, userId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      throw new Error("Image not found or access denied");
    }

    await db.delete(images).where(eq(images.id, id));
  }

  // Transactions
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(insertTransaction).returning();
    return result[0];
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  // Template Favorites
  async addTemplateFavorite(userId: string, templateId: string): Promise<TemplateFavorite> {
    const result = await db
      .insert(templateFavorites)
      .values({ userId, templateId })
      .returning();
    return result[0];
  }

  async removeTemplateFavorite(userId: string, templateId: string): Promise<void> {
    await db
      .delete(templateFavorites)
      .where(
        and(
          eq(templateFavorites.userId, userId),
          eq(templateFavorites.templateId, templateId)
        )
      );
  }

  async getUserFavorites(userId: string): Promise<TemplateFavorite[]> {
    return await db
      .select()
      .from(templateFavorites)
      .where(eq(templateFavorites.userId, userId));
  }

  // Audit Logs - Security tracking for SaaS
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const result = await db.insert(auditLogs).values(log).returning();
    return result[0];
  }

  async getUserAuditLogs(userId: string): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(100); // Last 100 audit logs
  }

  // Coin Packages - Admin defines pricing
  async getAllCoinPackages(): Promise<CoinPackage[]> {
    return await db
      .select()
      .from(coinPackages)
      .orderBy(coinPackages.displayOrder, desc(coinPackages.createdAt));
  }

  async getActiveCoinPackages(): Promise<CoinPackage[]> {
    return await db
      .select()
      .from(coinPackages)
      .where(eq(coinPackages.isActive, true))
      .orderBy(coinPackages.displayOrder);
  }

  async getCoinPackage(id: string): Promise<CoinPackage | undefined> {
    const result = await db.select().from(coinPackages).where(eq(coinPackages.id, id)).limit(1);
    return result[0];
  }

  async createCoinPackage(pkg: InsertCoinPackage): Promise<CoinPackage> {
    const result = await db.insert(coinPackages).values(pkg).returning();
    return result[0];
  }

  async updateCoinPackage(id: string, data: Partial<InsertCoinPackage>): Promise<void> {
    await db
      .update(coinPackages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(coinPackages.id, id));
  }

  async deleteCoinPackage(id: string): Promise<void> {
    await db.delete(coinPackages).where(eq(coinPackages.id, id));
  }

  // Manual Transactions - WhatsApp payment tracking
  async getAllManualTransactions(): Promise<ManualTransaction[]> {
    return await db.select().from(manualTransactions).orderBy(desc(manualTransactions.createdAt));
  }

  async getManualTransaction(id: string): Promise<ManualTransaction | undefined> {
    const result = await db
      .select()
      .from(manualTransactions)
      .where(eq(manualTransactions.id, id))
      .limit(1);
    return result[0];
  }

  async getPendingManualTransactions(): Promise<ManualTransaction[]> {
    return await db
      .select()
      .from(manualTransactions)
      .where(eq(manualTransactions.status, "pending"))
      .orderBy(desc(manualTransactions.createdAt));
  }

  async getUserManualTransactions(userId: string): Promise<ManualTransaction[]> {
    return await db
      .select()
      .from(manualTransactions)
      .where(eq(manualTransactions.userId, userId))
      .orderBy(desc(manualTransactions.createdAt));
  }

  async createManualTransaction(txn: InsertManualTransaction): Promise<ManualTransaction> {
    const result = await db.insert(manualTransactions).values(txn).returning();
    return result[0];
  }

  async approveManualTransaction(
    id: string,
    adminId: string,
    adminNotes?: string
  ): Promise<void> {
    await db.transaction(async (tx) => {
      // Get the manual transaction
      const result = await tx
        .select()
        .from(manualTransactions)
        .where(eq(manualTransactions.id, id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Manual transaction not found");
      }

      const mtxn = result[0];

      if (mtxn.status !== "pending") {
        throw new Error("Transaction is not pending");
      }

      // Update user coins and create coin transaction
      await tx
        .update(users)
        .set({ coinBalance: sql`${users.coinBalance} + ${mtxn.coinAmount}` })
        .where(eq(users.id, mtxn.userId));

      await tx.insert(transactions).values({
        userId: mtxn.userId,
        type: "purchase",
        amount: mtxn.coinAmount,
        description: `Manual coin purchase - ${mtxn.paymentMethod}`,
        metadata: {
          manualTransactionId: id,
          paymentReference: mtxn.paymentReference,
          adminId,
        },
      });

      // Update manual transaction status
      await tx
        .update(manualTransactions)
        .set({
          status: "completed",
          adminId,
          adminNotes: adminNotes || mtxn.adminNotes,
          approvedAt: new Date(),
          completedAt: new Date(),
        })
        .where(eq(manualTransactions.id, id));
    });
  }

  async rejectManualTransaction(
    id: string,
    adminId: string,
    adminNotes: string
  ): Promise<void> {
    await db
      .update(manualTransactions)
      .set({
        status: "rejected",
        adminId,
        adminNotes,
      })
      .where(eq(manualTransactions.id, id));
  }

  // Media Library
  async createMediaLibraryEntry(entry: InsertMediaLibrary): Promise<MediaLibrary> {
    const result = await db.insert(mediaLibrary).values(entry).returning();
    return result[0];
  }

  async getUserMediaLibrary(userId: string): Promise<MediaLibrary[]> {
    return await db
      .select()
      .from(mediaLibrary)
      .where(eq(mediaLibrary.userId, userId))
      .orderBy(desc(mediaLibrary.createdAt));
  }

  async getMediaLibraryEntry(id: string): Promise<MediaLibrary | undefined> {
    const result = await db
      .select()
      .from(mediaLibrary)
      .where(eq(mediaLibrary.id, id))
      .limit(1);
    return result[0];
  }

  async toggleMediaFavorite(id: string, isFavorite: boolean): Promise<void> {
    await db
      .update(mediaLibrary)
      .set({ isFavorite })
      .where(eq(mediaLibrary.id, id));
  }

  async deleteMediaLibraryEntry(id: string): Promise<void> {
    await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id));
  }

  // Referrals
  async generateReferralCode(userId: string): Promise<string> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.referralCode) {
      return user.referralCode;
    }

    // Generate unique referral code: DRISYA-{first 2 letters of name}{random 4 chars}
    const namePrefix = user.name?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referralCode = `DRISYA-${namePrefix}${randomSuffix}`;

    // Update user with referral code
    await db
      .update(users)
      .set({ referralCode })
      .where(eq(users.id, userId));

    return referralCode;
  }

  async getUserReferralCode(userId: string): Promise<string | null> {
    const user = await this.getUser(userId);
    return user?.referralCode || null;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, code))
      .limit(1);
    return result[0];
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const result = await db.insert(referrals).values(referral).returning();
    return result[0];
  }

  async getUserReferrals(userId: string): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  async getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalCoinsEarned: number;
  }> {
    const userReferrals = await this.getUserReferrals(userId);
    
    const totalReferrals = userReferrals.length;
    const completedReferrals = userReferrals.filter(r => r.status === "completed").length;
    const pendingReferrals = userReferrals.filter(r => r.status === "pending").length;
    const totalCoinsEarned = userReferrals.reduce((sum, r) => sum + r.coinsEarned, 0);

    return {
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      totalCoinsEarned,
    };
  }

  async completeReferral(referralCode: string, referredUserId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Find the referral
      const result = await tx
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, referralCode))
        .limit(1);
      
      const referral = result[0];
      if (!referral) {
        throw new Error("Referral not found");
      }

      // Update referral status
      await tx
        .update(referrals)
        .set({
          referredUserId,
          status: "completed",
          coinsEarned: 50,
          completedAt: new Date(),
        })
        .where(eq(referrals.id, referral.id));

      // Award coins to referrer
      await tx
        .update(users)
        .set({
          coinBalance: sql`${users.coinBalance} + 50`,
        })
        .where(eq(users.id, referral.referrerId));

      // Create transaction record
      await tx.insert(transactions).values({
        userId: referral.referrerId,
        type: "referral",
        amount: 50,
        description: "Referral bonus - Friend signed up",
        metadata: { referralId: referral.id, referredUserId },
      });
    });
  }

  // AI Edits - AI-powered image editing
  async createAIEdit(edit: InsertAIEdit): Promise<AIEdit> {
    const result = await db.insert(aiEdits).values(edit).returning();
    return result[0];
  }

  async getAIEdit(id: string): Promise<AIEdit | undefined> {
    const result = await db.select().from(aiEdits).where(eq(aiEdits.id, id)).limit(1);
    return result[0];
  }

  async updateAIEdit(id: string, data: Partial<AIEdit>): Promise<void> {
    await db.update(aiEdits).set(data).where(eq(aiEdits.id, id));
  }

  async listUserAIEdits(userId: string): Promise<AIEdit[]> {
    return await db
      .select()
      .from(aiEdits)
      .where(eq(aiEdits.userId, userId))
      .orderBy(desc(aiEdits.createdAt));
  }

  // AI Usage Tracking - Monthly quota management
  async getOrCreateAIUsage(userId: string): Promise<AIUsageLedger> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Try to get existing record
    const existing = await db
      .select()
      .from(aiUsageLedger)
      .where(eq(aiUsageLedger.userId, userId))
      .limit(1);

    if (existing[0]) {
      // Check if month has changed, reset if needed
      if (existing[0].month !== currentMonth) {
        await db
          .update(aiUsageLedger)
          .set({
            month: currentMonth,
            freeRequests: 0,
            paidRequests: 0,
            totalCost: 0,
            lastReset: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(aiUsageLedger.userId, userId));
        
        return await this.getOrCreateAIUsage(userId);
      }
      return existing[0];
    }

    // Create new record
    const result = await db
      .insert(aiUsageLedger)
      .values({ userId })
      .returning();
    return result[0];
  }

  async incrementAIUsage(userId: string, isFree: boolean, cost: number): Promise<void> {
    const usage = await this.getOrCreateAIUsage(userId);
    
    await db
      .update(aiUsageLedger)
      .set({
        freeRequests: isFree ? usage.freeRequests + 1 : usage.freeRequests,
        paidRequests: !isFree ? usage.paidRequests + 1 : usage.paidRequests,
        totalCost: usage.totalCost + cost,
        updatedAt: new Date(),
      })
      .where(eq(aiUsageLedger.userId, userId));
  }

  async checkAIQuota(userId: string): Promise<{ canUse: boolean; remaining: number; limit: number; used: number }> {
    const usage = await this.getOrCreateAIUsage(userId);
    const freeLimit = 1000; // HuggingFace free tier limit per month
    
    const remaining = freeLimit - usage.freeRequests;
    const canUse = remaining > 0;
    
    return {
      canUse,
      remaining: Math.max(0, remaining),
      limit: freeLimit,
      used: usage.freeRequests,
    };
  }

  async resetMonthlyAIUsage(userId: string): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    await db
      .update(aiUsageLedger)
      .set({
        month: currentMonth,
        freeRequests: 0,
        paidRequests: 0,
        totalCost: 0,
        lastReset: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(aiUsageLedger.userId, userId));
  }
}

export const storage = new DbStorage();
