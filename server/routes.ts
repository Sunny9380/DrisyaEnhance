import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import archiver from "archiver";
import axios from "axios";
import AdmZip from "adm-zip";
import { insertUserSchema, insertProcessingJobSchema, insertCoinPackageSchema, insertManualTransactionSchema, insertMediaLibrarySchema } from "@shared/schema";
import { sendWelcomeEmail, sendJobCompletedEmail, sendPaymentConfirmedEmail, sendCoinsAddedEmail, shouldSendEmail } from "./email";

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5001";

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

// Helper function to process image with Python AI service
// Create Axios client with proxy disabled for localhost to avoid "helium" DNS errors
const aiServiceClient = axios.create({
  baseURL: PYTHON_SERVICE_URL,
  proxy: false,
  timeout: 30000,
});

async function processImageWithAI(
  imagePath: string,
  templateSettings: any
): Promise<string> {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Read image file
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString("base64");

      // Call Python service with advanced template settings
      const response = await aiServiceClient.post('/process', {
        image: imageBase64,
        template_settings: templateSettings,
        remove_background: true,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Processing failed");
      }

      // Return processed image as base64
      return response.data.image;
    } catch (error: any) {
      lastError = error;
      
      // Log error with context
      console.error(`AI service call attempt ${attempt}/${maxRetries} failed:`, {
        code: error.code,
        message: error.message,
        url: PYTHON_SERVICE_URL,
      });

      // Don't retry on certain errors
      if (error.response?.status === 400) {
        throw new Error("Invalid image or template settings");
      }

      // If not last attempt, wait with exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 1000, 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  if (lastError?.code === "ECONNREFUSED") {
    throw new Error("Image processing service is not running. Please start the Python service.");
  }
  throw new Error(`AI service failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // ============== Authentication Routes ==============
  
  // Register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
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

      // Set session
      req.session.userId = user.id;

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
      const jobs = (await storage.getUserJobs(req.session.userId)); // Would need all jobs
      
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

        // Calculate coins needed (2 coins per image)
        const coinsNeeded = files.length * 2;
        
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
          ipAddress: clientIP,
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
            description: `Processed ${files.length} images`,
            metadata: { jobId: job.id },
          });
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
            const templateSettings = {
              backgroundStyle: template.backgroundStyle || 'gradient',
              lightingPreset: template.lightingPreset || 'soft-glow',
              shadowIntensity: template.settings?.shadowIntensity || 0,
              vignetteStrength: template.settings?.vignetteStrength || 0,
              colorGrading: template.settings?.colorGrading || 'neutral',
              gradientColors: template.settings?.gradientColors || ['#0F2027', '#203A43'],
              diffusionPrompt: template.settings?.diffusionPrompt || '',
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
                    const originalPath = path.join("uploads", path.basename(image.originalUrl));
                    
                    // Process with Python AI service using template settings
                    const processedBase64 = await processImageWithAI(originalPath, templateSettings);
                    
                    // Save processed image
                    const processedFileName = `processed-${path.basename(image.originalUrl)}.png`;
                    const processedPath = path.join("uploads", "processed", processedFileName);
                    const processedBuffer = Buffer.from(processedBase64, "base64");
                    await fs.writeFile(processedPath, processedBuffer);
                    
                    const processedUrl = `/uploads/processed/${processedFileName}`;
                    
                    // Update image status
                    await storage.updateImageStatus(
                      image.id,
                      "completed",
                      processedUrl
                    );
                    
                    // Save to media library
                    await storage.createMediaLibraryEntry({
                      userId: job.userId,
                      jobId: job.id,
                      imageId: image.id,
                      fileName: path.basename(image.originalUrl),
                      processedUrl,
                      fileSize: processedBuffer.length,
                      dimensions: "1080x1080",
                      templateUsed: template.name,
                      tags: [],
                      isFavorite: false,
                    });
                  } catch (error) {
                    console.error(`Failed to process image ${image.id}:`, error);
                    await storage.updateImageStatus(image.id, "failed", null);
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

  // Get user's jobs
  app.get("/api/jobs", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const jobs = await storage.getUserProcessingJobs(req.session.userId);
      res.json({ jobs });
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

  // ============== Media Library Routes ==============

  // Get user's media library
  app.get("/api/media-library", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const media = await storage.getUserMediaLibrary(req.session.userId);
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
      const { isFavorite } = req.body;
      const media = await storage.getMediaLibraryEntry(req.params.id);
      
      if (!media || media.userId !== req.session.userId) {
        return res.status(404).json({ message: "Media not found" });
      }

      await storage.toggleMediaFavorite(req.params.id, isFavorite);
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
      const media = await storage.getMediaLibraryEntry(req.params.id);
      
      if (!media || media.userId !== req.session.userId) {
        return res.status(404).json({ message: "Media not found" });
      }

      await storage.deleteMediaLibraryEntry(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete media" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
