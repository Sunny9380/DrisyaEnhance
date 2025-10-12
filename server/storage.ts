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
  users,
  templates,
  processingJobs,
  images,
  transactions,
  templateFavorites,
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
}

export const storage = new DbStorage();
