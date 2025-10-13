import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import archiver from "archiver";
import axios from "axios";
import { insertUserSchema, insertProcessingJobSchema } from "@shared/schema";

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
async function processImageWithAI(
  imagePath: string,
  templateSettings: any
): Promise<string> {
  try {
    // Read image file
    const imageBuffer = await fs.readFile(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    // Call Python service with advanced template settings
    const response = await axios.post(`${PYTHON_SERVICE_URL}/process`, {
      image: imageBase64,
      template_settings: templateSettings,
      remove_background: true,
    }, {
      timeout: 30000, // 30 second timeout
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Processing failed");
    }

    // Return processed image as base64
    return response.data.image;
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      throw new Error("Image processing service is not running. Please start the Python service.");
    }
    throw error;
  }
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

      // Create user with initial coin balance
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Give welcome bonus coins (atomic transaction)
      await storage.addCoinsWithTransaction(user.id, 100, {
        type: "purchase",
        description: "Welcome bonus - 100 free coins",
        metadata: { source: "welcome_bonus" },
      });

      // Set session
      req.session.userId = user.id;

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
      user: { id: user.id, email: user.email, name: user.name, coinBalance: user.coinBalance, role: user.role },
    });
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
      res.json({ user: updatedUser });
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

            // Process each image with AI
            for (const image of jobImages) {
              try {
                const originalPath = path.join("uploads", path.basename(image.originalUrl));
                
                // Process with Python AI service using template settings
                const processedBase64 = await processImageWithAI(originalPath, templateSettings);
                
                // Save processed image
                const processedFileName = `processed-${path.basename(image.originalUrl)}.png`;
                const processedPath = path.join("uploads", "processed", processedFileName);
                const processedBuffer = Buffer.from(processedBase64, "base64");
                await fs.writeFile(processedPath, processedBuffer);
                
                // Update image status
                await storage.updateImageStatus(
                  image.id,
                  "completed",
                  `/uploads/processed/${processedFileName}`
                );
              } catch (error) {
                console.error(`Failed to process image ${image.id}:`, error);
                await storage.updateImageStatus(image.id, "failed", null);
              }
            }

            // Create zip file with processed images
            const zipFileName = `job-${job.id}.zip`;
            const zipPath = path.join("uploads", "processed", zipFileName);

            const output = require("fs").createWriteStream(zipPath);
            const archive = archiver("zip", { zlib: { level: 9 } });

            archive.pipe(output);

            // Add all processed images to zip
            for (const image of jobImages) {
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
            const completedCount = jobImages.filter(img => img.processedUrl).length;
            await storage.updateProcessingJobStatus(
              job.id,
              completedCount === jobImages.length ? "completed" : "failed",
              completedCount,
              `/uploads/processed/${zipFileName}`
            );

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

  const httpServer = createServer(app);
  return httpServer;
}
