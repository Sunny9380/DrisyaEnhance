import { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { openaiImageEnhancer } from "../services/openaiImageEnhancer";

// Configure multer for OpenAI uploads
const openaiUpload = multer({
  dest: "uploads/openai/",
  limits: { 
    fileSize: 20 * 1024 * 1024, // 20MB limit for OpenAI
    files: 100 // Max 100 files for batch processing
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WebP images are allowed for OpenAI"));
    }
  },
});

export function registerOpenAIRoutes(app: Express) {
  
  // ============== OpenAI DALL-E Enhancement Routes ==============

  // Single image enhancement with DALL-E
  app.post("/api/openai/enhance", openaiUpload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No image provided" });
      }

      const { prompt, quality = "standard" } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required" });
      }

      console.log(`🤖 OpenAI Enhancement Request:`);
      console.log(`   📸 Image: ${req.file.originalname} (${req.file.size} bytes)`);
      console.log(`   📝 Prompt: ${prompt.substring(0, 100)}...`);
      console.log(`   🎯 Quality: ${quality}`);

      const inputPath = req.file.path;
      const outputFileName = `openai_enhanced_${Date.now()}.png`;
      const outputPath = path.join("uploads", "processed", outputFileName);
      const outputUrl = `/uploads/processed/${outputFileName}`;

      // Ensure processed directory exists
      await fs.mkdir(path.join("uploads", "processed"), { recursive: true });

      // Use OpenAI enhancement service
      const result = await openaiImageEnhancer.enhanceImage({
        inputPath,
        outputPath,
        prompt,
        quality,
        isBlurred: false // You can add blur detection logic here
      });

      // Clean up input file
      try {
        await fs.unlink(inputPath);
      } catch (err) {
        console.error("Failed to cleanup input file:", err);
      }

      if (result.success) {
        console.log(`✅ OpenAI enhancement successful: ${outputUrl}`);
        console.log(`⏱️ Processing time: ${result.processingTime}ms`);
        
        res.json({
          success: true,
          outputUrl,
          processingTime: result.processingTime,
          metadata: result.metadata,
          model: result.metadata?.model || 'dall-e-3'
        });
      } else {
        console.log(`❌ OpenAI enhancement failed: ${result.error}`);
        res.status(500).json({
          success: false,
          error: result.error || "OpenAI enhancement failed"
        });
      }
    } catch (error: any) {
      console.error("OpenAI enhancement error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error"
      });
    }
  });

  // Batch image enhancement with DALL-E
  app.post("/api/openai/batch-enhance", openaiUpload.array("images", 100), async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, error: "No images provided" });
      }

      const { prompt, quality = "standard" } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required" });
      }

      console.log(`🤖 OpenAI Batch Enhancement:`);
      console.log(`   📸 Images: ${files.length}`);
      console.log(`   📝 Prompt: ${prompt.substring(0, 100)}...`);
      console.log(`   🎯 Quality: ${quality}`);

      // Prepare image paths
      const imageJobs = files.map(file => ({
        inputPath: file.path,
        outputPath: path.join("uploads", "processed", `openai_batch_${Date.now()}_${Math.random().toString(36).substring(7)}.png`)
      }));

      // Ensure processed directory exists
      await fs.mkdir(path.join("uploads", "processed"), { recursive: true });

      // Start batch processing
      const results = await openaiImageEnhancer.batchEnhance(
        imageJobs,
        prompt,
        quality,
        true, // Enable blur detection
        (completed, total) => {
          console.log(`📊 Progress: ${completed}/${total} images processed`);
        }
      );

      // Clean up input files
      for (const file of files) {
        try {
          await fs.unlink(file.path);
        } catch (err) {
          console.error("Failed to cleanup input file:", err);
        }
      }

      // Prepare response
      const successfulResults = results.filter(r => r.success);
      const failedResults = results.filter(r => !r.success);

      const responseData = {
        success: true,
        totalImages: files.length,
        successful: successfulResults.length,
        failed: failedResults.length,
        results: results.map((result, index) => ({
          originalName: files[index].originalname,
          success: result.success,
          outputUrl: result.success ? `/uploads/processed/${path.basename(result.outputPath!)}` : null,
          error: result.error
        }))
      };

      console.log(`✅ Batch processing complete: ${successfulResults.length}/${files.length} successful`);

      res.json(responseData);
    } catch (error: any) {
      console.error("OpenAI batch enhancement error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Batch processing failed"
      });
    }
  });

  // Get OpenAI API status
  app.get("/api/openai/status", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        return res.json({
          configured: false,
          error: "OpenAI API key not configured"
        });
      }

      // Test API connection
      try {
        const testResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          }
        });

        if (testResponse.ok) {
          res.json({
            configured: true,
            connected: true,
            models: ['dall-e-3', 'dall-e-2'],
            status: "Ready for image enhancement"
          });
        } else {
          res.json({
            configured: true,
            connected: false,
            error: "Invalid API key or connection failed"
          });
        }
      } catch (error: any) {
        res.json({
          configured: true,
          connected: false,
          error: error.message
        });
      }
    } catch (error: any) {
      res.status(500).json({
        configured: false,
        error: error.message || "Status check failed"
      });
    }
  });

  // ChatGPT-style simple enhancement endpoint
  app.post("/api/openai/simple-enhance", openaiUpload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: "Please upload an image" 
        });
      }

      // Use default velvet prompt if none provided
      const defaultPrompt = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the jewelry design, colors, and composition remain exactly the same with no changes or alterations. Output size 1080x1080px.`;

      const { prompt = defaultPrompt, quality = "hd" } = req.body;

      console.log(`🎨 ChatGPT-style Enhancement:`);
      console.log(`   📸 Input: ${req.file.originalname}`);
      console.log(`   🎯 Using: DALL-E 3 ${quality} quality`);

      const inputPath = req.file.path;
      const outputFileName = `chatgpt_style_${Date.now()}.png`;
      const outputPath = path.join("uploads", "processed", outputFileName);
      const outputUrl = `/uploads/processed/${outputFileName}`;

      await fs.mkdir(path.join("uploads", "processed"), { recursive: true });

      const result = await openaiImageEnhancer.enhanceImage({
        inputPath,
        outputPath,
        prompt,
        quality,
        isBlurred: false
      });

      // Clean up
      try {
        await fs.unlink(inputPath);
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
          quality: quality,
          prompt: prompt.substring(0, 100) + "..."
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || "Enhancement failed"
        });
      }
    } catch (error: any) {
      console.error("Simple enhancement error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error"
      });
    }
  });
}
