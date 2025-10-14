import { storage } from "../storage";
import { huggingFaceClient } from "../services/huggingfaceClient";
import { promises as fs } from "fs";
import path from "path";

interface RetryConfig {
  maxAttempts: number;
  currentAttempt: number;
  waitTime?: number;
}

export class AIEditQueue {
  private processing = new Set<string>();

  /**
   * Convert relative URL to absolute URL for external APIs
   */
  private getAbsoluteUrl(relativeUrl: string): string {
    // If already absolute, return as-is
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }

    // Get base URL from environment or use localhost for development
    const baseUrl = process.env.REPL_SLUG 
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      : `http://localhost:${process.env.PORT || 5000}`;

    // Ensure relative URL starts with /
    const url = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
    
    return `${baseUrl}${url}`;
  }

  /**
   * Process an AI edit request with full error handling and retries
   */
  async processEdit(editId: string): Promise<void> {
    if (this.processing.has(editId)) {
      console.log(`⏭️ Edit ${editId} is already being processed, skipping`);
      return;
    }

    this.processing.add(editId);

    try {
      // 1. Get edit record
      const edit = await storage.getAIEdit(editId);
      if (!edit) {
        throw new Error("Edit record not found");
      }

      console.log(`🎨 Processing AI edit ${editId} for user ${edit.userId}`);

      // 2. Check user quota
      const quotaCheck = await storage.checkAIQuota(edit.userId);
      if (!quotaCheck.canUse) {
        throw new Error(
          `User has exceeded AI quota. Used: ${quotaCheck.used}/${quotaCheck.limit}`
        );
      }

      // 3. Update status to processing
      await storage.updateAIEdit(editId, {
        status: "processing",
        metadata: {
          startedAt: new Date().toISOString(),
          retryCount: 0,
        },
      });

      // 4. Convert relative URL to absolute for external APIs
      const absoluteImageUrl = this.getAbsoluteUrl(edit.inputImageUrl);
      console.log(`📸 Input image URL: ${absoluteImageUrl}`);

      // 5. Call HF client with retry logic
      const result = await this.processWithRetry(absoluteImageUrl, edit.prompt, edit.aiModel);

      // 6. Upload result to storage
      const outputUrl = await this.uploadResult(result.buffer, editId);

      // 7. Update edit record with success
      await storage.updateAIEdit(editId, {
        status: "completed",
        outputImageUrl: outputUrl,
        cost: result.cost,
        completedAt: new Date(),
        metadata: {
          usedFallback: result.usedFallback,
          processingTime: Date.now() - new Date(edit.createdAt).getTime(),
        },
      });

      // 8. Increment AI usage counter
      const isFree = result.cost === 0;
      await storage.incrementAIUsage(edit.userId, isFree, result.cost);

      console.log(`✅ AI edit ${editId} completed successfully`);
    } catch (error: any) {
      console.error(`❌ AI edit ${editId} failed:`, error.message);
      await this.handleError(editId, error);
    } finally {
      this.processing.delete(editId);
    }
  }

  /**
   * Process image with retry logic for rate limits and model loading
   */
  private async processWithRetry(
    imageUrl: string,
    prompt: string,
    modelKey: string = "auto"
  ): Promise<{ buffer: Buffer; cost: number; usedFallback: boolean }> {
    const rateLimitConfig: RetryConfig = { maxAttempts: 3, currentAttempt: 0 };
    const modelLoadingConfig: RetryConfig = { maxAttempts: 2, currentAttempt: 0 };

    while (rateLimitConfig.currentAttempt < rateLimitConfig.maxAttempts) {
      try {
        // Try HF API first
        const buffer = await huggingFaceClient.editImage(imageUrl, prompt, modelKey);
        
        if (buffer) {
          // Success - HF API worked
          return { buffer, cost: 0, usedFallback: false };
        }

        throw new Error("No buffer returned from HF API");
      } catch (error: any) {
        const errorMsg = error.message || "";

        // Handle RATE_LIMITED errors
        if (errorMsg.startsWith("RATE_LIMITED:")) {
          const retryAfter = parseInt(errorMsg.split(":")[1] || "60");
          rateLimitConfig.currentAttempt++;

          if (rateLimitConfig.currentAttempt < rateLimitConfig.maxAttempts) {
            const waitTime = retryAfter * Math.pow(2, rateLimitConfig.currentAttempt - 1);
            console.log(
              `⏳ Rate limited. Waiting ${waitTime}s before retry ${rateLimitConfig.currentAttempt}/${rateLimitConfig.maxAttempts}`
            );
            await this.sleep(waitTime * 1000);
            continue;
          } else {
            console.log("🔄 Max rate limit retries reached, trying fallback...");
            break;
          }
        }

        // Handle MODEL_LOADING errors
        if (errorMsg.startsWith("MODEL_LOADING:")) {
          const estimatedTime = parseInt(errorMsg.split(":")[1] || "20");
          modelLoadingConfig.currentAttempt++;

          if (modelLoadingConfig.currentAttempt < modelLoadingConfig.maxAttempts) {
            console.log(
              `🔄 Model loading. Waiting ${estimatedTime}s before retry ${modelLoadingConfig.currentAttempt}/${modelLoadingConfig.maxAttempts}`
            );
            await this.sleep(estimatedTime * 1000);
            continue;
          } else {
            console.log("🔄 Model still loading after retries, trying fallback...");
            break;
          }
        }

        // Handle HF_API_ERROR - immediate fallback
        if (errorMsg.startsWith("HF_API_ERROR:")) {
          console.log("❌ HF API error, trying fallback...");
          break;
        }

        // Any other error - immediate fallback
        console.log(`⚠️ Unexpected error: ${errorMsg}, trying fallback...`);
        break;
      }
    }

    // Fallback to local Python service with 4K quality
    console.log("🔧 Using local fallback service...");
    try {
      const buffer = await huggingFaceClient.fallbackToLocal(imageUrl, prompt, '4k');
      if (!buffer) {
        throw new Error("Local fallback returned no buffer");
      }
      return { buffer, cost: 0, usedFallback: true };
    } catch (fallbackError: any) {
      throw new Error(`Both HF API and local fallback failed: ${fallbackError.message}`);
    }
  }

  /**
   * Upload processed image result to storage
   */
  private async uploadResult(buffer: Buffer, editId: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), "uploads", "ai-edits");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `${editId}.png`;
    const filepath = path.join(uploadsDir, filename);

    await fs.writeFile(filepath, buffer);

    const url = `/uploads/ai-edits/${filename}`;
    console.log(`📁 Uploaded result to ${url}`);

    return url;
  }

  /**
   * Handle processing errors
   */
  private async handleError(editId: string, error: Error): Promise<void> {
    const errorMessage = error.message || "Unknown error";

    try {
      await storage.updateAIEdit(editId, {
        status: "failed",
        errorMessage,
        completedAt: new Date(),
        metadata: {
          errorType: this.getErrorType(errorMessage),
          failedAt: new Date().toISOString(),
        },
      });
    } catch (updateError: any) {
      console.error("Failed to update error status:", updateError.message);
    }
  }

  /**
   * Classify error type for analytics
   */
  private getErrorType(errorMessage: string): string {
    if (errorMessage.includes("quota")) return "QUOTA_EXCEEDED";
    if (errorMessage.includes("RATE_LIMITED")) return "RATE_LIMITED";
    if (errorMessage.includes("MODEL_LOADING")) return "MODEL_LOADING";
    if (errorMessage.includes("HF_API_ERROR")) return "API_ERROR";
    if (errorMessage.includes("fallback")) return "FALLBACK_FAILED";
    return "UNKNOWN_ERROR";
  }

  /**
   * Sleep utility for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current processing status
   */
  getProcessingCount(): number {
    return this.processing.size;
  }

  /**
   * Check if an edit is currently processing
   */
  isProcessing(editId: string): boolean {
    return this.processing.has(editId);
  }
}

// Singleton instance
export const aiEditQueue = new AIEditQueue();
