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
  users,
  templates,
  processingJobs,
  images,
  transactions,
  templateFavorites,
  auditLogs,
  coinPackages,
  manualTransactions,
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCoins(userId: string, amount: number): Promise<void>;
  addCoinsWithTransaction(
    userId: string,
    amount: number,
    transactionData: Omit<InsertTransaction, "userId" | "amount">
  ): Promise<void>;

  // Templates
  getAllTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;

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
  updateImageStatus(id: string, status: string, processedUrl?: string): Promise<void>;

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

  async updateImageStatus(id: string, status: string, processedUrl?: string): Promise<void> {
    const updateData: any = { status };
    if (processedUrl) {
      updateData.processedUrl = processedUrl;
    }

    await db.update(images).set(updateData).where(eq(images.id, id));
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
}

export const storage = new DbStorage();
