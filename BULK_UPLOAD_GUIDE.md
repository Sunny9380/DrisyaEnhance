# Bulk Image Upload & AI Enhancement System

## Overview

The Drisya platform now supports bulk image upload functionality that allows users to upload up to **10,000 images** at once for AI-powered enhancement with blur detection and custom templates.

## Features

### 🚀 **Bulk Upload Capabilities**
- **Maximum Images**: Up to 10,000 images per batch
- **Supported Formats**: JPG, JPEG, PNG, WebP, GIF, BMP, TIFF
- **File Size Limit**: 50MB per image
- **Drag & Drop Interface**: Easy file selection with progress tracking

### 🤖 **AI Enhancement**
- **Blur Detection**: Automatically detects blurred images
- **Custom Prompts**: Use your own enhancement prompts or template defaults
- **Quality Levels**: Standard (2x), High (3x), Ultra (5x) coin multipliers
- **Multiple AI Services**: Replicate, Stability AI with fallback processing

### 📊 **Progress Tracking**
- **Real-time Progress**: Live updates during processing
- **Batch Status**: Track completed, failed, and pending images
- **ETA Calculation**: Estimated time remaining
- **Download Ready**: ZIP file generation when complete

## API Endpoints

### 1. Bulk Upload
```http
POST /api/jobs/bulk-upload
Content-Type: multipart/form-data

Parameters:
- images: File[] (up to 10,000 files)
- templateId: string (required)
- enhancementPrompt: string (optional)
- quality: "standard" | "high" | "ultra" (default: "standard")
- enableBlurDetection: boolean (default: true)
```

**Example Response:**
```json
{
  "job": {
    "id": "job-uuid",
    "status": "queued",
    "totalImages": 1500,
    "coinsUsed": 3000
  },
  "message": "Bulk upload started. Processing 1500 images with AI enhancement.",
  "estimatedTime": "150 minutes"
}
```

### 2. Progress Tracking
```http
GET /api/jobs/bulk/{jobId}/progress
```

**Example Response:**
```json
{
  "progress": {
    "jobId": "job-uuid",
    "status": "processing",
    "totalImages": 1500,
    "completedImages": 450,
    "failedImages": 5,
    "processingImages": 10,
    "pendingImages": 1035,
    "progressPercentage": 30,
    "estimatedTimeRemaining": "105 minutes",
    "zipUrl": null
  }
}
```

### 3. Download Results
```http
GET /api/jobs/{jobId}/download
```

Returns a ZIP file containing all enhanced images.

## Usage Example

### Frontend Implementation

```typescript
// Upload 1000 images with custom prompt
const formData = new FormData();

// Add all selected files
files.forEach(file => formData.append('images', file));

// Configuration
formData.append('templateId', 'dark-blue-velvet-luxury');
formData.append('quality', 'high');
formData.append('enableBlurDetection', 'true');
formData.append('enhancementPrompt', 
  'A dark, elegant matte blue velvet background with moody lighting...'
);

// Upload
const response = await fetch('/api/jobs/bulk-upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(`Job ${result.job.id} started with ${result.job.totalImages} images`);
```

### Progress Polling

```typescript
async function pollProgress(jobId: string) {
  const response = await fetch(`/api/jobs/bulk/${jobId}/progress`);
  const result = await response.json();
  
  console.log(`Progress: ${result.progress.progressPercentage}%`);
  
  if (result.progress.status === 'processing') {
    setTimeout(() => pollProgress(jobId), 2000);
  } else if (result.progress.status === 'completed') {
    console.log('Download ready:', result.progress.zipUrl);
  }
}
```

## AI Enhancement Prompts

### Default Template Prompt
```
A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the product design, colors, and composition remain exactly the same with no changes or alterations. Output size 1080x1080px.
```

### Blur Enhancement
When blur detection is enabled, the system automatically adds:
```
Remove blur and enhance image clarity. Sharpen details and improve focus.
```

### Quality Modifiers
- **Standard**: Standard quality output with good detail preservation
- **High**: High quality output with enhanced details and vibrant colors  
- **Ultra**: Ultra high quality output with maximum detail enhancement, perfect lighting, and professional finish

## Configuration

### Environment Variables

```bash
# AI Service Configuration
REPLICATE_API_TOKEN=your_replicate_token
STABILITY_API_KEY=your_stability_key
AI_API_URL=https://api.replicate.com/v1

# Application Settings
APP_URL=http://localhost:5000
NODE_ENV=development
```

### Coin Costs

| Quality | Multiplier | Example Cost (2 coin template) |
|---------|------------|--------------------------------|
| Standard | 2x | 2 coins per image |
| High | 3x | 3 coins per image |
| Ultra | 5x | 5 coins per image |

**Example**: 1000 images × 2 coins × 3 (high quality) = **6000 coins**

## Processing Architecture

### 1. Upload Phase
- Files uploaded to `/uploads/bulk/` directory
- Database records created for job and individual images
- Coins deducted atomically
- Monthly quota checked and updated

### 2. Processing Phase
- Images processed in batches of 10 for stability
- AI enhancement with blur detection
- Progress updates every batch
- Fallback processing if AI fails

### 3. Completion Phase
- ZIP file creation with all enhanced images
- Job status updated to "completed"
- Email notification sent (if enabled)
- Temporary files cleaned up

## Error Handling

### Common Errors
- **Insufficient Coins**: User doesn't have enough coins for the batch
- **Quota Exceeded**: Monthly image limit reached
- **File Too Large**: Individual file exceeds 50MB limit
- **Invalid Format**: Unsupported file type
- **AI Service Failure**: Falls back to basic processing

### Retry Logic
- Failed images are marked individually
- Users can retry failed images separately
- AI services have automatic fallback chains

## Performance Considerations

### Batch Processing
- **Upload Batches**: 100 images per database batch
- **Processing Batches**: 10 images processed simultaneously
- **Rate Limiting**: 1-second delays between AI service calls
- **Memory Management**: Files processed and cleaned incrementally

### Scalability
- Supports up to 10,000 images per job
- Estimated processing: ~10 images per minute
- Large batches: 1000 images ≈ 100 minutes
- Background processing doesn't block user interface

## Installation & Setup

### 1. Install Dependencies
```bash
npm install react-dropzone form-data
```

### 2. Create Upload Directories
```bash
mkdir -p uploads/bulk uploads/processed
```

### 3. Configure AI Services
Set up API keys for Replicate and/or Stability AI in your `.env` file.

### 4. Add Frontend Component
```typescript
import BulkUpload from './components/BulkUpload';

// In your page component
<BulkUpload templates={templates} />
```

## Security Features

### Authentication & Authorization
- User authentication required for all endpoints
- Coin balance verification before processing
- Monthly quota enforcement
- Audit logging for all bulk operations

### File Validation
- MIME type checking
- File size limits
- Extension validation
- Malicious file detection

### Rate Limiting
- Maximum 10,000 images per batch
- Processing rate limits to prevent abuse
- API key rotation support

## Monitoring & Analytics

### Audit Logs
All bulk operations are logged with:
- User ID and IP address
- Image count and total size
- Template and quality settings
- Processing time and results

### Usage Tracking
- Monthly quota consumption
- Coin usage patterns
- Popular templates and settings
- Success/failure rates

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file formats and sizes
   - Verify coin balance
   - Check monthly quota

2. **Processing Stalls**
   - Check AI service API keys
   - Monitor server resources
   - Review error logs

3. **Download Issues**
   - Ensure job is completed
   - Check ZIP file generation
   - Verify file permissions

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` in your environment.

## Future Enhancements

- **Real-time WebSocket Updates**: Live progress without polling
- **Advanced Blur Detection**: Computer vision-based blur analysis  
- **Custom AI Models**: User-uploaded model support
- **Batch Templates**: Apply different templates to image subsets
- **Cloud Storage**: Direct upload to AWS S3/Google Cloud
- **API Rate Limiting**: Advanced throttling and queuing
