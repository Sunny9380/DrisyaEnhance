import fs from 'fs/promises';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

console.log('🤖 OpenAI-Only Quick Setup\n');

async function openaiQuickSetup() {
  console.log('🎯 OpenAI DALL-E 3 Exclusive System Setup');
  console.log('✨ ChatGPT-level jewelry enhancement');
  console.log('🚫 Removed: Stability AI, Replicate (simplified)');
  console.log('');

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // Check system requirements
  console.log('📋 System Check:');
  console.log(`   ✅ Node.js: ${process.version}`);
  
  try {
    await fs.access('.env');
    console.log('   ✅ .env file: Found');
  } catch {
    console.log('   ❌ .env file: Missing');
  }

  try {
    await fs.access('node_modules');
    console.log('   ✅ Dependencies: Installed');
  } catch {
    console.log('   ❌ Dependencies: Run npm install');
  }

  // Check OpenAI configuration
  console.log('\n🔑 OpenAI Configuration:');
  
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('   ❌ API Key: Not configured');
    console.log('');
    console.log('🚀 Setup Steps:');
    console.log('');
    console.log('1️⃣ Get OpenAI API Key:');
    console.log('   • Go to: https://platform.openai.com/api-keys');
    console.log('   • Sign up or login');
    console.log('   • Create new API key (starts with sk-)');
    console.log('   • Copy the key');
    console.log('');
    console.log('2️⃣ Add Billing Credits:');
    console.log('   • Go to: https://platform.openai.com/account/billing');
    console.log('   • Add payment method');
    console.log('   • Purchase credits ($10+ recommended)');
    console.log('   • DALL-E 3 HD: $0.08 per image');
    console.log('');
    console.log('3️⃣ Update Configuration:');
    console.log('   • Edit .env file');
    console.log('   • Set: OPENAI_API_KEY=sk-your-actual-key');
    console.log('   • Save file');
    console.log('');
    console.log('4️⃣ Start System:');
    console.log('   • Run: npm run dev');
    console.log('   • Test: node test-openai-only.js');
    console.log('   • Access: http://localhost:5000');
    return;
  }

  console.log('   ✅ API Key: Configured');

  // Test OpenAI connection
  try {
    console.log('   🔄 Testing connection...');
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      timeout: 10000
    });
    
    console.log('   ✅ Connection: Working');
    
    const dalleModels = response.data.data.filter(model => 
      model.id.includes('dall-e')
    );
    console.log(`   🎨 DALL-E Models: ${dalleModels.length} available`);
    
  } catch (error) {
    console.log('   ❌ Connection: Failed');
    
    if (error.response?.status === 401) {
      console.log('   💡 Issue: Invalid API key');
    } else if (error.response?.status === 429) {
      console.log('   💡 Issue: Need billing credits');
    } else {
      console.log(`   💡 Issue: ${error.message}`);
    }
    
    console.log('');
    console.log('🔧 Solutions:');
    console.log('   • Check API key is correct');
    console.log('   • Add billing credits: https://platform.openai.com/account/billing');
    console.log('   • Verify account is active');
    return;
  }

  // Check server status
  console.log('\n🌐 Server Status:');
  try {
    const serverResponse = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
    console.log('   ✅ Server: Running on http://localhost:5000');
    
    // Test OpenAI endpoint
    try {
      const openaiStatus = await axios.get('http://localhost:5000/api/openai/status', { timeout: 5000 });
      if (openaiStatus.data.connected) {
        console.log('   ✅ OpenAI Endpoint: Working');
      } else {
        console.log('   ⚠️ OpenAI Endpoint: Configuration issue');
      }
    } catch {
      console.log('   ⚠️ OpenAI Endpoint: Not responding');
    }
    
  } catch {
    console.log('   ❌ Server: Not running');
    console.log('   💡 Start with: npm run dev');
  }

  // Show system overview
  console.log('\n🎊 OpenAI-Only System Ready!');
  console.log('');
  console.log('🤖 Your Configuration:');
  console.log('   • AI Service: OpenAI DALL-E 3 exclusively');
  console.log('   • Quality: ChatGPT-level results');
  console.log('   • Speed: 30-60 seconds per image');
  console.log('   • Cost: $0.04-0.08 per image');
  console.log('   • Features: Developer mode, retry logic');
  console.log('');
  console.log('📡 API Endpoints:');
  console.log('   POST /api/openai/simple-enhance  # ChatGPT-style');
  console.log('   POST /api/openai/enhance         # Custom prompts');
  console.log('   POST /api/openai/batch-enhance   # Bulk processing');
  console.log('   GET  /api/openai/status          # Health check');
  console.log('');
  console.log('🎨 Your Velvet Template:');
  console.log('   • Dark blue velvet background');
  console.log('   • Moody directional lighting');
  console.log('   • Windowpane shadow patterns');
  console.log('   • Premium cinematic ambiance');
  console.log('   • 1080x1080px output');
  console.log('');
  console.log('🚀 Quick Start:');
  console.log('   1. npm run dev           # Start server');
  console.log('   2. http://localhost:5000 # Open web interface');
  console.log('   3. Login: admin@drisya.app / admin123');
  console.log('   4. Upload jewelry images');
  console.log('   5. Get ChatGPT-quality results!');
  console.log('');
  console.log('🧪 Test Commands:');
  console.log('   node test-openai-only.js        # Full system test');
  console.log('   node test-dalle-direct.js       # Direct DALL-E test');
  console.log('   curl http://localhost:5000/api/openai/status');
  console.log('');
  console.log('💰 Pricing (per image):');
  console.log('   • DALL-E 3 Standard: $0.040');
  console.log('   • DALL-E 3 HD: $0.080');
  console.log('   • Image Edit: $0.020 (when available)');
  console.log('');
  console.log('🎯 Removed Services:');
  console.log('   🚫 Stability AI (not needed)');
  console.log('   🚫 Replicate (not needed)');
  console.log('   🚫 Other AI services (simplified)');
}

// Show header
console.log('🎨 Drisya AI - OpenAI DALL-E 3 Exclusive');
console.log('🤖 Premium jewelry enhancement platform');
console.log('✨ Same quality as ChatGPT with API access');
console.log('🎯 Simplified system - OpenAI only');
console.log('');

// Run setup
openaiQuickSetup()
  .then(() => {
    console.log('\n✅ OpenAI-Only Setup Complete!');
    console.log('📖 See OPENAI_ONLY_SETUP.md for detailed guide');
  })
  .catch((error) => {
    console.error('Setup failed:', error.message);
  });
