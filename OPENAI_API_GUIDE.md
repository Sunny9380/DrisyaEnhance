# OpenAI DALL-E API Integration Guide

## 🤖 **ChatGPT/DALL-E API-Based Image Enhancement**

Your Drisya platform now supports **OpenAI DALL-E 3** for professional jewelry image enhancement, providing the same quality as ChatGPT's image generation capabilities.

## 🔑 **Setup OpenAI API Key**

### 1. **Get OpenAI API Key**
- Go to: https://platform.openai.com/api-keys
- Sign up or login to OpenAI
- Create a new API key (starts with `sk-`)
- **Important**: Add credits to your account (DALL-E requires paid usage)

### 2. **Update Environment Variables**
```bash
# Add to your .env file
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

### 3. **Pricing Information**
- **DALL-E 3 Standard**: $0.040 per image (1024×1024)
- **DALL-E 3 HD**: $0.080 per image (1024×1024)
- **Higher quality** than Stability AI
- **Slower processing** but better results

## 🚀 **API Endpoints**

### **1. Simple Enhancement (ChatGPT-style)**
```http
POST /api/openai/simple-enhance
Content-Type: multipart/form-data

Parameters:
- image: File (required) - Jewelry image to enhance
- prompt: String (optional) - Enhancement prompt (uses velvet default)
- quality: String (optional) - "standard" or "hd" (default: "hd")
```

**Example Response:**
```json
{
  "success": true,
  "message": "Image enhanced successfully with DALL-E 3",
  "outputUrl": "/uploads/processed/chatgpt_style_1698765432.png",
  "processingTime": 45000,
  "model": "dall-e-3",
  "quality": "hd"
}
```

### **2. Single Image Enhancement**
```http
POST /api/openai/enhance
Content-Type: multipart/form-data

Parameters:
- image: File (required)
- prompt: String (required) - Your velvet background prompt
- quality: String (optional) - "standard", "high", or "ultra"
```

### **3. Batch Enhancement**
```http
POST /api/openai/batch-enhance
Content-Type: multipart/form-data

Parameters:
- images: File[] (required) - Multiple jewelry images
- prompt: String (required) - Enhancement prompt
- quality: String (optional) - Quality level
```

### **4. API Status Check**
```http
GET /api/openai/status
```

**Response:**
```json
{
  "configured": true,
  "connected": true,
  "models": ["dall-e-3", "dall-e-2"],
  "status": "Ready for image enhancement"
}
```

## 🎨 **Your Velvet Background Prompt**

The system uses your exact prompt by default:

```
A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the earrings design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. make a image size is 1080 X 1080px.
```

## 📱 **Frontend Integration**

### **JavaScript Example**
```javascript
// Simple ChatGPT-style enhancement
async function enhanceWithOpenAI(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('quality', 'hd');

  const response = await fetch('/api/openai/simple-enhance', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Enhanced image:', result.outputUrl);
    return result.outputUrl;
  } else {
    console.error('Enhancement failed:', result.error);
  }
}

// Usage
const fileInput = document.getElementById('imageInput');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const enhancedUrl = await enhanceWithOpenAI(file);
    // Display enhanced image
  }
});
```

### **React Component Example**
```tsx
import React, { useState } from 'react';

function OpenAIEnhancer() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleEnhance = async () => {
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('/api/openai/simple-enhance', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.outputUrl);
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleEnhance} disabled={!file || loading}>
        {loading ? 'Enhancing...' : 'Enhance with DALL-E 3'}
      </button>
      {result && <img src={result} alt="Enhanced" />}
    </div>
  );
}
```

## 🧪 **Testing Your Integration**

### **1. Test API Connection**
```bash
node test-openai-integration.js
```

### **2. Test via cURL**
```bash
# Test simple enhancement
curl -X POST http://localhost:5000/api/openai/simple-enhance \
     -F "image=@your-jewelry.jpg" \
     -F "quality=hd"

# Check API status
curl http://localhost:5000/api/openai/status
```

### **3. Test in Browser**
1. Start your server: `npm run dev`
2. Go to: `http://localhost:5000`
3. Use the upload interface with OpenAI enhancement

## ⚡ **Performance Comparison**

| Service | Speed | Quality | Cost | Best For |
|---------|-------|---------|------|----------|
| **OpenAI DALL-E 3** | 30-60s | ⭐⭐⭐⭐⭐ | $0.04-0.08 | Highest quality |
| **Stability AI** | 6-10s | ⭐⭐⭐⭐ | $0.01-0.02 | Speed & cost |
| **Replicate** | 10-30s | ⭐⭐⭐⭐ | $0.02-0.05 | Flexibility |

## 🔧 **Error Handling**

### **Common Errors**
```json
{
  "success": false,
  "error": "OpenAI API key not configured"
}

{
  "success": false,
  "error": "Insufficient credits in OpenAI account"
}

{
  "success": false,
  "error": "Rate limit exceeded"
}
```

### **Rate Limits**
- **DALL-E 3**: 5 requests per minute
- **Batch processing**: Automatic 3-second delays
- **Recommended**: Process images sequentially

## 🎯 **Production Deployment**

### **1. Environment Setup**
```bash
# Production .env
OPENAI_API_KEY=sk-your-production-key
NODE_ENV=production
```

### **2. Scaling Considerations**
- **Queue System**: Implement Redis queue for batch processing
- **Caching**: Cache results to avoid re-processing
- **Monitoring**: Track API usage and costs
- **Fallback**: Use Stability AI as backup service

### **3. Cost Management**
```javascript
// Track usage
const usage = {
  daily_limit: 100,
  current_usage: 0,
  cost_per_image: 0.08
};

// Before processing
if (usage.current_usage >= usage.daily_limit) {
  throw new Error('Daily limit reached');
}
```

## 🚀 **Your Complete API System**

You now have **three AI services** integrated:

1. **🤖 OpenAI DALL-E 3** - Highest quality, ChatGPT-level results
2. **🎨 Stability AI** - Fast, cost-effective, reliable
3. **🔄 Replicate** - Flexible, multiple models

### **Smart Routing Strategy**
```javascript
async function smartEnhancement(image, prompt, priority) {
  switch (priority) {
    case 'premium':
      return await openaiImageEnhancer.enhanceImage(...);
    case 'fast':
      return await aiImageEnhancer.enhanceImage(...); // Stability AI
    case 'bulk':
      return await replicateEnhancer.enhanceImage(...);
  }
}
```

**Your API-based jewelry enhancement platform is ready for production!** 🎊✨
