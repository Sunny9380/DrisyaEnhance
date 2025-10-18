import { storage } from "../storage";
import { promises as fs } from "fs";
import path from "path";

interface RetryConfig {
  maxAttempts: number;
  currentAttempt: number;
  waitTime?: number;
}

export class AIEditQueue {
  private processing = new Set<string>();
  private maxConcurrent = 20; // Process up to 20 images simultaneously

  /**
   * Process multiple edits in parallel for high-speed batch processing
   */
  async processBatch(editIds: string[]): Promise<{ completed: number; failed: number; total: number }> {
    const results = {
      completed: 0,
      failed: 0,
      total: editIds.length
    };

    console.log(`🚀 Starting batch processing of ${editIds.length} images with ${this.maxConcurrent} concurrent workers`);

    // Process in chunks of maxConcurrent
    for (let i = 0; i < editIds.length; i += this.maxConcurrent) {
      const chunk = editIds.slice(i, i + this.maxConcurrent);
      
      // Process chunk in parallel
      const chunkResults = await Promise.allSettled(
        chunk.map(editId => this.processEdit(editId))
      );

      // Count successes and failures
      chunkResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.completed++;
        } else {
          results.failed++;
        }
      });

      console.log(`📊 Batch progress: ${results.completed + results.failed}/${results.total} images processed`);
    }

    console.log(`✅ Batch complete: ${results.completed} succeeded, ${results.failed} failed out of ${results.total}`);
    return results;
  }

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

      // 5. Call GPT-Image-1 processing (placeholder - integrate with your GPT-Image-1 scripts)
      const result = await this.processWithGPTImage1(absoluteImageUrl, edit.prompt, edit.aiModel, edit.quality || '4k');

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
   * Process image with GPT-Image-1 (placeholder for integration)
   */
  private async processWithGPTImage1(
    imageUrl: string,
    prompt: string,
    modelKey: string = "gpt-image-1",
    quality: string = "4k"
  ): Promise<{ buffer: Buffer; cost: number; usedFallback: boolean }> {
    // TODO: Integrate with your GPT-Image-1 scripts
    // This is a placeholder - you should integrate with your working GPT-Image-1 scripts:
    // - gpt-image-1-edit-earrings.js
    // - gpt-image-1-generate-earrings.js
    
    console.log(`🎨 GPT-Image-1 processing: ${imageUrl}`);
    console.log(`📝 Prompt: ${prompt}`);
    console.log(`🤖 Model: ${modelKey}`);
    
    // For now, throw an error to indicate this needs implementation
    throw new Error("GPT-Image-1 integration not yet implemented. Use your command-line scripts for now.");
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
