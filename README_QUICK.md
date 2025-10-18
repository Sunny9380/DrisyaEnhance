# 🚀 Drisya AI - Quick Start

**API-based jewelry enhancement platform like ChatGPT but faster & cheaper!**

## ⚡ Quick Setup

```bash
# 1. Check system status
node quick-setup.js

# 2. Start server
npm run dev

# 3. Open browser
http://localhost:5000

# 4. Login
Email: admin@drisya.app
Password: admin123
```

## 🎯 What You Get

- **⚡ Fast Processing**: 6-10 seconds per image
- **💰 Cost Effective**: $0.02 per image  
- **📦 Bulk Processing**: Up to 10,000 images
- **🎨 Professional Results**: Dark blue velvet backgrounds
- **📡 REST API**: Full programmatic access

## 🔑 Required API Keys

### Stability AI (Required - Working Now)
```bash
# 1. Get key: https://platform.stability.ai/
# 2. Add to .env: STABILITY_API_KEY=sk-your-key
# 3. Test: node simple-resize-enhance.js
```

### OpenAI (Optional - Premium Quality)
```bash
# 1. Get key: https://platform.openai.com/api-keys
# 2. Add credits: https://platform.openai.com/account/billing
# 3. Add to .env: OPENAI_API_KEY=sk-your-key
# 4. Test: node test-openai-developer-mode.js
```

## 📡 API Usage

### Single Image Enhancement
```bash
curl -X POST http://localhost:5000/api/test-enhancement \
     -F "image=@jewelry.jpg" \
     -F "prompt=Dark blue velvet background with luxury lighting"
```

### Bulk Processing
```bash
curl -X POST http://localhost:5000/api/bulk-enhance \
     -F "images=@earring1.jpg" \
     -F "images=@earring2.jpg"
```

### ChatGPT-Style (OpenAI)
```bash
curl -X POST http://localhost:5000/api/openai/simple-enhance \
     -F "image=@jewelry.jpg"
```

## 🧪 Test Your Setup

```bash
# Test Stability AI (should work)
node simple-resize-enhance.js

# Test OpenAI (needs credits)
node test-openai-developer-mode.js

# Test live API
node test-api-live.js

# Setup velvet template
node setup-velvet-template.js
```

## 🎨 Your Velvet Template

**"Dark Blue Velvet Luxury"** - Professional jewelry enhancement with:
- 🔵 Dark blue velvet background
- 💡 Moody directional lighting  
- 🪟 Windowpane shadow patterns
- 💎 Preserved jewelry details
- 📏 1080x1080px output

## 🔧 Troubleshooting

### Server Won't Start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Start XAMPP MySQL
# Open XAMPP Control Panel → Start MySQL

# Install dependencies
npm install

# Start server
npm run dev
```

### API Keys Not Working
```bash
# Stability AI: Check credits at platform.stability.ai
# OpenAI: Add billing at platform.openai.com/account/billing
# Verify .env file has correct keys
```

## 📊 Performance Comparison

| Service | Speed | Quality | Cost | Status |
|---------|-------|---------|------|--------|
| **Stability AI** | 6-10s | ⭐⭐⭐⭐ | $0.02 | ✅ Working |
| **OpenAI DALL-E** | 30-60s | ⭐⭐⭐⭐⭐ | $0.08 | ⚠️ Needs Credits |

## 🎊 Ready to Use!

1. **Start**: `npm run dev`
2. **Open**: http://localhost:5000  
3. **Upload**: Jewelry images
4. **Enhance**: With velvet background
5. **Download**: Professional results

## 📖 Full Documentation

- **Complete Setup**: `COMPLETE_SETUP_GUIDE.md`
- **OpenAI Integration**: `OPENAI_API_GUIDE.md`
- **System Check**: `node quick-setup.js`

**Your API-based jewelry enhancement platform is ready!** 🎨✨
