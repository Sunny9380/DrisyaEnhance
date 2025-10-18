# 🚀 Complete Setup Guide - Drisya AI Jewelry Enhancement Platform

## 📋 **Overview**

Your **API-based jewelry enhancement platform** provides ChatGPT-style image processing with:
- **Stability AI**: Fast, cost-effective (6-10 seconds, $0.02/image)
- **OpenAI DALL-E**: Premium quality (30-60 seconds, $0.02-0.08/image)
- **Bulk Processing**: Up to 10,000 images at once
- **Web Interface**: User-friendly upload and management
- **REST API**: Programmatic access for developers

---

## 🛠️ **Prerequisites**

### **System Requirements:**
- **Windows 10/11** with XAMPP
- **Node.js 18+** 
- **MySQL** (via XAMPP)
- **Git** (optional)

### **Accounts Needed:**
- **Stability AI Account**: https://platform.stability.ai/ (Required - Working)
- **OpenAI Account**: https://platform.openai.com/ (Optional - Premium)

---

## 📦 **Step 1: Install Dependencies**

### **1.1 Install XAMPP**
```bash
# Download and install XAMPP
https://www.apachefriends.org/download.html

# Start Apache and MySQL services
- Open XAMPP Control Panel
- Start Apache
- Start MySQL
```

### **1.2 Install Node.js**
```bash
# Download and install Node.js 18+
https://nodejs.org/

# Verify installation
node --version
npm --version
```

### **1.3 Install Project Dependencies**
```bash
# Navigate to project directory
cd C:\xampp\htdocs\DrisyaEnhance

# Install dependencies
npm install

# Build the project
npm run build
```

---

## 🗄️ **Step 2: Database Setup**

### **2.1 Create Database**
```sql
-- Open phpMyAdmin: http://localhost/phpmyadmin
-- Create database
CREATE DATABASE drisya;
USE drisya;

-- Import schema (if you have a SQL file)
-- Or let the application create tables automatically
```

### **2.2 Database Configuration**
```bash
# Database URL format
mysql://root:@localhost:3306/drisya

# Default XAMPP MySQL credentials:
# Host: localhost
# Port: 3306
# Username: root
# Password: (empty)
# Database: drisya
```

---

## 🔑 **Step 3: API Keys Configuration**

### **3.1 Get Stability AI API Key (Required)**
```bash
# 1. Go to: https://platform.stability.ai/
# 2. Sign up/Login
# 3. Go to Account → API Keys
# 4. Create new API key
# 5. Copy the key (starts with sk-)
```

### **3.2 Get OpenAI API Key (Optional)**
```bash
# 1. Go to: https://platform.openai.com/api-keys
# 2. Sign up/Login
# 3. Create new API key (starts with sk-)
# 4. Add billing credits: https://platform.openai.com/account/billing
# 5. Minimum $5 recommended for testing
```

### **3.3 Configure Environment Variables**
```bash
# Edit .env file in project root
# Copy from .env.example if needed

# Required - Stability AI (Working)
STABILITY_API_KEY=sk-your-stability-api-key-here

# Optional - OpenAI (Premium)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Database
DATABASE_URL=mysql://root:@localhost:3306/drisya

# Session Secret
SESSION_SECRET=your-random-session-secret-here

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@drisya.app

# Node Environment
NODE_ENV=development
```

---

## 🚀 **Step 4: Start the Application**

### **4.1 Start Services**
```bash
# 1. Start XAMPP services
# - Open XAMPP Control Panel
# - Start Apache
# - Start MySQL

# 2. Start the application
cd C:\xampp\htdocs\DrisyaEnhance
npm run dev

# Server will start on: http://localhost:5000
```

### **4.2 Verify Installation**
```bash
# Test server health
curl http://localhost:5000/api/health

# Test Stability AI status
node test-stability-integration.js

# Test OpenAI status (if configured)
node test-openai-developer-mode.js
```

---

## 👤 **Step 5: Admin Setup**

### **5.1 Access Web Interface**
```bash
# Open browser and go to:
http://localhost:5000

# Default admin credentials:
Email: admin@drisya.app
Password: admin123
```

### **5.2 Create Velvet Template**
```bash
# Run template setup script
node setup-velvet-template.js

# This creates the "Dark Blue Velvet Luxury" template
# with your exact prompt for jewelry enhancement
```

---

## 🧪 **Step 6: Test the System**

### **6.1 Test Web Interface**
```bash
# 1. Login to http://localhost:5000
# 2. Upload a jewelry image
# 3. Select "Dark Blue Velvet Luxury" template
# 4. Click "Enhance"
# 5. Download the enhanced result
```

### **6.2 Test API Endpoints**
```bash
# Single image enhancement (Stability AI)
curl -X POST http://localhost:5000/api/test-enhancement \
     -F "image=@jewelry.jpg" \
     -F "prompt=Your velvet background prompt"

# OpenAI enhancement (if configured)
curl -X POST http://localhost:5000/api/openai/simple-enhance \
     -F "image=@jewelry.jpg"

# Bulk processing
curl -X POST http://localhost:5000/api/bulk-enhance \
     -F "images=@image1.jpg" -F "images=@image2.jpg"
```

### **6.3 Test Scripts**
```bash
# Test Stability AI (should work)
node simple-resize-enhance.js

# Test OpenAI (needs credits)
node test-openai-developer-mode.js

# Test live API
node test-api-live.js
```

---

## 📡 **Step 7: API Documentation**

### **7.1 Available Endpoints**

#### **Stability AI (Production Ready)**
```bash
# Single image enhancement
POST /api/test-enhancement
Content-Type: multipart/form-data
Body:
  - image: File (jewelry image)
  - prompt: String (enhancement description)

# Bulk enhancement
POST /api/bulk-enhance
Content-Type: multipart/form-data
Body:
  - images: File[] (multiple images)
  - templateId: String (template UUID)

# Health check
GET /api/health
```

#### **OpenAI DALL-E (Premium)**
```bash
# ChatGPT-style enhancement
POST /api/openai/simple-enhance
Content-Type: multipart/form-data
Body:
  - image: File (jewelry image)
  - quality: String (standard|hd)

# Advanced enhancement
POST /api/openai/enhance
Content-Type: multipart/form-data
Body:
  - image: File (jewelry image)
  - prompt: String (enhancement description)
  - quality: String (standard|high|ultra)

# Batch processing
POST /api/openai/batch-enhance
Content-Type: multipart/form-data
Body:
  - images: File[] (multiple images)
  - prompt: String (enhancement description)

# API status
GET /api/openai/status
```

### **7.2 Response Format**
```json
{
  "success": true,
  "outputUrl": "/uploads/processed/enhanced_image.png",
  "processingTime": 6500,
  "metadata": {
    "model": "stability-ai",
    "prompt": "Dark blue velvet background...",
    "quality": "high",
    "cost_estimate": 0.02
  }
}
```

---

## 🎨 **Step 8: Your Velvet Template**

### **8.1 Template Details**
```yaml
Name: Dark Blue Velvet Luxury
Category: jewelry
Background: velvet
Lighting: moody
Cost: 2 coins per image
Output: 1080x1080px

Prompt: "A dark, elegant matte blue velvet or suede background 
with soft texture, under moody, directional lighting. Strong 
light beams cast realistic shadows in a criss-cross windowpane 
pattern, creating a dramatic and luxurious ambiance. The scene 
should evoke a sense of evening or indoor light streaming through 
a window, with a focused spotlight on the product area and soft 
shadows to highlight depth and contrast. The environment should 
feel premium, rich, and cinematic. Ensure the earrings design, 
link pattern, clasp details, colors, and background elements 
remain exactly the same with no changes or alterations to 
composition, color, or lighting. make a image size is 1080 X 1080px."
```

### **8.2 Template Features**
- 🔵 **Dark Blue Velvet Background** - Elegant matte texture
- 💡 **Moody Lighting** - Cinematic directional effects
- 🪟 **Windowpane Shadows** - Realistic criss-cross patterns
- 💎 **Product Preservation** - Maintains jewelry details
- 📏 **1080x1080 Output** - Perfect for social media

---

## 🔧 **Step 9: Troubleshooting**

### **9.1 Common Issues**

#### **Server Won't Start**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F

# Restart server
npm run dev
```

#### **Database Connection Failed**
```bash
# Check XAMPP MySQL is running
# Verify database exists: http://localhost/phpmyadmin
# Check .env DATABASE_URL is correct
```

#### **API Key Issues**
```bash
# Stability AI: Check key is valid and has credits
# OpenAI: Ensure billing is set up and credits available
# Verify .env file has correct keys
```

#### **Image Upload Fails**
```bash
# Check file size (max 20MB)
# Verify image format (JPG, PNG, WebP)
# Ensure uploads/ directory exists and is writable
```

### **9.2 Logs and Debugging**
```bash
# View server logs
npm run dev
# Logs appear in console

# Check processing history in web interface
http://localhost:5000 → Processing History

# Test individual components
node test-stability-integration.js
node test-openai-developer-mode.js
```

---

## 📈 **Step 10: Production Deployment**

### **10.1 Environment Setup**
```bash
# Update .env for production
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:port/database

# Build for production
npm run build

# Start production server
npm start
```

### **10.2 Performance Optimization**
```bash
# Enable Redis for session storage (optional)
REDIS_URL=redis://localhost:6379

# Configure rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # Max requests per window

# Set up file cleanup cron job
# Clean processed files older than 24 hours
```

### **10.3 Monitoring**
```bash
# Monitor API usage
GET /api/stats

# Track costs
# Stability AI: ~$0.02 per image
# OpenAI: ~$0.02-0.08 per image

# Set up alerts for high usage
```

---

## 🎯 **Step 11: Usage Examples**

### **11.1 JavaScript/Node.js**
```javascript
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function enhanceJewelry(imagePath) {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(imagePath));
  formData.append('prompt', 'Dark blue velvet background with luxury lighting');

  const response = await axios.post(
    'http://localhost:5000/api/test-enhancement',
    formData,
    { headers: formData.getHeaders() }
  );

  return response.data.outputUrl;
}
```

### **11.2 Python**
```python
import requests

def enhance_jewelry(image_path):
    with open(image_path, 'rb') as f:
        files = {'image': f}
        data = {'prompt': 'Dark blue velvet background with luxury lighting'}
        
        response = requests.post(
            'http://localhost:5000/api/test-enhancement',
            files=files,
            data=data
        )
        
    return response.json()['outputUrl']
```

### **11.3 cURL**
```bash
# Single image
curl -X POST http://localhost:5000/api/test-enhancement \
     -F "image=@earrings.jpg" \
     -F "prompt=Dark blue velvet background with luxury lighting"

# Bulk processing
curl -X POST http://localhost:5000/api/bulk-enhance \
     -F "images=@earring1.jpg" \
     -F "images=@earring2.jpg" \
     -F "templateId=ec8090cd-ab80-11f0-98e0-345a6016da38"
```

---

## 🎊 **Congratulations!**

Your **API-based jewelry enhancement platform** is now fully set up and ready for production!

### **🚀 What You Have:**
- ✅ **Fast Processing**: 6-10 seconds per image
- ✅ **Cost Effective**: $0.02 per image with Stability AI
- ✅ **Bulk Processing**: Up to 10,000 images at once
- ✅ **Premium Option**: OpenAI DALL-E for highest quality
- ✅ **Web Interface**: User-friendly management
- ✅ **REST API**: Full programmatic access
- ✅ **Production Ready**: Error handling, retry logic, monitoring

### **🎯 Next Steps:**
1. **Start Processing**: Upload jewelry images and see the magic!
2. **Scale Up**: Process thousands of images for e-commerce catalogs
3. **Integrate**: Use the API in your existing applications
4. **Monetize**: Offer jewelry enhancement as a service

**Your system is ready to compete with ChatGPT!** 🎨✨

---

## 📞 **Support**

### **Quick Commands:**
```bash
# Start everything
npm run dev

# Test Stability AI
node simple-resize-enhance.js

# Test OpenAI (needs credits)
node test-openai-developer-mode.js

# Access web interface
http://localhost:5000
```

### **File Locations:**
- **Main App**: `http://localhost:5000`
- **Database**: `http://localhost/phpmyadmin`
- **Logs**: Console output from `npm run dev`
- **Uploads**: `./uploads/` directory
- **Config**: `.env` file

**Happy enhancing!** 🚀
