import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

interface OpenAIEnhancementOptions {
  inputPath: string;
  outputPath: string;
  prompt: string;
  quality: string;
  isBlurred: boolean;
}

interface OpenAIServiceResponse {
  success: boolean;
  outputUrl?: string;
  error?: string;
  processingTime?: number;
  metadata?: any;
}

export class OpenAIImageEnhancer {
  private apiKey: string;
  private baseUrl: string;
  private maxRetries: number;
  private timeout: number;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
    this.maxRetries = 3;
    this.timeout = 120000; // 2 minutes
  }

  /**
   * Sleep utility for rate limiting
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make API call with retry logic and rate limiting
   */
  private async makeAPICall(endpoint: string, data: any, options: any = {}): Promise<any> {
    let retries = 0;
    
    while (retries < this.maxRetries) {
      try {
        const response = await axios({
          method: options.method || 'POST',
          url: `${this.baseUrl}${endpoint}`,
          data,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'User-Agent': 'DrisyaAI-JewelryEnhancer/1.0',
            ...options.headers
          },
          timeout: this.timeout,
          ...options
        });

        return response;
      } catch (error: any) {
        retries++;
        
        // Handle rate limiting (429 errors)
        if (error.response?.status === 429 && retries < this.maxRetries) {
          const retryAfter = error.response.headers['retry-after'] || Math.pow(2, retries);
          console.log(`⏳ Rate limited. Retrying in ${retryAfter} seconds...`);
          await this.sleep(retryAfter * 1000);
          continue;
        }
        
        // Handle server errors (5xx)
        if (error.response?.status >= 500 && retries < this.maxRetries) {
          console.log(`🔄 Server error. Retry ${retries}/${this.maxRetries}...`);
          await this.sleep(1000 * retries);
          continue;
        }
        
        throw error;
      }
    }
  }

  /**
   * Enhance image using OpenAI DALL-E API
   */
  async enhanceImage(options: OpenAIEnhancementOptions): Promise<OpenAIServiceResponse> {
    const startTime = Date.now();

    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'OpenAI API key not configured'
        };
      }

      // Check if input file exists
      try {
        await fs.access(options.inputPath);
      } catch {
        return {
          success: false,
          error: 'Input image not found'
        };
      }

      console.log('🤖 Using OpenAI DALL-E for enhancement...');
      console.log(`📝 Prompt: ${options.prompt.substring(0, 100)}...`);

      // Prepare enhanced prompt
      const enhancedPrompt = this.preparePrompt(options.prompt, options.isBlurred, options.quality);

      // Try DALL-E 3 Image Edit first
      let result = await this.tryDALLE3ImageEdit(options, enhancedPrompt);
      
      if (!result.success) {
        // Fallback to DALL-E 3 Generation
        result = await this.tryDALLE3Generation(options, enhancedPrompt);
      }

      const processingTime = Date.now() - startTime;
      return {
        ...result,
        processingTime
      };

    } catch (error: any) {
      console.error('OpenAI enhancement error:', error);
      return {
        success: false,
        error: error.message || 'OpenAI enhancement failed'
      };
    }
  }

  private preparePrompt(basePrompt: string, isBlurred: boolean, quality: string): string {
    let enhancedPrompt = basePrompt;

    // Add blur removal instructions if needed
    if (isBlurred) {
      enhancedPrompt += ' Remove any blur and enhance image clarity. Sharpen all details and improve focus.';
    }

    // Add quality-specific instructions
    switch (quality) {
      case 'high':
        enhancedPrompt += ' Create high quality output with enhanced details, vibrant colors, and professional finish.';
        break;
      case 'ultra':
        enhancedPrompt += ' Create ultra high quality output with maximum detail enhancement, perfect lighting, professional studio quality.';
        break;
      default:
        enhancedPrompt += ' Create standard quality output with good detail preservation.';
    }

    return enhancedPrompt;
  }

  /**
   * Try DALL-E 3 Image Edit API with developer mode features
   */
  private async tryDALLE3ImageEdit(options: OpenAIEnhancementOptions, prompt: string): Promise<OpenAIServiceResponse> {
    try {
      console.log('🎨 Trying DALL-E 3 Image Edit (Developer Mode)...');

      // Validate image size (max 4MB for DALL-E)
      const imageBuffer = await fs.readFile(options.inputPath);
      if (imageBuffer.length > 4 * 1024 * 1024) {
        return {
          success: false,
          error: 'Image too large. Maximum size is 4MB for DALL-E'
        };
      }
      
      const formData = new FormData();
      formData.append('image', imageBuffer, 'image.png');
      formData.append('prompt', prompt);
      formData.append('n', '1');
      formData.append('size', '1024x1024');
      formData.append('response_format', 'url');

      // Use developer mode API call with retry logic
      const response = await this.makeAPICall('/images/edits', formData, {
        headers: formData.getHeaders()
      });

      if (response.data.data && response.data.data.length > 0) {
        const imageUrl = response.data.data[0].url;
        
        // Download the generated image
        await this.downloadImage(imageUrl, options.outputPath);
        
        console.log('✅ DALL-E 3 Image Edit successful (Developer Mode)!');
        
        return {
          success: true,
          outputUrl: options.outputPath,
          metadata: {
            model: 'dall-e-3-edit',
            method: 'image_edit',
            prompt: prompt.substring(0, 200),
            quality: options.quality,
            size: '1024x1024',
            cost_estimate: 0.02, // Image edit pricing
            developer_mode: true
          }
        };
      }

      return { success: false, error: 'No image generated by DALL-E 3 Edit' };

    } catch (error: any) {
      console.error('❌ DALL-E 3 Image Edit failed:', error);
      
      let errorMessage = 'DALL-E 3 Image Edit failed';
      let suggestions: string[] = [];
      
      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        errorMessage = `DALL-E 3 Edit failed: ${apiError.message}`;
        
        // Add developer mode suggestions
        if (apiError.type === 'insufficient_quota') {
          suggestions.push('Add more credits to your OpenAI account');
          suggestions.push('Check billing limits at https://platform.openai.com/account/billing');
        } else if (apiError.code === 'invalid_image_format') {
          suggestions.push('Convert image to PNG format');
          suggestions.push('Ensure image is under 4MB');
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        metadata: {
          suggestions,
          developer_mode: true
        }
      };
    }
  }

  /**
   * Try DALL-E 3 Generation (fallback)
   */
  private async tryDALLE3Generation(options: OpenAIEnhancementOptions, prompt: string): Promise<OpenAIServiceResponse> {
    try {
      console.log('🎨 Trying DALL-E 3 Generation...');

      const generationPrompt = `Create a luxury jewelry photography image: ${prompt}`;

      const response = await axios.post(
        `${this.baseUrl}/images/generations`,
        {
          model: 'dall-e-3',
          prompt: generationPrompt,
          n: 1,
          size: '1024x1024',
          quality: options.quality === 'ultra' ? 'hd' : 'standard',
          response_format: 'url'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      if (response.data.data && response.data.data.length > 0) {
        const imageUrl = response.data.data[0].url;
        
        await this.downloadImage(imageUrl, options.outputPath);
        
        console.log('✅ DALL-E 3 Generation successful!');
        
        return {
          success: true,
          outputUrl: options.outputPath,
          metadata: {
            model: 'dall-e-3-generation',
            prompt: generationPrompt.substring(0, 200),
            quality: options.quality,
            revised_prompt: response.data.data[0].revised_prompt
          }
        };
      }

      return { success: false, error: 'No image generated by DALL-E 3' };

    } catch (error: any) {
      console.error('❌ DALL-E 3 Generation failed:', error);
      
      let errorMessage = 'DALL-E 3 Generation failed';
      if (error.response?.data?.error) {
        errorMessage = `DALL-E 3 failed: ${error.response.data.error.message}`;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
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
    
    // Process one at a time to respect OpenAI rate limits
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      const result = await this.enhanceImage({
        inputPath: image.inputPath,
        outputPath: image.outputPath,
        prompt,
        quality,
        isBlurred: enableBlurDetection
      });

      results.push({
        success: result.success,
        outputPath: result.success ? image.outputPath : undefined,
        error: result.error
      });

      // Report progress
      if (onProgress) {
        onProgress(i + 1, images.length);
      }

      // Rate limiting delay (OpenAI has strict limits)
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      }
    }

    return results;
  }
}

export const openaiImageEnhancer = new OpenAIImageEnhancer();
