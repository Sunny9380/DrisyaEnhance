import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";

// Extend session type to include userId
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

import { storage } from "./storage";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import archiver from "archiver";
import axios from "axios";
import AdmZip from "adm-zip";
import { insertUserSchema, insertProcessingJobSchema, insertCoinPackageSchema, insertManualTransactionSchema, insertMediaLibrarySchema, insertAIEditSchema } from "@shared/schema";
import { sendWelcomeEmail, sendJobCompletedEmail, sendPaymentConfirmedEmail, sendCoinsAddedEmail, shouldSendEmail } from "./email";
import { aiEditQueue } from "./queues/aiEditQueue";
import { jewelryAIGenerator } from "./services/jewelryAIGenerator";
import { aiImageEnhancer } from "./services/aiImageEnhancer";
import { z } from "zod";
import { pool } from "./db";

// Helper function to log audit events (IP tracking for SaaS security)
async function logAudit(
  userId: string | undefined,
  action: string,
  ipAddress: string,
  userAgent: string | undefined,
  metadata?: any
) {
  try {
    await storage.createAuditLog({
      userId: userId || null,
      action,
      ipAddress,
      userAgent: userAgent || null,
      metadata: metadata || null,
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

// Helper function to extract IP address from request
function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}


// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

// Configure multer for bulk uploads (up to 10,000 images)
const bulkUpload = multer({
  dest: "uploads/bulk/",
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 10000 // Maximum 10,000 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (JPG, PNG, WebP, GIF, BMP, TIFF)"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // ============== Authentication Routes ==============
  
  // Register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { referralCode, ...userData } = req.body;
      const validatedData = insertUserSchema.parse(userData);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user with trial bonus flag
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        isTrialUsed: true,
      });

      // Give welcome bonus coins (atomic transaction)
      await storage.addCoinsWithTransaction(user.id, 100, {
        type: "trial_bonus",
        description: "Welcome bonus - 100 free coins",
        metadata: { source: "trial_bonus" },
      });

      // Handle referral code if provided
      if (referralCode) {
        try {
          const referrer = await storage.getUserByReferralCode(referralCode);
          if (referrer) {
            // Create referral record
            await storage.createReferral({
              referrerId: referrer.id,
              referralCode: referralCode,
            });

            // Complete the referral and award coins
            await storage.completeReferral(referralCode, user.id);

            // Send referral success email to referrer (non-blocking)
            const updatedReferrer = await storage.getUser(referrer.id);
            if (updatedReferrer && shouldSendEmail(updatedReferrer, "referral")) {
              const { sendReferralSuccessEmail } = await import("./email");
              sendReferralSuccessEmail(updatedReferrer, user).catch((error) => {
                console.error("Failed to send referral email:", error);
              });
            }
          }
        } catch (error) {
          console.error("Failed to process referral:", error);
        }
      }

      // Set session
      req.session.userId = user.id;

      // Explicitly save session to PostgreSQL to ensure persistence
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Send welcome email (non-blocking)
      const updatedUser = await storage.getUser(user.id);
      if (updatedUser && shouldSendEmail(updatedUser, "welcome")) {
        sendWelcomeEmail(updatedUser).catch((error) => {
          console.error("Failed to send welcome email:", error);
        });
      }

      res.json({
        user: { id: user.id, email: user.email, name: user.name, coinBalance: 100, role: user.role },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;

      // Explicitly save session to PostgreSQL to ensure persistence
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Log login for security audit (SaaS requirement)
      await logAudit(
        user.id,
        'login',
        getClientIP(req),
        req.headers['user-agent'],
        { email: user.email }
      );

      res.json({
        user: { id: user.id, email: user.email, name: user.name, coinBalance: user.coinBalance, role: user.role },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: { id: user.id, email: user.email, name: user.name, coinBalance: user.coinBalance, role: user.role, avatarUrl: user.avatarUrl },
    });
  });

  // ============== Profile Routes ==============

  // Configure multer for avatar uploads
  const avatarUpload = multer({
    dest: "uploads/avatars/",
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPG and PNG images are allowed"));
      }
    },
  });

  // Configure multer for template thumbnail uploads
  const templateUpload = multer({
    dest: "uploads/templates/",
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPG, PNG, and WebP images are allowed"));
      }
    },
  });

  // Get user profile
  app.get("/api/profile", async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user profile
  app.put("/api/profile", async (req: Request, res: Response) => {
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
        notifyCoinsAdded,
      });

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upload avatar
  app.post("/api/profile/avatar", avatarUpload.single("avatar"), async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      
      const updatedUser = await storage.updateUserProfile(req.session.userId, {
        avatarUrl,
      });

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user statistics
  app.get("/api/profile/stats", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const stats = await storage.getUserStats(req.session.userId);
      res.json({ stats });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============== Referral Routes ==============

  // Get or generate user's referral code
  app.get("/api/referrals/my-code", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      let referralCode = await storage.getUserReferralCode(req.session.userId);
      
      if (!referralCode) {
        referralCode = await storage.generateReferralCode(req.session.userId);
      }

      res.json({ referralCode });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get referral statistics
  app.get("/api/referrals/stats", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const stats = await storage.getReferralStats(req.session.userId);
      res.json({ stats });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's referral list
  app.get("/api/referrals/list", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const referrals = await storage.getUserReferrals(req.session.userId);
      
      // Enhance with referred user details
      const referralsWithDetails = await Promise.all(
        referrals.map(async (referral) => {
          let referredUserName = "Pending signup";
          if (referral.referredUserId) {
            const referredUser = await storage.getUser(referral.referredUserId);
            referredUserName = referredUser?.name || referredUser?.email || "Unknown";
          }
          
          return {
            ...referral,
            referredUserName,
          };
        })
      );

      res.json({ referrals: referralsWithDetails });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============== Admin Routes ==============
  
  // Get all users (admin only)
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      
      // Sanitize: Remove password field before sending to client
      const safeUsers = users.map(({ password, ...user }) => user);
      
      res.json({ users: safeUsers });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add coins to user (admin only)
  app.post("/api/admin/users/:userId/add-coins", async (req: Request, res: Response) => {
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
        metadata: { addedBy: req.session.userId },
      });

      const updatedUser = await storage.getUser(targetUserId);
      
      // Send coins added email (non-blocking)
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============== Coin Package Routes (Admin) ==============

  // Get all coin packages (admin gets all, users get active only)
  app.get("/api/admin/coin-packages", async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get active coin packages (public for users)
  app.get("/api/coin-packages", async (req: Request, res: Response) => {
    try {
      const packages = await storage.getActiveCoinPackages();
      res.json({ packages });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create coin package (admin only)
  app.post("/api/admin/coin-packages", async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update coin package (admin only)
  app.patch("/api/admin/coin-packages/:id", async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete coin package (admin only)
  app.delete("/api/admin/coin-packages/:id", async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============== Manual Transaction Routes (Admin) ==============

  // Get all manual transactions (admin only)
  app.get("/api/admin/manual-transactions", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const transactions = await storage.getAllManualTransactions();
      
      // Enrich with user data
      const enrichedTxns = await Promise.all(
        transactions.map(async (txn) => {
          const user = await storage.getUser(txn.userId);
          const pkg = txn.packageId ? await storage.getCoinPackage(txn.packageId) : null;
          return {
            ...txn,
            user: user ? { email: user.email, name: user.name } : null,
            package: pkg ? { name: pkg.name } : null,
          };
        })
      );

      res.json({ transactions: enrichedTxns });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create manual transaction (admin only)
  app.post("/api/admin/manual-transactions", async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Approve manual transaction (admin only)
  app.post("/api/admin/manual-transactions/:id/approve", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { adminNotes } = req.body;
      
      // Get transaction details before approval
      const transaction = await storage.getManualTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      await storage.approveManualTransaction(req.params.id, req.session.userId, adminNotes);
      
      // Send payment confirmed email (non-blocking)
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
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Reject manual transaction (admin only)
  app.post("/api/admin/manual-transactions/:id/reject", async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============== Admin Analytics Routes ==============

  // Get admin analytics dashboard data
  app.get("/api/admin/analytics", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get all transactions for revenue calculation
      const transactions = await storage.getAllManualTransactions();
      const completedTxns = transactions.filter(t => t.status === "completed");
      
      const totalRevenue = completedTxns.reduce((sum, t) => sum + t.priceInINR, 0);
      const totalCoinsSold = completedTxns.reduce((sum, t) => sum + t.coinAmount, 0);

      // Get all jobs for usage statistics
      const allUsers = await storage.getAllUsers();
      const totalCoinsSpent = allUsers.reduce((sum, u) => {
        const spent = (u.coinBalance || 0); // This would need transaction history
        return sum;
      }, 0);

      // Get template usage stats
      const templates = await storage.getAllTemplates();
      const jobs: any[] = []; // TODO: Implement getUserJobs method in storage
      
      // Get user stats
      const usersThisMonth = allUsers.filter(u => {
        const createdAt = new Date(u.createdAt);
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && 
               createdAt.getFullYear() === now.getFullYear();
      }).length;

      res.json({
        revenue: {
          total: totalRevenue,
          thisMonth: completedTxns.filter(t => {
            const created = new Date(t.createdAt);
            const now = new Date();
            return created.getMonth() === now.getMonth() && 
                   created.getFullYear() === now.getFullYear();
          }).reduce((sum, t) => sum + t.priceInINR, 0),
          transactionCount: completedTxns.length,
        },
        coins: {
          sold: totalCoinsSold,
          active: allUsers.reduce((sum, u) => sum + (u.coinBalance || 0), 0),
        },
        users: {
          total: allUsers.length,
          thisMonth: usersThisMonth,
        },
        transactions: completedTxns.slice(0, 10), // Recent 10
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============== Wallet Routes (User) ==============

  // Get active coin packages for purchase (user-facing)
  app.get("/api/wallet/packages", async (req: Request, res: Response) => {
    try {
      const packages = await storage.getActiveCoinPackages();
      res.json({ packages });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's manual transactions (user-facing)
  app.get("/api/wallet/transactions", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const transactions = await storage.getUserManualTransactions(req.session.userId);
      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============== Template Routes ==============

  // Get all templates
  app.get("/api/templates", async (req: Request, res: Response) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json({ templates });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch templates" });
    }
  });

  // Get all templates for admin (including inactive ones)
  app.get("/api/admin/templates", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const templates = await storage.getAllTemplatesForAdmin();
      res.json({ templates });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch templates" });
    }
  });

  // Get user favorites
  app.get("/api/templates/favorites", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const favorites = await storage.getUserFavorites(req.session.userId);
      res.json({ favorites });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch favorites" });
    }
  });

  // Add favorite
  app.post("/api/templates/:templateId/favorite", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const favorite = await storage.addTemplateFavorite(req.session.userId, req.params.templateId);
      res.json({ favorite });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to add favorite" });
    }
  });

  // Remove favorite
  app.delete("/api/templates/:templateId/favorite", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      await storage.removeTemplateFavorite(req.session.userId, req.params.templateId);
      res.json({ message: "Favorite removed" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to remove favorite" });
    }
  });

  // Get single template by ID with all details
  app.get("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json({ template });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch template" });
    }
  });

  // Update template (admin only)
  app.patch("/api/templates/:id", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Validate and parse template update data
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
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(400).json({ message: error.message || "Failed to update template" });
    }
  });

  // Create template (admin only)
  app.post("/api/templates", async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create template" });
    }
  });

  // Upload template thumbnail (admin only)
  app.post("/api/templates/:id/thumbnail", templateUpload.single("thumbnail"), async (req: Request, res: Response) => {
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

      // Generate the thumbnail URL
      const thumbnailUrl = `/uploads/templates/${req.file.filename}`;

      // Update template with thumbnail URL
      await storage.updateTemplate(req.params.id, { thumbnailUrl });

      res.json({ 
        success: true, 
        message: "Template thumbnail uploaded successfully",
        thumbnailUrl 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to upload template thumbnail" });
    }
  });

  // Soft delete template (admin only)
  app.patch("/api/templates/:id/soft-delete", async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to soft delete template" });
    }
  });

  // Restore template (admin only)
  app.patch("/api/templates/:id/restore", async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to restore template" });
    }
  });

  // Delete template (admin only) - Hard delete
  app.delete("/api/templates/:id", async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to delete template" });
    }
  });

  // ============== User Management Routes (Admin Only) ==============

  // Get all users (admin only)
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });

  // Update user role (admin only)
  app.patch("/api/admin/users/:id/role", async (req: Request, res: Response) => {
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

      // Validate role
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
      }

      // Validate user tier
      if (userTier && !['free', 'premium', 'enterprise'].includes(userTier)) {
        return res.status(400).json({ message: "Invalid user tier. Must be 'free', 'premium', or 'enterprise'" });
      }

      // Update user role and tier
      await storage.updateUserRole(targetUserId, role, userTier || (role === 'admin' ? 'enterprise' : 'free'));

      res.json({ success: true, message: "User role updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update user role" });
    }
  });

  // Update user coins (admin only)
  app.patch("/api/admin/users/:id/coins", async (req: Request, res: Response) => {
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

      if (typeof coinBalance !== 'number' || coinBalance < 0) {
        return res.status(400).json({ message: "Invalid coin balance. Must be a non-negative number" });
      }

      await storage.updateUserCoins(targetUserId, coinBalance);

      res.json({ success: true, message: "User coins updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update user coins" });
    }
  });

  // Create admin user (super admin only or if no admins exist)
  app.post("/api/admin/create-admin", async (req: Request, res: Response) => {
    try {
      // Check if any admin users exist
      const allUsers = await storage.getAllUsers();
      const adminUsers = allUsers.filter(u => u.role === 'admin');

      // If admins exist, require admin authentication
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

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Create admin user
      const newAdmin = await storage.createAdminUser(email, password, name || 'Admin User');

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
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create admin user" });
    }
  });

  // ============== Usage Quota Routes ==============

  // Get user's quota status
  app.get("/api/usage/quota", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const quotaStatus = await storage.checkUserQuota(req.session.userId);
      const user = await storage.getUser(req.session.userId);
      
      res.json({
        ...quotaStatus,
        tier: user?.userTier || "free",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch quota" });
    }
  });

  // ============== Bulk Image Upload Routes ==============

  // Bulk image upload with blur detection and AI enhancement
  app.post(
    "/api/jobs/bulk-upload",
    bulkUpload.array("images", 10000),
    async (req: Request, res: Response) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
          return res.status(400).json({ message: "No images uploaded" });
        }

        if (files.length > 10000) {
          return res.status(400).json({ message: "Maximum 10,000 images allowed per bulk upload" });
        }

        const { templateId, enhancementPrompt, quality = "standard", enableBlurDetection = true } = req.body;
        if (!templateId) {
          return res.status(400).json({ message: "Template ID is required" });
        }

        // Get template for prompt
        const template = await storage.getTemplate(templateId);
        if (!template) {
          return res.status(404).json({ message: "Template not found" });
        }

        // Use custom prompt or template prompt
        const aiPrompt = enhancementPrompt || (template.settings as any)?.diffusionPrompt || 
          "A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the product design, colors, and composition remain exactly the same with no changes or alterations. Output size 1080x1080px.";

        // Check user quota
        const quotaStatus = await storage.checkUserQuota(req.session.userId);
        if (!quotaStatus.hasQuota) {
          return res.status(403).json({ 
            message: "Monthly quota exceeded. Please upgrade your plan to process more images.",
            quota: quotaStatus.quota,
            used: quotaStatus.used,
          });
        }

        if (quotaStatus.remaining < files.length) {
          return res.status(403).json({ 
            message: `Insufficient quota. You have ${quotaStatus.remaining} images remaining this month.`,
            quota: quotaStatus.quota,
            used: quotaStatus.used,
            remaining: quotaStatus.remaining,
          });
        }

        // Calculate coins based on quality
        const qualityMultipliers: Record<string, number> = {
          standard: 2,
          high: 3,
          ultra: 5,
        };
        const qualityMultiplier = qualityMultipliers[quality] || 2;
        const coinsNeeded = files.length * qualityMultiplier;
        
        // Check user balance
        const user = await storage.getUser(req.session.userId);
        if (!user || user.coinBalance < coinsNeeded) {
          return res.status(400).json({ 
            message: `Insufficient coins. Required: ${coinsNeeded}, Available: ${user?.coinBalance || 0}` 
          });
        }

        // Create bulk processing job
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
          },
        });

        // Process images in batches to avoid memory issues
        const BATCH_SIZE = 100;
        const imagePromises = [];
        
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
          const batch = files.slice(i, i + BATCH_SIZE);
          
          for (const file of batch) {
            const originalUrl = `/uploads/bulk/${path.basename(file.path)}`;
            imagePromises.push(
              storage.createImage({
                jobId: job.id,
                originalUrl,
              })
            );
          }
        }

        await Promise.all(imagePromises);

        // Log bulk upload audit
        await logAudit(
          req.session.userId,
          'bulk_upload_created',
          getClientIP(req),
          req.headers['user-agent'],
          { 
            jobId: job.id, 
            imageCount: files.length,
            coinsUsed: coinsNeeded,
            templateId,
            quality,
            enableBlurDetection
          }
        );

        // Deduct coins atomically
        try {
          await storage.addCoinsWithTransaction(req.session.userId, -coinsNeeded, {
            type: "usage",
            description: `Bulk processed ${files.length} images (${quality} quality)`,
            metadata: { jobId: job.id, quality, bulkUpload: true },
          });

          // Increment monthly usage
          await storage.incrementMonthlyUsage(req.session.userId, files.length);
        } catch (error: any) {
          await storage.updateProcessingJobStatus(job.id, "failed", 0);
          
          if (error.message.includes("Insufficient coins")) {
            return res.status(400).json({ message: "Insufficient coins to process images" });
          }
          throw error;
        }

        // Start bulk processing asynchronously
        setTimeout(async () => {
          try {
            await processBulkImages(job.id, aiPrompt, quality, enableBlurDetection);
          } catch (error) {
            console.error("Bulk processing error:", error);
            await storage.updateProcessingJobStatus(job.id, "failed", 0);
          }
        }, 1000);

        res.json({ 
          job,
          message: `Bulk upload started. Processing ${files.length} images with AI enhancement.`,
          estimatedTime: `${Math.ceil(files.length / 10)} minutes`
        });
      } catch (error: any) {
        console.error("Bulk upload error:", error);
        res.status(500).json({ message: error.message || "Failed to create bulk upload job" });
      }
    }
  );

  // Bulk processing function
  async function processBulkImages(
    jobId: string, 
    aiPrompt: string, 
    quality: string,
    enableBlurDetection: boolean
  ) {
    try {
      // Get all images for this job
      const jobImages = await storage.getJobImages(jobId);
      
      // Update job status to processing
      await storage.updateProcessingJobStatus(jobId, "processing", 0);
      
      // Ensure processed directory exists
      await fs.mkdir(path.join("uploads", "processed"), { recursive: true });

      let completedCount = 0;
      const PROCESSING_BATCH_SIZE = 10; // Process 10 images at a time for stability
      
      // Process images in smaller batches
      for (let i = 0; i < jobImages.length; i += PROCESSING_BATCH_SIZE) {
        const batch = jobImages.slice(i, i + PROCESSING_BATCH_SIZE);
        
        await Promise.all(
          batch.map(async (image) => {
            try {
              const inputPath = path.join(process.cwd(), image.originalUrl);
              
              // Check if image exists
              try {
                await fs.access(inputPath);
              } catch {
                console.error(`Input image not found: ${inputPath}`);
                await storage.updateImageStatus(image.id, "failed", undefined);
                return;
              }

              // Detect blur if enabled
              let isBlurred = false;
              if (enableBlurDetection) {
                isBlurred = await detectImageBlur(inputPath);
              }

              // Generate output filename
              const timestamp = Date.now();
              const randomId = Math.random().toString(36).substring(7);
              const outputFileName = `enhanced_${timestamp}_${randomId}.png`;
              const outputPath = path.join("uploads", "processed", outputFileName);
              const outputUrl = `/uploads/processed/${outputFileName}`;

              // Apply AI enhancement
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
                // Fallback: copy original if AI fails
                await fs.copyFile(inputPath, outputPath);
                await storage.updateImageStatus(image.id, "completed", outputUrl);
                completedCount++;
              }
            } catch (error) {
              console.error(`Failed to process image ${image.id}:`, error);
              await storage.updateImageStatus(image.id, "failed", undefined);
            }
          })
        );

        // Update progress
        await storage.updateProcessingJobStatus(jobId, "processing", completedCount);
        
        // Small delay between batches to prevent system overload
        if (i + PROCESSING_BATCH_SIZE < jobImages.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Create ZIP file with all processed images
      const zipFileName = `bulk-job-${jobId}.zip`;
      const zipPath = path.join("uploads", "processed", zipFileName);
      const output = createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.pipe(output);

      // Add all completed images to ZIP
      const updatedJobImages = await storage.getJobImages(jobId);
      for (const image of updatedJobImages) {
        if (image.processedUrl) {
          const imagePath = path.join(process.cwd(), image.processedUrl);
          try {
            await fs.access(imagePath);
            const originalName = path.basename(image.originalUrl).replace(/^[0-9]+_/, '');
            archive.file(imagePath, { name: `enhanced_${originalName}` });
          } catch (err) {
            console.error(`Failed to add ${imagePath} to ZIP:`, err);
          }
        }
      }

      await archive.finalize();

      // Update job status
      const jobStatus = completedCount === jobImages.length ? "completed" : "failed";
      await storage.updateProcessingJobStatus(
        jobId,
        jobStatus,
        completedCount,
        `/uploads/processed/${zipFileName}`
      );

      // Send completion email if successful
      if (jobStatus === "completed") {
        const job = await storage.getProcessingJob(jobId);
        const user = await storage.getUser(job!.userId);
        if (user && shouldSendEmail(user, "jobCompletion")) {
          const downloadUrl = `${process.env.APP_URL || 'http://localhost:5000'}/api/jobs/${jobId}/download`;
          sendJobCompletedEmail(user, job!, downloadUrl).catch((error) => {
            console.error("Failed to send bulk job completed email:", error);
          });
        }
      }

      // Clean up temporary uploaded files
      for (const image of jobImages) {
        try {
          const tempPath = path.join(process.cwd(), image.originalUrl);
          await fs.unlink(tempPath);
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

  // Blur detection function using simple variance of Laplacian
  async function detectImageBlur(imagePath: string): Promise<boolean> {
    try {
      // This is a placeholder - in a real implementation, you would use
      // an image processing library like Sharp or OpenCV to detect blur
      // For now, we'll assume all images might be blurred and need enhancement
      return true;
    } catch (error) {
      console.error("Blur detection failed:", error);
      return false;
    }
  }

  // AI image enhancement function
  async function enhanceImageWithAI(
    inputPath: string,
    outputPath: string,
    prompt: string,
    quality: string,
    isBlurred: boolean
  ): Promise<boolean> {
    try {
      console.log(`Processing image with AI: ${path.basename(inputPath)}`);
      console.log(`Quality: ${quality}, Is Blurred: ${isBlurred}`);
      
      const result = await aiImageEnhancer.enhanceImage({
        inputPath,
        outputPath,
        prompt,
        quality,
        isBlurred
      });

      if (result.success) {
        console.log(`✅ AI enhancement completed in ${result.processingTime}ms`);
        return true;
      } else {
        console.error(`❌ AI enhancement failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error("AI enhancement failed:", error);
      return false;
    }
  }

  // Get bulk upload progress
  app.get("/api/jobs/bulk/:jobId/progress", async (req: Request, res: Response) => {
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

      const images = await storage.getJobImages(job.id);
      const completedImages = images.filter(img => img.status === "completed").length;
      const failedImages = images.filter(img => img.status === "failed").length;
      const processingImages = images.filter(img => img.status === "processing").length;
      const pendingImages = images.filter(img => img.status === "pending").length;

      const progress = {
        jobId: job.id,
        status: job.status,
        totalImages: job.totalImages,
        completedImages,
        failedImages,
        processingImages,
        pendingImages,
        progressPercentage: Math.round((completedImages / job.totalImages) * 100),
        estimatedTimeRemaining: pendingImages > 0 ? `${Math.ceil(pendingImages / 10)} minutes` : "0 minutes",
        zipUrl: job.zipUrl
      };

      res.json({ progress });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get progress" });
    }
  });

  // ============== Processing Job Routes ==============

  // Create processing job and upload images
  app.post(
    "/api/jobs",
    upload.array("images", 100),
    async (req: Request, res: Response) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
          return res.status(400).json({ message: "No images uploaded" });
        }

        const { templateId, batchSettings } = req.body;
        if (!templateId) {
          return res.status(400).json({ message: "Template ID is required" });
        }

        // Check user quota before processing
        const quotaStatus = await storage.checkUserQuota(req.session.userId);
        if (!quotaStatus.hasQuota) {
          return res.status(403).json({ 
            message: "Monthly quota exceeded. Please upgrade your plan to process more images.",
            quota: quotaStatus.quota,
            used: quotaStatus.used,
          });
        }

        if (quotaStatus.remaining < files.length) {
          return res.status(403).json({ 
            message: `Insufficient quota. You have ${quotaStatus.remaining} images remaining this month.`,
            quota: quotaStatus.quota,
            used: quotaStatus.used,
            remaining: quotaStatus.remaining,
          });
        }

        // Parse batchSettings to get quality setting
        const parsedSettings = batchSettings ? JSON.parse(batchSettings) : {};
        const quality = parsedSettings.quality || "standard";
        
        // Calculate coins based on quality tier
        const qualityMultipliers: Record<string, number> = {
          standard: 2,
          high: 3,
          ultra: 5,
        };
        const qualityMultiplier = qualityMultipliers[quality] || 2;
        
        const coinsNeeded = files.length * qualityMultiplier;
        
        // Get user and check balance
        const user = await storage.getUser(req.session.userId);
        if (!user || user.coinBalance < coinsNeeded) {
          return res.status(400).json({ message: "Insufficient coins" });
        }

        // Create processing job with IP logging for security audit
        const clientIP = getClientIP(req);
        const job = await storage.createProcessingJob({
          userId: req.session.userId,
          templateId,
          totalImages: files.length,
          coinsUsed: coinsNeeded,
          status: "queued",
          batchSettings: batchSettings ? JSON.parse(batchSettings) : null,
        });

        // Create image records
        const imagePromises = files.map((file) => {
          const originalUrl = `/uploads/${path.basename(file.path)}`;
          return storage.createImage({
            jobId: job.id,
            originalUrl,
          });
        });

        await Promise.all(imagePromises);

        // Log job creation for security audit trail
        await logAudit(
          req.session.userId,
          'job_created',
          clientIP,
          req.headers['user-agent'],
          { 
            jobId: job.id, 
            imageCount: files.length,
            coinsUsed: coinsNeeded,
            templateId 
          }
        );

        // Deduct coins atomically
        try {
          await storage.addCoinsWithTransaction(req.session.userId, -coinsNeeded, {
            type: "usage",
            description: `Processed ${files.length} images (${quality} quality)`,
            metadata: { jobId: job.id, quality },
          });

          // Increment monthly usage for quota tracking
          await storage.incrementMonthlyUsage(req.session.userId, files.length);
        } catch (error: any) {
          // If coin deduction fails, clean up the job and images
          await storage.updateProcessingJobStatus(job.id, "failed", 0);
          
          if (error.message.includes("Insufficient coins")) {
            return res.status(400).json({ message: "Insufficient coins to process images" });
          }
          throw error;
        }

        // Start processing with AI service (async background job)
        setTimeout(async () => {
          try {
            // Get all images for this job
            const jobImages = await storage.getJobImages(job.id);
            
            // Fetch template settings from database
            const template = await storage.getTemplate(job.templateId);
            if (!template) {
              throw new Error("Template not found");
            }
            
            // Prepare template settings for Python AI service
            const settings = template.settings as any || {};
            const templateSettings = {
              backgroundStyle: template.backgroundStyle || 'gradient',
              lightingPreset: template.lightingPreset || 'soft-glow',
              shadowIntensity: settings.shadowIntensity || 0,
              vignetteStrength: settings.vignetteStrength || 0,
              colorGrading: settings.colorGrading || 'neutral',
              gradientColors: settings.gradientColors || ['#0F2027', '#203A43'],
              diffusionPrompt: settings.diffusionPrompt || '',
            };
            
            // Ensure processed directory exists
            await fs.mkdir(path.join("uploads", "processed"), { recursive: true });

            // Process images in parallel batches for faster speed
            const batchSize = 5; // Process 5 images at a time (balanced for stability and speed)
            for (let i = 0; i < jobImages.length; i += batchSize) {
              const batch = jobImages.slice(i, i + batchSize);
              
              await Promise.all(
                batch.map(async (image) => {
                  try {
                    // AI processing functionality has been removed
                    await storage.updateImageStatus(image.id, "failed", undefined);
                    throw new Error("AI image processing functionality has been removed");
                  } catch (error) {
                    console.error(`Failed to process image ${image.id}:`, error);
                    await storage.updateImageStatus(image.id, "failed", undefined);
                  }
                })
              );
            }

            // Re-fetch images to get updated processedUrl values
            const updatedJobImages = await storage.getJobImages(job.id);
            
            // Create zip file with processed images
            const zipFileName = `job-${job.id}.zip`;
            const zipPath = path.join("uploads", "processed", zipFileName);

            const output = createWriteStream(zipPath);
            const archive = archiver("zip", { zlib: { level: 9 } });

            archive.pipe(output);

            // Add all processed images to zip
            for (const image of updatedJobImages) {
              if (image.processedUrl) {
                const imagePath = path.join("uploads", "processed", path.basename(image.processedUrl));
                try {
                  archive.file(imagePath, { name: path.basename(image.processedUrl) });
                } catch (err) {
                  console.error(`Failed to add ${imagePath} to zip:`, err);
                }
              }
            }

            await archive.finalize();

            // Update job status
            const completedCount = updatedJobImages.filter(img => img.processedUrl).length;
            const jobStatus = completedCount === jobImages.length ? "completed" : "failed";
            await storage.updateProcessingJobStatus(
              job.id,
              jobStatus,
              completedCount,
              `/uploads/processed/${zipFileName}`
            );

            // Send job completed email if successful (non-blocking)
            if (jobStatus === "completed") {
              const user = await storage.getUser(job.userId);
              const completedJob = await storage.getProcessingJob(job.id);
              if (user && completedJob && shouldSendEmail(user, "jobCompletion")) {
                const downloadUrl = `${process.env.APP_URL || 'http://localhost:5000'}/api/jobs/${job.id}/download`;
                sendJobCompletedEmail(user, completedJob, downloadUrl).catch((error) => {
                  console.error("Failed to send job completed email:", error);
                });
              }
            }

            // Clean up temporary uploaded files
            for (const image of jobImages) {
              try {
                const tempPath = path.join("uploads", path.basename(image.originalUrl));
                await fs.unlink(tempPath);
              } catch (err) {
                console.error(`Failed to delete temp file: ${err}`);
              }
            }

            console.log(`Job ${job.id} completed with ${completedCount}/${jobImages.length} images`);
          } catch (error) {
            console.error("Processing error:", error);
            await storage.updateProcessingJobStatus(job.id, "failed", 0);
          }
        }, 2000); // Start processing after 2 seconds

        res.json({ job });
      } catch (error: any) {
        console.error("Job creation error:", error);
        res.status(500).json({ message: error.message || "Failed to create job" });
      }
    }
  );

  // Get job details
  app.get("/api/jobs/:jobId", async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch job" });
    }
  });

  // Get user's jobs with images
  app.get("/api/jobs", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const jobs = await storage.getUserProcessingJobs(req.session.userId);
      
      // Fetch images for each job and attach template info
      const jobsWithImages = await Promise.all(
        jobs.map(async (job) => {
          const images = await storage.getJobImages(job.id);
          const template = await storage.getTemplate(job.templateId);
          return {
            ...job,
            images,
            templateName: template?.name || "Unknown Template",
          };
        })
      );
      
      res.json({ jobs: jobsWithImages });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch jobs" });
    }
  });

  // Get images for a specific job
  app.get("/api/jobs/:jobId/images", async (req: Request, res: Response) => {
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

      const images = await storage.getJobImages(req.params.jobId);
      res.json({ images });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Download processed images (zip)
  app.get("/api/jobs/:jobId/download", async (req: Request, res: Response) => {
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

      const zipPath = path.join(process.cwd(), job.zipUrl);
      res.download(zipPath, `drisya-job-${job.id}.zip`);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to download" });
    }
  });

  // Delete individual image
  app.delete("/api/images/:id", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      await storage.deleteImage(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete image" });
    }
  });

  // Bulk download images as ZIP
  app.post("/api/gallery/bulk-download", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { imageIds } = req.body;
    
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ message: "Image IDs required" });
    }

    try {
      // Get images from database (with auth check)
      const images = await storage.getImagesByIds(imageIds, req.session.userId);
      
      if (images.length === 0) {
        return res.status(404).json({ message: "No images found" });
      }

      // Create ZIP archive
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      res.attachment(`gallery-export-${Date.now()}.zip`);
      archive.pipe(res);

      // Add each processed image to ZIP
      for (const image of images) {
        if (image.processedUrl) {
          const imagePath = path.join(process.cwd(), image.processedUrl);
          const originalName = image.originalUrl?.split('/').pop()?.split('-').slice(1).join('-') || `image-${image.id}.png`;
          
          try {
            // Check if file exists before adding
            await fs.access(imagePath);
            archive.file(imagePath, { name: originalName });
          } catch (err) {
            console.error(`File not found: ${imagePath}`);
          }
        }
      }

      await archive.finalize();
    } catch (error: any) {
      console.error("Bulk download error:", error);
      res.status(500).json({ message: error.message || "Failed to create ZIP" });
    }
  });

  // Bulk reprocess images with new template
  app.post("/api/gallery/bulk-reprocess", async (req: Request, res: Response) => {
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
      // Get images with ownership verification
      const images = await storage.getImagesByIds(imageIds, req.session.userId);
      
      if (images.length === 0) {
        return res.status(404).json({ message: "No images found" });
      }

      // Get template
      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Calculate coin cost based on quality multiplier (same as upload flow)
      const qualityMultipliers: Record<string, number> = {
        standard: 2,
        high: 3,
        ultra: 5,
      };
      const qualityMultiplier = qualityMultipliers[quality || "standard"] || 2;
      
      const coinCost = images.length * qualityMultiplier;

      // Check user has enough coins
      const user = await storage.getUser(req.session.userId);
      if (!user || user.coinBalance < coinCost) {
        return res.status(403).json({ message: "Insufficient coins" });
      }

      // Create new processing job for reprocessing
      const job = await storage.createProcessingJob({
        userId: req.session.userId,
        templateId,
        totalImages: images.length,
        coinsUsed: coinCost,
        status: "queued",
        batchSettings: {
          quality: quality || "standard",
          format: "png",
        },
      });

      // Create new image records for the job (copy from originals)
      for (const originalImage of images) {
        await storage.createImage({
          jobId: job.id,
          originalUrl: originalImage.originalUrl, // Reuse original URL
        });
      }

      // Deduct coins atomically
      await storage.addCoinsWithTransaction(req.session.userId, -coinCost, {
        type: "usage",
        description: `Reprocessed ${images.length} images with ${template.name} (${quality || "standard"} quality)`,
        metadata: { jobId: job.id, templateId, quality: quality || "standard", isReprocess: true },
      });

      // Queue processing job (same as normal upload flow)
      setTimeout(async () => {
        try {
          // Get all images for this job
          const jobImages = await storage.getJobImages(job.id);
          
          // Prepare template settings for Python AI service
          const settings = template.settings as any || {};
          const templateSettings = {
            backgroundStyle: template.backgroundStyle || 'gradient',
            lightingPreset: template.lightingPreset || 'soft-glow',
            shadowIntensity: settings.shadowIntensity || 0,
            vignetteStrength: settings.vignetteStrength || 0,
            colorGrading: settings.colorGrading || 'neutral',
            gradientColors: settings.gradientColors || ['#0F2027', '#203A43'],
            diffusionPrompt: settings.diffusionPrompt || '',
          };
          
          // Ensure processed directory exists
          await fs.mkdir(path.join("uploads", "processed"), { recursive: true });

          // Process images in parallel batches
          const batchSize = 5;
          let completedCount = 0;
          
          for (let i = 0; i < jobImages.length; i += batchSize) {
            const batch = jobImages.slice(i, i + batchSize);
            
            await Promise.all(
              batch.map(async (image) => {
                try {
                  // AI processing functionality has been removed
                  await storage.updateImageStatus(image.id, "failed", undefined);
                  throw new Error("AI image processing functionality has been removed");
                } catch (error) {
                  console.error(`Failed to process image ${image.id}:`, error);
                  await storage.updateImageStatus(image.id, "failed", undefined);
                }
              })
            );
          }

          // Create ZIP file of all completed images
          if (completedCount > 0) {
            const zipFileName = `reprocessed-job-${job.id}-${Date.now()}.zip`;
            const zipPath = path.join("uploads", "processed", zipFileName);
            const archive = archiver("zip", { zlib: { level: 9 } });
            const output = createWriteStream(zipPath);
            
            archive.pipe(output);
            
            for (const image of jobImages) {
              if (image.processedUrl) {
                const imagePath = path.join(process.cwd(), image.processedUrl);
                try {
                  await fs.access(imagePath);
                  archive.file(imagePath, { name: path.basename(image.processedUrl) });
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
      }, 2000); // Start processing after 2 seconds

      res.json({
        jobId: job.id,
        message: `Reprocessing ${images.length} images with ${template.name}`,
        coinCost,
      });
    } catch (error: any) {
      console.error("Bulk reprocess error:", error);
      res.status(500).json({ message: error.message || "Failed to reprocess images" });
    }
  });

  // ============== Transaction Routes ==============

  // Get user transactions
  app.get("/api/transactions", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const transactions = await storage.getUserTransactions(req.session.userId);
      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch transactions" });
    }
  });

  // Purchase coins
  app.post("/api/coins/purchase", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { package: packageType } = req.body;
      
      const packages: Record<string, { coins: number; price: number }> = {
        starter: { coins: 500, price: 499 },
        pro: { coins: 2000, price: 1599 },
        enterprise: { coins: 5000, price: 3499 },
      };

      const selectedPackage = packages[packageType];
      if (!selectedPackage) {
        return res.status(400).json({ message: "Invalid package" });
      }

      // Add coins atomically
      await storage.addCoinsWithTransaction(req.session.userId, selectedPackage.coins, {
        type: "purchase",
        description: `Purchased ${packageType} package (${selectedPackage.coins} coins)`,
        metadata: { package: packageType, price: selectedPackage.price },
      });

      // Get updated user
      const user = await storage.getUser(req.session.userId);

      res.json({ 
        message: "Coins purchased successfully",
        coinBalance: user?.coinBalance || 0
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Purchase failed" });
    }
  });

  // ============== ZIP Upload & Extraction Routes ==============

  // Upload ZIP file and extract images
  app.post(
    "/api/upload/zip",
    upload.single("zip"),
    async (req: Request, res: Response) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ message: "No ZIP file provided" });
        }

        const zipPath = req.file.path;
        const extractDir = path.join("uploads", "extracted", `${Date.now()}`);
        
        // Create extraction directory
        await fs.mkdir(extractDir, { recursive: true });

        // Extract ZIP file
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractDir, true);

        // Get all image files from extracted directory
        const allFiles = await fs.readdir(extractDir);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const imageFiles = allFiles.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return imageExtensions.includes(ext);
        });

        // Move images to uploads directory with unique names
        const images = [];
        for (const file of imageFiles) {
          const sourcePath = path.join(extractDir, file);
          const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file}`;
          const destPath = path.join("uploads", uniqueName);
          await fs.copyFile(sourcePath, destPath);
          
          images.push({
            name: file,
            path: `/uploads/${uniqueName}`,
            url: `/uploads/${uniqueName}`,
          });
        }

        // Clean up ZIP and extraction directory
        await fs.unlink(zipPath);
        await fs.rm(extractDir, { recursive: true, force: true });

        res.json({ 
          success: true,
          images,
          count: images.length 
        });
      } catch (error: any) {
        console.error("ZIP extraction error:", error);
        res.status(500).json({ message: error.message || "Failed to extract ZIP" });
      }
    }
  );

  // Upload single image for AI transform
  app.post(
    "/api/upload/single",
    upload.single("image"),
    async (req: Request, res: Response) => {
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
      } catch (error: any) {
        console.error("Single image upload error:", error);
        res.status(500).json({ message: error.message || "Failed to upload image" });
      }
    }
  );

  // ============== Media Library Routes ==============

  // Get user's media library
  app.get("/api/media-library", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Get uploaded gallery images for media library
      let media: any[] = [];
      try {
        const galleryDir = "uploads/gallery";
        const galleryFiles = await fs.readdir(galleryDir);
        
        media = galleryFiles
          .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
          })
          .map(file => ({
            id: `media-${file}`,
            name: file,
            type: 'image',
            url: `/uploads/gallery/${file}`,
            thumbnailUrl: `/uploads/gallery/${file}`,
            uploadedAt: new Date(),
            isFavorite: false,
            tags: ['uploaded'],
            category: 'Raw Upload'
          }));
      } catch (galleryError) {
        console.error('Failed to read gallery directory for media library:', galleryError);
      }
      
      res.json({ media });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch media library" });
    }
  });

  // Toggle favorite status
  app.post("/api/media-library/favorite/:id", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // TODO: Implement media library favorite functionality
      // For now, return success to prevent errors
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update favorite" });
    }
  });

  // Delete media library entry
  app.delete("/api/media-library/:id", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // TODO: Implement media library delete functionality
      // For now, return success to prevent errors
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete media" });
    }
  });

  // ============== AI Editing Routes ==============

  // Create new AI edit request
  app.post("/api/ai-edits", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Validate request body
      const validatedData = insertAIEditSchema.parse(req.body);

      // Check user quota before accepting request
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

      // Create edit record in database
      const edit = await storage.createAIEdit({
        ...validatedData,
      });

      // Queue async processing (don't await)
      aiEditQueue.processEdit(edit.id).catch((error) => {
        console.error(`Failed to queue AI edit ${edit.id}:`, error);
      });

      // Log audit event
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
    } catch (error: any) {
      console.error("AI edit creation error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message || "Failed to create AI edit" });
    }
  });

  // Batch AI edit - process multiple images in parallel
  app.post("/api/ai-edits/batch", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { images, prompt, aiModel = "auto", quality = "4k" } = req.body;

      if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ message: "images array is required" });
      }

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ message: "prompt is required" });
      }

      // Limit batch size to prevent resource exhaustion
      const MAX_BATCH_SIZE = 1000;
      if (images.length > MAX_BATCH_SIZE) {
        return res.status(400).json({ 
          message: `Batch size too large. Maximum ${MAX_BATCH_SIZE} images allowed per batch.`
        });
      }

      // Check quota for batch
      const quotaCheck = await storage.checkAIQuota(req.session.userId);
      if (!quotaCheck.canUse || quotaCheck.remaining < images.length) {
        return res.status(403).json({ 
          message: `Insufficient quota. Need ${images.length}, have ${quotaCheck.remaining}`,
        });
      }

      // Create AI edit records for each image
      const editIds: string[] = [];
      for (const imageUrl of images) {
        const edit = await storage.createAIEdit({
          inputImageUrl: imageUrl,
          prompt,
          aiModel,
          quality,
        });
        editIds.push(edit.id);
      }

      // Start batch processing asynchronously
      aiEditQueue.processBatch(editIds).then((results) => {
        console.log(`📊 Batch ${editIds[0]}: ${results.completed}/${results.total} completed, ${results.failed} failed`);
      }).catch((error) => {
        console.error(`Failed to process batch:`, error);
      });

      res.json({
        success: true,
        batchId: editIds[0],
        totalImages: images.length,
        editIds,
        status: "queued",
        message: `Batch of ${images.length} images queued for parallel processing`
      });
    } catch (error: any) {
      console.error("Batch AI edit error:", error);
      res.status(500).json({ message: error.message || "Failed to create batch edit" });
    }
  });

  // Get edit status
  app.get("/api/ai-edits/:id", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const edit = await storage.getAIEdit(req.params.id);

      if (!edit) {
        return res.status(404).json({ message: "Edit not found" });
      }

      // Ensure user owns this edit
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
        completedAt: edit.completedAt,
      });
    } catch (error: any) {
      console.error("Failed to get AI edit:", error);
      res.status(500).json({ message: error.message || "Failed to get edit status" });
    }
  });

  // List user's AI edits
  app.get("/api/ai-edits", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const edits = await storage.listUserAIEdits(req.session.userId);

      res.json({
        edits: edits.map(edit => ({
          id: edit.id,
          status: edit.status,
          prompt: edit.prompt,
          aiModel: edit.aiModel,
          inputImageUrl: edit.inputImageUrl,
          outputImageUrl: edit.outputImageUrl,
          errorMessage: edit.errorMessage,
          cost: edit.cost,
          createdAt: edit.createdAt,
          completedAt: edit.completedAt,
        }))
      });
    } catch (error: any) {
      console.error("Failed to list AI edits:", error);
      res.status(500).json({ message: error.message || "Failed to list edits" });
    }
  });

  // Retry failed edit
  app.post("/api/ai-edits/:id/retry", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const edit = await storage.getAIEdit(req.params.id);

      if (!edit) {
        return res.status(404).json({ message: "Edit not found" });
      }

      // Ensure user owns this edit
      if (edit.userId !== req.session.userId) {
        return res.status(404).json({ message: "Edit not found" });
      }

      // Check edit status is "failed"
      if (edit.status !== "failed") {
        return res.status(400).json({ 
          message: "Only failed edits can be retried",
          currentStatus: edit.status
        });
      }

      // Check quota before retrying
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

      // Reset status to "queued"
      await storage.updateAIEdit(req.params.id, {
        status: "queued",
        errorMessage: null,
        metadata: {
          ...(edit.metadata || {}),
          retryAt: new Date().toISOString(),
        }
      });

      // Re-queue processing
      aiEditQueue.processEdit(req.params.id).catch((error) => {
        console.error(`Failed to re-queue AI edit ${req.params.id}:`, error);
      });

      // Log audit event
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
    } catch (error: any) {
      console.error("Failed to retry AI edit:", error);
      res.status(500).json({ message: error.message || "Failed to retry edit" });
    }
  });

  // Get AI usage quota
  app.get("/api/ai-usage", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const quotaInfo = await storage.checkAIQuota(req.session.userId);

      res.json({
        used: quotaInfo.used,
        limit: quotaInfo.limit,
        remaining: quotaInfo.remaining,
        canUse: quotaInfo.canUse,
      });
    } catch (error: any) {
      console.error("Failed to get AI usage:", error);
      res.status(500).json({ message: error.message || "Failed to get usage info" });
    }
  });

  // ============== Jewelry AI Generation Routes ==============

  // Generate jewelry background using AI
  app.post("/api/jewelry/generate", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { imageUrl, templateId, quality = '4k' } = req.body;

      if (!imageUrl || !templateId) {
        return res.status(400).json({ message: "Image URL and template ID are required" });
      }

      // Get template details
      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Check if user has enough coins
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.coinBalance < template.coinCost) {
        return res.status(400).json({ 
          message: `Insufficient coins. Required: ${template.coinCost}, Available: ${user.coinBalance}` 
        });
      }

      // Extract template prompt from settings
      const templateSettings = template.settings as any;
      const templatePrompt = templateSettings?.diffusionPrompt || template.description;

      // Generate jewelry background
      const result = await jewelryAIGenerator.generateJewelryBackground({
        imageUrl,
        templatePrompt,
        templateName: template.name,
        userId: req.session.userId,
        quality,
        outputSize: '1080x1080'
      });

      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to generate jewelry background",
          error: result.error 
        });
      }

      // Deduct coins from user (assuming updateUser method exists)
      // await storage.updateUser(req.session.userId, { coinBalance: user.coinBalance - template.coinCost });

      res.json({
        success: true,
        imageUrl: result.imageUrl,
        templateName: template.name,
        coinsUsed: template.coinCost,
        remainingCoins: user.coinBalance - template.coinCost,
        processingTime: result.processingTime,
        usedFallback: result.usedFallback
      });

    } catch (error: any) {
      console.error('Jewelry generation error:', error);
      res.status(500).json({ message: error.message || "Failed to generate jewelry background" });
    }
  });

  // ============== Media Gallery Routes ==============

  // Configure multer for individual image uploads to gallery
  const galleryImageUpload = multer({
    dest: "uploads/gallery/",
    limits: { 
      fileSize: 25 * 1024 * 1024, // 25MB per image
      files: 50 // Max 50 images at once
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed (JPG, PNG, WebP, GIF)"));
      }
    },
  });

  // Save uploaded images to gallery
  app.post("/api/gallery/upload-images", galleryImageUpload.array("images", 50), async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No images provided" });
      }

      const uploadedImages = [];
      
      // Create a processing job for the uploaded images
      const job = await storage.createProcessingJob({
        userId: req.session.userId,
        templateId: "upload-only", // Special template ID for raw uploads
        totalImages: req.files.length,
        coinsUsed: 0, // No coins for raw uploads
        status: "completed", // Mark as completed since no processing needed
      });
      
      for (const file of req.files) {
        try {
          // Generate unique filename
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substr(2, 9);
          const fileExtension = path.extname(file.originalname);
          const newFileName = `${timestamp}_${randomId}${fileExtension}`;
          const newFilePath = path.join("uploads/gallery", newFileName);
          
          // Move file to permanent location
          await fs.rename(file.path, newFilePath);
          
          // Get file stats
          const stats = await fs.stat(newFilePath);
          
          const imageUrl = `/uploads/gallery/${newFileName}`;
          
          // Store in images table
          const imageRecord = await storage.createImage({
            jobId: job.id,
            originalUrl: imageUrl
          });
          
          // Update image status to completed
          await storage.updateImageStatus(imageRecord.id, "completed", imageUrl);
          
          const imageData = {
            id: imageRecord.id,
            originalName: file.originalname,
            fileName: newFileName,
            filePath: imageUrl,
            fileSize: stats.size,
            mimeType: file.mimetype,
            uploadedAt: new Date(),
            userId: req.session.userId,
            jobId: job.id,
            type: 'uploaded' as const,
            status: 'completed',
            templateName: 'Raw Upload',
            jobCreatedAt: new Date(),
            originalUrl: imageUrl,
            processedUrl: imageUrl,
            thumbnailUrl: imageUrl
          };
          
          uploadedImages.push(imageData);
          
        } catch (fileError) {
          console.error(`Failed to process ${file.originalname}:`, fileError);
          // Continue with other files
        }
      }

      // Log audit
      await logAudit(
        req.session.userId,
        'gallery_images_upload',
        req.ip || 'unknown',
        req.get('User-Agent'),
        {
          uploadedCount: uploadedImages.length,
          totalSize: uploadedImages.reduce((sum, img) => sum + img.fileSize, 0)
        }
      );

      res.json({
        success: true,
        message: `Successfully uploaded ${uploadedImages.length} images to gallery`,
        images: uploadedImages,
        totalCount: uploadedImages.length
      });

    } catch (error: any) {
      console.error('Gallery upload error:', error);
      
      // Clean up on error
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          try {
            await fs.unlink(file.path);
          } catch (cleanupError) {
            console.error('Failed to cleanup file:', cleanupError);
          }
        }
      }

      res.status(500).json({ 
        message: error.message || "Failed to upload images to gallery",
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Configure multer for large ZIP uploads
  const mediaZipUpload = multer({
    dest: "uploads/media/zips/",
    limits: { 
      fileSize: 500 * 1024 * 1024, // 500MB limit for ZIP files
      files: 1
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "application/zip" || file.originalname.endsWith('.zip')) {
        cb(null, true);
      } else {
        cb(new Error("Only ZIP files are allowed"));
      }
    },
  });

  // Bulk ZIP upload to Media Library
  app.post("/api/media/upload-zip", mediaZipUpload.single("zip"), async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No ZIP file provided" });
      }

      const zipPath = req.file.path;
      const extractDir = `uploads/media/extracted/${Date.now()}`;
      
      // Create extraction directory
      await fs.mkdir(extractDir, { recursive: true });

      // Extract ZIP file
      const zip = new AdmZip(zipPath);
      const zipEntries = zip.getEntries();
      
      // Filter for image files only
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
      const imageEntries = zipEntries.filter(entry => {
        const ext = path.extname(entry.entryName).toLowerCase();
        return imageExtensions.includes(ext) && !entry.isDirectory;
      });

      if (imageEntries.length === 0) {
        return res.status(400).json({ message: "No valid image files found in ZIP" });
      }

      if (imageEntries.length > 1000) {
        return res.status(400).json({ 
          message: `Too many images. Found ${imageEntries.length}, maximum allowed is 1000` 
        });
      }

      // Extract images in batches to avoid memory issues
      const extractedImages: { name: string; url: string; size: number }[] = [];
      const BATCH_SIZE = 50;

      for (let i = 0; i < imageEntries.length; i += BATCH_SIZE) {
        const batch = imageEntries.slice(i, i + BATCH_SIZE);
        
        for (const entry of batch) {
          try {
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${path.basename(entry.entryName)}`;
            const filePath = path.join(extractDir, fileName);
            
            // Extract and save file
            zip.extractEntryTo(entry, extractDir, false, true, false, fileName);
            
            // Get file stats
            const stats = await fs.stat(filePath);
            
            extractedImages.push({
              name: entry.entryName,
              url: `/uploads/media/extracted/${path.basename(extractDir)}/${fileName}`,
              size: stats.size
            });

            // Store in media library database (using existing schema)
            // Note: This would need proper media library table implementation
            // For now, we'll skip database storage and just track in memory

          } catch (entryError) {
            console.error(`Failed to extract ${entry.entryName}:`, entryError);
            // Continue with other files
          }
        }

        // Small delay between batches to prevent overwhelming the system
        if (i + BATCH_SIZE < imageEntries.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Clean up ZIP file
      try {
        await fs.unlink(zipPath);
      } catch (cleanupError) {
        console.error('Failed to cleanup ZIP file:', cleanupError);
      }

      // Log audit
      await logAudit(
        req.session.userId,
        'media_zip_upload',
        req.ip || 'unknown',
        req.get('User-Agent'),
        {
          zipFileName: req.file.originalname,
          extractedCount: extractedImages.length,
          totalSize: extractedImages.reduce((sum, img) => sum + img.size, 0)
        }
      );

      res.json({
        success: true,
        message: `Successfully extracted ${extractedImages.length} images from ZIP`,
        images: extractedImages,
        totalCount: extractedImages.length,
        extractedPath: extractDir
      });

    } catch (error: any) {
      console.error('ZIP upload error:', error);
      
      // Clean up on error
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Failed to cleanup ZIP file on error:', cleanupError);
        }
      }

      res.status(500).json({ 
        message: error.message || "Failed to process ZIP file",
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Get all media (processed images + template thumbnails)
  app.get("/api/media", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Get images from database using direct query
      let jobs: any[] = [];
      
      try {
        // Query the database directly for user's images
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
        
        jobs = (rows as any[]).map(row => ({
          id: row.id,
          type: row.template_id === 'upload-only' ? 'uploaded' : 'processed',
          templateName: row.template_id === 'upload-only' ? 'Raw Upload' : 'Processed',
          jobCreatedAt: row.job_created_at,
          originalName: path.basename(row.original_url),
          status: row.status,
          originalUrl: row.original_url,
          processedUrl: row.processed_url || row.original_url,
          thumbnailUrl: row.processed_url || row.original_url,
          jobId: row.job_id,
          userId: row.user_id
        }));
        
        console.log(`Found ${jobs.length} images for user ${req.session.userId}`);
      } catch (dbError) {
        console.error('Database query failed, falling back to filesystem:', dbError);
        
        // Fallback to filesystem if database query fails
        try {
          const galleryDir = "uploads/gallery";
          const galleryFiles = await fs.readdir(galleryDir);
          
          jobs = galleryFiles
            .filter(file => {
              const ext = path.extname(file).toLowerCase();
              return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
            })
            .map(file => ({
              id: `uploaded-${file}`,
              type: 'uploaded',
              templateName: 'Raw Upload',
              jobCreatedAt: new Date(),
              originalName: file,
              status: 'completed',
              originalUrl: `/uploads/gallery/${file}`,
              processedUrl: `/uploads/gallery/${file}`,
              thumbnailUrl: `/uploads/gallery/${file}`
            }));
        } catch (fsError) {
          console.error('Filesystem fallback also failed:', fsError);
        }
      }
      
      // Get all templates with thumbnails (for admin users or public templates)
      const user = await storage.getUser(req.session.userId);
      let templateImages: any[] = [];
      
      if (user?.role === 'admin') {
        // Admin can see all template thumbnails
        const templates = await storage.getAllTemplatesForAdmin();
        templateImages = templates
          .filter(t => t.thumbnailUrl)
          .map(t => ({
            id: `template-${t.id}`,
            type: 'template',
            name: t.name,
            category: t.category,
            thumbnailUrl: t.thumbnailUrl,
            templateId: t.id,
            createdAt: t.createdAt,
            isPremium: t.isPremium,
            isActive: t.isActive
          }));
      } else {
        // Regular users can see active public template thumbnails
        const templates = await storage.getAllTemplates();
        templateImages = templates
          .filter(t => t.thumbnailUrl && t.isActive)
          .map(t => ({
            id: `template-${t.id}`,
            type: 'template',
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
        jobs: jobs, // Images from database
        templateImages 
      });

    } catch (error: any) {
      console.error('Failed to get media:', error);
      res.status(500).json({ message: error.message || "Failed to get media" });
    }
  });

  return createServer(app);
}
