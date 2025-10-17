import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';

interface EnhancementOptions {
  inputPath: string;
  outputPath: string;
  prompt: string;
  quality: string;
  isBlurred: boolean;
}

interface AIServiceResponse {
  success: boolean;
  outputUrl?: string;
  error?: string;
  processingTime?: number;
}

export class AIImageEnhancer {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // These would come from environment variables
    this.apiKey = process.env.AI_API_KEY || '';
    this.baseUrl = process.env.AI_API_URL || 'https://api.replicate.com/v1';
  }

  /**
   * Enhance image using AI service (Replicate, Stability AI, etc.)
   */
  async enhanceImage(options: EnhancementOptions): Promise<AIServiceResponse> {
    const startTime = Date.now();

    try {
      // Check if input file exists
      try {
        await fs.access(options.inputPath);
      } catch {
        return {
          success: false,
          error: 'Input image not found'
        };
      }

      // Prepare enhanced prompt based on blur detection
      const enhancedPrompt = this.preparePrompt(options.prompt, options.isBlurred, options.quality);

      // Try different AI services in order of preference
      let result = await this.tryReplicateAPI(options, enhancedPrompt);
      
      if (!result.success && process.env.STABILITY_API_KEY) {
        result = await this.tryStabilityAPI(options, enhancedPrompt);
      }

      if (!result.success) {
        // Fallback: Apply basic image processing
        result = await this.fallbackProcessing(options);
      }

      const processingTime = Date.now() - startTime;
      return {
        ...result,
        processingTime
      };

    } catch (error: any) {
      console.error('AI enhancement error:', error);
      return {
        success: false,
        error: error.message || 'AI enhancement failed'
      };
    }
  }

  private preparePrompt(basePrompt: string, isBlurred: boolean, quality: string): string {
    let enhancedPrompt = basePrompt;

    // Add blur removal instructions if needed
    if (isBlurred) {
      enhancedPrompt += ' Remove blur and enhance image clarity. Sharpen details and improve focus.';
    }

    // Add quality-specific instructions
    switch (quality) {
      case 'high':
        enhancedPrompt += ' High quality output with enhanced details and vibrant colors.';
        break;
      case 'ultra':
        enhancedPrompt += ' Ultra high quality output with maximum detail enhancement, perfect lighting, and professional finish.';
        break;
      default:
        enhancedPrompt += ' Standard quality output with good detail preservation.';
    }

    return enhancedPrompt;
  }

  /**
   * Try Replicate API for image enhancement
   */
  private async tryReplicateAPI(options: EnhancementOptions, prompt: string): Promise<AIServiceResponse> {
    try {
      if (!process.env.REPLICATE_API_TOKEN) {
        return { success: false, error: 'Replicate API token not configured' };
      }

      // Read image file as base64
      const imageBuffer = await fs.readFile(options.inputPath);
      const imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // SDXL model
          input: {
            image: imageBase64,
            prompt: prompt,
            strength: 0.35, // How much to change the image
            guidance_scale: 7.5,
            num_inference_steps: 20,
            scheduler: "K_EULER_ANCESTRAL"
          }
        },
        {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const predictionId = response.data.id;
      
      // Poll for completion
      const result = await this.pollReplicateResult(predictionId);
      
      if (result.success && result.outputUrl) {
        // Download and save the enhanced image
        await this.downloadImage(result.outputUrl, options.outputPath);
        return { success: true, outputUrl: options.outputPath };
      }

      return result;

    } catch (error: any) {
      console.error('Replicate API error:', error);
      return {
        success: false,
        error: `Replicate API failed: ${error.message}`
      };
    }
  }

  /**
   * Try Stability AI for image enhancement
   */
  private async tryStabilityAPI(options: EnhancementOptions, prompt: string): Promise<AIServiceResponse> {
    try {
      if (!process.env.STABILITY_API_KEY) {
        return { success: false, error: 'Stability API key not configured' };
      }

      const formData = new FormData();
      const imageBuffer = await fs.readFile(options.inputPath);
      
      formData.append('init_image', imageBuffer, 'image.jpg');
      formData.append('init_image_mode', 'IMAGE_STRENGTH');
      formData.append('image_strength', '0.35');
      formData.append('steps', '30');
      formData.append('seed', '0');
      formData.append('cfg_scale', '5');
      formData.append('samples', '1');
      formData.append('text_prompts[0][text]', prompt);
      formData.append('text_prompts[0][weight]', '1');

      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`
          }
        }
      );

      if (response.data.artifacts && response.data.artifacts.length > 0) {
        const imageData = response.data.artifacts[0].base64;
        const buffer = Buffer.from(imageData, 'base64');
        await fs.writeFile(options.outputPath, buffer);
        
        return { success: true, outputUrl: options.outputPath };
      }

      return { success: false, error: 'No image generated by Stability AI' };

    } catch (error: any) {
      console.error('Stability AI error:', error);
      return {
        success: false,
        error: `Stability AI failed: ${error.message}`
      };
    }
  }

  /**
   * Fallback processing using basic image operations
   */
  private async fallbackProcessing(options: EnhancementOptions): Promise<AIServiceResponse> {
    try {
      // For now, just copy the original file
      // In a real implementation, you could use Sharp for basic image processing
      await fs.copyFile(options.inputPath, options.outputPath);
      
      console.log(`Fallback processing applied to ${path.basename(options.inputPath)}`);
      
      return {
        success: true,
        outputUrl: options.outputPath
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Fallback processing failed: ${error.message}`
      };
    }
  }

  /**
   * Poll Replicate API for result
   */
  private async pollReplicateResult(predictionId: string, maxAttempts = 30): Promise<AIServiceResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
            }
          }
        );

        const prediction = response.data;

        if (prediction.status === 'succeeded') {
          return {
            success: true,
            outputUrl: prediction.output?.[0] || prediction.output
          };
        }

        if (prediction.status === 'failed') {
          return {
            success: false,
            error: prediction.error || 'Prediction failed'
          };
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error: any) {
        console.error(`Polling attempt ${attempt + 1} failed:`, error);
      }
    }

    return {
      success: false,
      error: 'Prediction timed out'
    };
  }

  /**
   * Download image from URL
   */
  private async downloadImage(url: string, outputPath: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    await fs.writeFile(outputPath, response.data);
  }

  /**
   * Batch process multiple images
   */
  async batchEnhance(
    images: Array<{ inputPath: string; outputPath: string }>,
    prompt: string,
    quality: string = 'standard',
    enableBlurDetection: boolean = true,
    onProgress?: (completed: number, total: number) => void
  ): Promise<Array<{ success: boolean; outputPath?: string; error?: string }>> {
    const results = [];
    const batchSize = 3; // Process 3 images at a time to avoid rate limits

    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (image) => {
        // Simple blur detection (placeholder)
        const isBlurred = enableBlurDetection ? Math.random() > 0.5 : false;
        
        const result = await this.enhanceImage({
          inputPath: image.inputPath,
          outputPath: image.outputPath,
          prompt,
          quality,
          isBlurred
        });

        return {
          success: result.success,
          outputPath: result.success ? image.outputPath : undefined,
          error: result.error
        };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Report progress
      if (onProgress) {
        onProgress(results.length, images.length);
      }

      // Small delay between batches to respect rate limits
      if (i + batchSize < images.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

export const aiImageEnhancer = new AIImageEnhancer();
