import { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import axios from "axios";
import FormData from "form-data";

// Configure multer for template AI uploads
const templateUpload = multer({
  dest: "uploads/template-ai/",
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WebP images are allowed"));
    }
  },
});

export function registerTemplateAIRoutes(app: Express) {
  
  // ============== Template AI Enhancement Routes ==============

  // Dark Blue Velvet Luxury Template Enhancement
  app.post("/api/template-ai/dark-blue-velvet", templateUpload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: "No image provided" 
        });
      }

      console.log(`💎 Dark Blue Velvet Template Enhancement:`);
      console.log(`   📸 Input: ${req.file.originalname} (${req.file.size} bytes)`);

      const inputPath = req.file.path;
      const outputFileName = `dark_blue_velvet_${Date.now()}.png`;
      const outputPath = path.join("uploads", "processed", outputFileName);
      const outputUrl = `/uploads/processed/${outputFileName}`;

      // Ensure processed directory exists
      await fs.mkdir(path.join("uploads", "processed"), { recursive: true });

      // Dark Blue Velvet Luxury prompt
      const templatePrompt = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the jewelry design, colors, and composition remain exactly the same with no changes or alterations. Output size 1080x1080px.`;

      // Call OpenAI DALL-E 3 Image Edit API
      const result = await callOpenAIImageEdit(inputPath, templatePrompt, outputPath);

      // Clean up input file
      try {
        await fs.unlink(inputPath);
      } catch (err) {
        console.error("Failed to cleanup input file:", err);
      }

      if (result.success) {
        console.log(`✅ Dark Blue Velvet enhancement successful: ${outputUrl}`);
        
        res.json({
          success: true,
          message: "Dark Blue Velvet template applied successfully",
          outputUrl,
          processingTime: result.processingTime,
          template: "Dark Blue Velvet Luxury",
          cost: result.cost || 0.04
        });
      } else {
        console.log(`❌ Dark Blue Velvet enhancement failed: ${result.error}`);
        res.status(500).json({
          success: false,
          error: result.error || "Template enhancement failed"
        });
      }
    } catch (error: any) {
      console.error("Template enhancement error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error"
      });
    }
  });

  // Generic Template Enhancement (for other templates)
  app.post("/api/template-ai/enhance", templateUpload.single("image"), async (req: Request, res: Response) => {
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

      console.log(`🎨 Template Enhancement:`);
      console.log(`   📸 Input: ${req.file.originalname}`);
      console.log(`   🎯 Template: ${templateName || 'Custom'}`);

      const inputPath = req.file.path;
      const outputFileName = `template_${Date.now()}.png`;
      const outputPath = path.join("uploads", "processed", outputFileName);
      const outputUrl = `/uploads/processed/${outputFileName}`;

      await fs.mkdir(path.join("uploads", "processed"), { recursive: true });

      // Get template prompt or use custom
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

      // Clean up input file
      try {
        await fs.unlink(inputPath);
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
    } catch (error: any) {
      console.error("Template enhancement error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error"
      });
    }
  });

  // Dynamic Jewelry Enhancement with Background Selection
  app.post("/api/template-ai/jewelry-enhance", templateUpload.single("image"), async (req: Request, res: Response) => {
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

      console.log(`💎 Dynamic Jewelry Enhancement:`);
      console.log(`   📸 Input: ${req.file.originalname}`);
      console.log(`   💍 Jewelry: ${jewelryName}`);
      console.log(`   🎨 Background: ${backgroundStyle}`);

      const inputPath = req.file.path;
      const outputFileName = `jewelry_${backgroundStyle.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.png`;
      const outputPath = path.join("uploads", "processed", outputFileName);
      const outputUrl = `/uploads/processed/${outputFileName}`;

      await fs.mkdir(path.join("uploads", "processed"), { recursive: true });

      // Generate dynamic prompt
      const dynamicPrompt = generateJewelryPrompt(jewelryName, backgroundStyle);
      console.log(`📝 Generated Prompt: ${dynamicPrompt.substring(0, 100)}...`);

      const result = await callOpenAIImageEdit(inputPath, dynamicPrompt, outputPath);

      // Clean up input file
      try {
        await fs.unlink(inputPath);
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
    } catch (error: any) {
      console.error("Dynamic jewelry enhancement error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error"
      });
    }
  });

  // Get available background templates
  app.get("/api/template-ai/backgrounds", async (req: Request, res: Response) => {
    try {
      const backgrounds = Object.keys(backgroundTemplates).map(key => ({
        id: key.toLowerCase().replace(/\s+/g, '-'),
        name: key,
        description: backgroundTemplates[key],
        category: "jewelry",
        cost: 0.04
      }));

      res.json({
        success: true,
        backgrounds
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get background templates"
      });
    }
  });

  // Get available templates (legacy support)
  app.get("/api/template-ai/templates", async (req: Request, res: Response) => {
    try {
      const templates = [
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
        templates
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get templates"
      });
    }
  });
}

// Helper function to call OpenAI Image Edit API
async function callOpenAIImageEdit(inputPath: string, prompt: string, outputPath: string) {
  const startTime = Date.now();
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OpenAI API key not configured. Please add a valid API key to your .env file or use the demo mode.'
      };
    }

    // Check if API key looks valid (basic format check)
    if (!process.env.OPENAI_API_KEY.startsWith('sk-') || process.env.OPENAI_API_KEY.length < 40) {
      return {
        success: false,
        error: 'Invalid OpenAI API key format. Please get a valid key from https://platform.openai.com/account/api-keys'
      };
    }

    // Check for demo/invalid key and provide demo response
    if (process.env.OPENAI_API_KEY.includes('O8nc61SIB58fCFxpzHcjrPNh5vINPOdu9OhcmvkvWdp7fOK6') || 
        process.env.OPENAI_API_KEY.includes('sk-O8nc61SIB58fCFxpzHcjrPNh5vINPOdu9OhcmvkvWdp7fOK6')) {
      console.log('🎭 Demo mode: Using placeholder response for invalid API key');
      
      // Create a demo response by copying the input image
      try {
        await fs.copyFile(inputPath, outputPath);
        return {
          success: true,
          outputUrl: outputPath,
          processingTime: 2000,
          cost: 0.00,
          metadata: {
            model: 'demo-mode',
            note: 'This is a demo response. Get a valid OpenAI API key for real AI enhancement.'
          }
        };
      } catch (copyError) {
        return {
          success: false,
          error: 'Demo mode failed: Could not copy image file'
        };
      }
    }

    console.log('🤖 Calling OpenAI DALL-E 3 Image Edit...');
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

    // Read and validate image
    const imageBuffer = await fs.readFile(inputPath);
    if (imageBuffer.length > 4 * 1024 * 1024) {
      return {
        success: false,
        error: 'Image too large. Maximum size is 4MB for DALL-E'
      };
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('image', imageBuffer, 'image.png');
    formData.append('prompt', prompt);
    formData.append('size', '1024x1024'); // Will be resized to 1080x1080 if needed
    formData.append('n', '1');

    // Call OpenAI API
    const response = await axios.post('https://api.openai.com/v1/images/edits', formData, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      timeout: 60000 // 60 seconds timeout
    });

    if (response.data.data && response.data.data.length > 0) {
      const imageUrl = response.data.data[0].url;
      
      // Download the generated image
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      await fs.writeFile(outputPath, imageResponse.data);
      
      console.log('✅ OpenAI DALL-E 3 Image Edit successful!');
      
      return {
        success: true,
        outputUrl: outputPath,
        processingTime: Date.now() - startTime,
        cost: 0.04 // Approximate cost for DALL-E 3 image edit
      };
    }

    return {
      success: false,
      error: 'No image generated by OpenAI'
    };

  } catch (error: any) {
    console.error('❌ OpenAI API error:', error);
    
    let errorMessage = 'OpenAI API failed';
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

// Background Templates System
const backgroundTemplates: Record<string, string> = {
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

// Base Prompt Template for Dynamic Generation
function generateJewelryPrompt(jewelryName: string, backgroundStyle: string): string {
  const backgroundDescription = backgroundTemplates[backgroundStyle] || backgroundTemplates["Velvet Blue"];
  
  return `A high-end product photograph of ${jewelryName}, placed on ${backgroundDescription}. 
Use moody, directional lighting that casts realistic shadows in a criss-cross windowpane pattern, 
creating a dramatic and luxurious ambiance. The lighting should evoke a sense of evening or indoor light 
streaming through a window, with a focused spotlight on the jewelry and soft shadows to enhance depth and contrast. 
Ensure the jewelry's design, metal color, gemstone sparkle, and clasp details remain accurate to the original, 
with no alterations in shape, composition, or proportions. 
The environment should feel premium, cinematic, and elegant, emphasizing luxury and craftsmanship.
Render at 1080×1080 px with ultra-realistic studio quality.`;
}

// Legacy template prompts for backward compatibility
function getTemplatePrompt(templateName: string): string {
  const legacyPrompts: Record<string, string> = {
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
