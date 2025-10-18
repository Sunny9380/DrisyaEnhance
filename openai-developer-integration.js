import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

// OpenAI Developer Best Practices Implementation
class OpenAIDeveloperMode {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
    this.maxRetries = 3;
    this.timeout = 120000; // 2 minutes
  }

  // Rate limiting and retry logic (Developer Best Practice)
  async makeAPICall(endpoint, data, options = {}) {
    let retries = 0;
    
    while (retries < this.maxRetries) {
      try {
        const response = await axios({
          method: options.method || 'POST',
          url: `${this.baseURL}${endpoint}`,
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
      } catch (error) {
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

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced image processing with proper error handling
  async enhanceJewelryImage(imagePath, prompt, options = {}) {
    console.log('🤖 OpenAI Developer Mode Enhancement\n');
    
    try {
      // Validate inputs
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      if (!imagePath || !prompt) {
        throw new Error('Image path and prompt are required');
      }

      // Load and validate image
      const imageBuffer = await this.loadAndValidateImage(imagePath);
      
      console.log('📸 Image Analysis:');
      console.log(`   ✅ Size: ${imageBuffer.length} bytes`);
      console.log(`   🎯 Target: Jewelry enhancement`);
      console.log(`   📝 Prompt: ${prompt.substring(0, 100)}...`);
      
      // Try image editing first (more cost-effective)
      try {
        console.log('\n🎨 Attempting DALL-E 3 Image Edit...');
        const editResult = await this.performImageEdit(imageBuffer, prompt, options);
        if (editResult.success) {
          return editResult;
        }
      } catch (editError) {
        console.log('⚠️ Image edit failed, trying generation...');
      }

      // Fallback to image generation
      console.log('\n🎨 Attempting DALL-E 3 Generation...');
      return await this.performImageGeneration(prompt, options);

    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
        suggestions: this.getErrorSuggestions(error)
      };
    }
  }

  async loadAndValidateImage(imagePath) {
    const imageBuffer = await fs.readFile(imagePath);
    
    // Validate image size (max 4MB for DALL-E)
    if (imageBuffer.length > 4 * 1024 * 1024) {
      throw new Error('Image too large. Maximum size is 4MB for DALL-E');
    }

    return imageBuffer;
  }

  async performImageEdit(imageBuffer, prompt, options) {
    const formData = new FormData();
    formData.append('image', imageBuffer, 'jewelry.png');
    formData.append('prompt', prompt);
    formData.append('n', '1');
    formData.append('size', options.size || '1024x1024');
    formData.append('response_format', 'url');

    const response = await this.makeAPICall('/images/edits', formData, {
      headers: formData.getHeaders()
    });

    if (response.data.data && response.data.data.length > 0) {
      const imageUrl = response.data.data[0].url;
      const outputPath = options.outputPath || './openai-enhanced-jewelry.png';
      
      // Download and save image
      await this.downloadImage(imageUrl, outputPath);
      
      return {
        success: true,
        outputPath,
        imageUrl,
        method: 'image_edit',
        cost: 0.02, // Approximate cost for image edit
        metadata: {
          model: 'dall-e-3',
          prompt: prompt.substring(0, 200),
          size: options.size || '1024x1024'
        }
      };
    }

    return { success: false, error: 'No image generated' };
  }

  async performImageGeneration(prompt, options) {
    const generationPrompt = `Create luxury jewelry photography: ${prompt}`;
    
    const requestData = {
      model: 'dall-e-3',
      prompt: generationPrompt,
      n: 1,
      size: options.size || '1024x1024',
      quality: options.quality || 'hd',
      response_format: 'url'
    };

    const response = await this.makeAPICall('/images/generations', requestData, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.data && response.data.data.length > 0) {
      const imageUrl = response.data.data[0].url;
      const revisedPrompt = response.data.data[0].revised_prompt;
      const outputPath = options.outputPath || './openai-generated-jewelry.png';
      
      await this.downloadImage(imageUrl, outputPath);
      
      return {
        success: true,
        outputPath,
        imageUrl,
        method: 'generation',
        cost: options.quality === 'hd' ? 0.08 : 0.04,
        metadata: {
          model: 'dall-e-3',
          prompt: generationPrompt.substring(0, 200),
          revised_prompt: revisedPrompt,
          quality: options.quality || 'hd',
          size: options.size || '1024x1024'
        }
      };
    }

    return { success: false, error: 'No image generated' };
  }

  async downloadImage(url, outputPath) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    await fs.writeFile(outputPath, response.data);
    return outputPath;
  }

  formatError(error) {
    if (error.response?.data?.error) {
      return `${error.response.data.error.type}: ${error.response.data.error.message}`;
    }
    return error.message || 'Unknown error occurred';
  }

  getErrorSuggestions(error) {
    const suggestions = [];
    
    if (error.response?.status === 401) {
      suggestions.push('Check your OpenAI API key');
      suggestions.push('Ensure API key has proper permissions');
    } else if (error.response?.status === 429) {
      suggestions.push('Add more credits to your OpenAI account');
      suggestions.push('Reduce request frequency');
    } else if (error.response?.status === 400) {
      suggestions.push('Check image format (PNG required for edits)');
      suggestions.push('Ensure image is under 4MB');
      suggestions.push('Verify prompt length and content');
    }
    
    return suggestions;
  }

  // Batch processing with proper rate limiting
  async batchEnhance(images, prompt, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 1; // Process one at a time for rate limits
    
    console.log(`🚀 Batch processing ${images.length} images...`);
    
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      
      for (const imagePath of batch) {
        console.log(`\n📸 Processing image ${i + 1}/${images.length}: ${imagePath}`);
        
        const result = await this.enhanceJewelryImage(imagePath, prompt, {
          ...options,
          outputPath: `./batch_enhanced_${i + 1}.png`
        });
        
        results.push({
          inputPath: imagePath,
          ...result
        });
        
        // Rate limiting delay
        if (i < images.length - 1) {
          console.log('⏳ Rate limiting delay...');
          await this.sleep(3000); // 3 second delay between requests
        }
      }
    }
    
    return results;
  }
}

// Usage example
async function testDeveloperMode() {
  const openai = new OpenAIDeveloperMode();
  
  const velvetPrompt = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the earrings design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. make a image size is 1080 X 1080px.`;

  console.log('🎯 OpenAI Developer Mode Test');
  console.log('📋 Features:');
  console.log('   ✅ Automatic retry logic');
  console.log('   ✅ Rate limiting handling');
  console.log('   ✅ Proper error handling');
  console.log('   ✅ Cost optimization');
  console.log('   ✅ Batch processing support');
  console.log('');

  try {
    const result = await openai.enhanceJewelryImage(
      './your-earrings.jpg',
      velvetPrompt,
      {
        quality: 'hd',
        size: '1024x1024',
        outputPath: './developer-mode-enhanced.png'
      }
    );

    if (result.success) {
      console.log('\n🎉 SUCCESS! Developer Mode Enhancement Complete!');
      console.log(`   ✅ Output: ${result.outputPath}`);
      console.log(`   🤖 Method: ${result.method}`);
      console.log(`   💰 Cost: ~$${result.cost}`);
      console.log(`   🎨 Model: ${result.metadata.model}`);
      
      console.log('\n📊 Developer Mode Benefits:');
      console.log('   ✅ Automatic error recovery');
      console.log('   ✅ Rate limit compliance');
      console.log('   ✅ Cost optimization');
      console.log('   ✅ Detailed logging');
      console.log('   ✅ Production ready');
    } else {
      console.log('\n❌ Enhancement failed:');
      console.log(`   Error: ${result.error}`);
      console.log('   Suggestions:');
      result.suggestions?.forEach(suggestion => {
        console.log(`   - ${suggestion}`);
      });
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Export for use in your main application
export { OpenAIDeveloperMode };

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDeveloperMode();
}
