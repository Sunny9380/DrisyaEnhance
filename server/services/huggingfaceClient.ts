interface HFInferenceOptions {
  model: string;
  inputs: string | object;
  parameters?: Record<string, any>;
}

interface HFResponse {
  error?: string;
  estimated_time?: number;
}

export class HuggingFaceClient {
  private apiKey: string;
  private baseUrl = "https://api-inference.huggingface.co/models";
  
  // Model configurations
  private models = {
    "qwen-2509": "Qwen/Qwen-Image-Edit-2509",
    "flux-kontext": "black-forest-labs/FLUX.1-Kontext-dev",
    "auto": "Qwen/Qwen-Image-Edit-2509", // Default to Qwen for e-commerce
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.HF_API_TOKEN || "";
    
    if (!this.apiKey) {
      console.warn("⚠️ HF_API_TOKEN not set. AI editing will use fallback mode.");
    }
  }

  /**
   * Edit an image using AI model with custom prompt
   */
  async editImage(
    imageUrl: string,
    prompt: string,
    modelKey: string = "auto"
  ): Promise<Buffer | null> {
    try {
      const modelName = this.models[modelKey as keyof typeof this.models] || this.models.auto;
      
      console.log(`🤖 Calling HuggingFace model: ${modelName}`);
      console.log(`📝 Prompt: ${prompt}`);

      // Fetch the image
      const imageResponse = await fetch(imageUrl);
      const imageArrayBuffer = await imageResponse.arrayBuffer();
      const imageBuffer = Buffer.from(imageArrayBuffer);

      // Call HuggingFace Inference API
      // Note: For image-to-image models, the image goes in "inputs" and prompt in "parameters"
      const response = await fetch(`${this.baseUrl}/${modelName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            image: imageBuffer.toString("base64"),
            prompt: prompt,
          },
        }),
      });

      // Handle rate limiting (429)
      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        console.warn(`⏳ Rate limited. Retry after: ${retryAfter}s`);
        throw new Error(`RATE_LIMITED:${retryAfter || "60"}`);
      }

      // Handle errors
      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ HF API Error (${response.status}):`, error);
        throw new Error(`HF_API_ERROR:${response.status}:${error}`);
      }

      // Check for model loading
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const json = (await response.json()) as HFResponse;
        if (json.error?.includes("loading")) {
          console.warn("🔄 Model is loading. Estimated time:", json.estimated_time);
          throw new Error(`MODEL_LOADING:${json.estimated_time || 20}`);
        }
      }

      // Return image buffer
      const resultArrayBuffer = await response.arrayBuffer();
      const resultBuffer = Buffer.from(resultArrayBuffer);
      console.log(`✅ HuggingFace processing successful (${resultBuffer.length} bytes)`);
      
      return resultBuffer;
    } catch (error: any) {
      console.error("❌ HuggingFace client error:", error.message);
      
      // Re-throw custom errors
      if (error.message.startsWith("RATE_LIMITED:") || 
          error.message.startsWith("MODEL_LOADING:") ||
          error.message.startsWith("HF_API_ERROR:")) {
        throw error;
      }
      
      // Generic error
      throw new Error(`HF_CLIENT_ERROR:${error.message}`);
    }
  }

  /**
   * Fallback to local Python service when HF API fails
   */
  async fallbackToLocal(imageUrl: string, prompt: string): Promise<Buffer | null> {
    console.log("🔧 Falling back to local Python service...");
    
    try {
      // Call local Python service (existing Drisya service on port 5001)
      const response = await fetch("http://127.0.0.1:5001/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          prompt: prompt,
          model: "local",
        }),
      });

      if (!response.ok) {
        throw new Error(`Local service error: ${response.status}`);
      }

      const resultArrayBuffer = await response.arrayBuffer();
      const resultBuffer = Buffer.from(resultArrayBuffer);
      console.log(`✅ Local processing successful (${resultBuffer.length} bytes)`);
      
      return resultBuffer;
    } catch (error: any) {
      console.error("❌ Local fallback failed:", error.message);
      throw new Error(`LOCAL_FALLBACK_ERROR:${error.message}`);
    }
  }

  /**
   * Smart processing: Try HF API first, fallback to local if needed
   */
  async processWithFallback(
    imageUrl: string,
    prompt: string,
    modelKey: string = "auto"
  ): Promise<{ buffer: Buffer; usedFallback: boolean }> {
    try {
      const buffer = await this.editImage(imageUrl, prompt, modelKey);
      if (buffer) {
        return { buffer, usedFallback: false };
      }
      throw new Error("No buffer returned");
    } catch (error: any) {
      console.warn("🔄 HF API failed, trying local fallback...");
      
      // Try local fallback
      const buffer = await this.fallbackToLocal(imageUrl, prompt);
      if (!buffer) {
        throw new Error("Both HF API and local fallback failed");
      }
      
      return { buffer, usedFallback: true };
    }
  }

  /**
   * Check if we have a valid API key
   */
  hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return Object.keys(this.models);
  }
}

// Singleton instance
export const huggingFaceClient = new HuggingFaceClient();
