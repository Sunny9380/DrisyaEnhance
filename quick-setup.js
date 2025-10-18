import fs from 'fs/promises';
import { execSync } from 'child_process';
import axios from 'axios';

console.log('🚀 Drisya AI Platform - Quick Setup\n');

async function quickSetup() {
  console.log('📋 Checking system requirements...');
  
  try {
    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`✅ Node.js: ${nodeVersion}`);
    
    if (parseInt(nodeVersion.slice(1)) < 18) {
      console.log('⚠️ Node.js 18+ recommended');
    }

    // Check if .env exists
    console.log('\n🔧 Checking configuration...');
    try {
      await fs.access('.env');
      console.log('✅ .env file exists');
    } catch {
      console.log('⚠️ Creating .env file from template...');
      try {
        const envExample = await fs.readFile('.env.example', 'utf8');
        await fs.writeFile('.env', envExample);
        console.log('✅ .env file created');
      } catch {
        console.log('❌ Could not create .env file');
      }
    }

    // Check dependencies
    console.log('\n📦 Checking dependencies...');
    try {
      await fs.access('node_modules');
      console.log('✅ Dependencies installed');
    } catch {
      console.log('⚠️ Installing dependencies...');
      try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed');
      } catch (error) {
        console.log('❌ Failed to install dependencies');
        console.log('💡 Run manually: npm install');
      }
    }

    // Check if server is running
    console.log('\n🌐 Checking server status...');
    try {
      const response = await axios.get('http://localhost:5000/api/health', { timeout: 3000 });
      console.log('✅ Server is running');
      console.log(`📡 Server URL: http://localhost:5000`);
    } catch {
      console.log('⚠️ Server not running');
      console.log('💡 Start with: npm run dev');
    }

    // Check database connection
    console.log('\n🗄️ Checking database...');
    try {
      const response = await axios.get('http://localhost/phpmyadmin', { timeout: 3000 });
      console.log('✅ phpMyAdmin accessible');
      console.log('📊 Database URL: http://localhost/phpmyadmin');
    } catch {
      console.log('⚠️ XAMPP MySQL not running');
      console.log('💡 Start XAMPP and enable MySQL');
    }

    // Check API keys
    console.log('\n🔑 Checking API configuration...');
    
    const stabilityKey = process.env.STABILITY_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (stabilityKey && stabilityKey !== 'sk-your-stability-api-key-here') {
      console.log('✅ Stability AI key configured');
      
      // Test Stability AI connection
      try {
        const response = await axios.get('https://api.stability.ai/v1/user/account', {
          headers: { 'Authorization': `Bearer ${stabilityKey}` },
          timeout: 10000
        });
        console.log('✅ Stability AI connected');
        console.log(`📊 Account: ${response.data.email || 'Valid'}`);
      } catch {
        console.log('⚠️ Stability AI connection failed');
        console.log('💡 Check API key and credits');
      }
    } else {
      console.log('❌ Stability AI key not configured');
      console.log('💡 Get key: https://platform.stability.ai/');
    }

    if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
      console.log('✅ OpenAI key configured');
      
      // Test OpenAI connection
      try {
        const response = await axios.get('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${openaiKey}` },
          timeout: 10000
        });
        console.log('✅ OpenAI connected');
        console.log('📊 DALL-E models available');
      } catch {
        console.log('⚠️ OpenAI connection failed');
        console.log('💡 Check API key and billing');
      }
    } else {
      console.log('⚠️ OpenAI key not configured (optional)');
      console.log('💡 Get key: https://platform.openai.com/api-keys');
    }

    // Check template setup
    console.log('\n🎨 Checking templates...');
    try {
      const response = await axios.get('http://localhost:5000/api/templates', { timeout: 5000 });
      const templates = response.data;
      
      const velvetTemplate = templates.find(t => t.name === 'Dark Blue Velvet Luxury');
      if (velvetTemplate) {
        console.log('✅ Velvet template configured');
        console.log(`📋 Template ID: ${velvetTemplate.id}`);
      } else {
        console.log('⚠️ Velvet template not found');
        console.log('💡 Run: node setup-velvet-template.js');
      }
    } catch {
      console.log('⚠️ Could not check templates (server may be down)');
    }

    // Show setup summary
    console.log('\n📊 Setup Summary:');
    console.log('');
    console.log('🎯 System Status:');
    console.log('   📁 Project: Drisya AI Jewelry Enhancement');
    console.log('   📍 Location: C:\\xampp\\htdocs\\DrisyaEnhance');
    console.log('   🌐 Web URL: http://localhost:5000');
    console.log('   🗄️ Database: http://localhost/phpmyadmin');
    console.log('');
    console.log('🔑 API Keys:');
    console.log(`   🎨 Stability AI: ${stabilityKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   🤖 OpenAI: ${openaiKey ? '✅ Configured' : '⚠️ Optional'}`);
    console.log('');
    console.log('🚀 Quick Start Commands:');
    console.log('   npm run dev          # Start development server');
    console.log('   npm run build        # Build for production');
    console.log('   node setup-velvet-template.js  # Setup template');
    console.log('');
    console.log('🧪 Test Commands:');
    console.log('   node simple-resize-enhance.js     # Test Stability AI');
    console.log('   node test-openai-developer-mode.js # Test OpenAI');
    console.log('   node test-api-live.js             # Test live API');
    console.log('');
    console.log('📡 API Endpoints:');
    console.log('   POST /api/test-enhancement        # Single image (Stability)');
    console.log('   POST /api/bulk-enhance           # Batch processing');
    console.log('   POST /api/openai/simple-enhance  # ChatGPT-style (OpenAI)');
    console.log('   GET  /api/health                 # Health check');
    console.log('');
    console.log('👤 Default Login:');
    console.log('   Email: admin@drisya.app');
    console.log('   Password: admin123');
    console.log('');

    // Next steps
    if (!stabilityKey || stabilityKey === 'sk-your-stability-api-key-here') {
      console.log('🔧 Next Steps:');
      console.log('1. Get Stability AI key: https://platform.stability.ai/');
      console.log('2. Update .env file: STABILITY_API_KEY=sk-your-key');
      console.log('3. Restart server: npm run dev');
      console.log('4. Test: node simple-resize-enhance.js');
    } else {
      console.log('🎊 Ready to Use:');
      console.log('1. Start server: npm run dev');
      console.log('2. Open browser: http://localhost:5000');
      console.log('3. Login with admin credentials');
      console.log('4. Upload jewelry images and enhance!');
    }

  } catch (error) {
    console.log('\n❌ Setup check failed:', error.message);
    console.log('\n💡 Manual setup steps:');
    console.log('1. Install Node.js 18+');
    console.log('2. Install XAMPP and start MySQL');
    console.log('3. Run: npm install');
    console.log('4. Configure .env file');
    console.log('5. Run: npm run dev');
  }
}

// Show header
console.log('🎨 Drisya AI - Jewelry Enhancement Platform');
console.log('📋 API-based system like ChatGPT but faster & cheaper');
console.log('⚡ Stability AI: 6-10s, $0.02/image');
console.log('🤖 OpenAI DALL-E: 30-60s, $0.08/image (optional)');
console.log('📦 Bulk processing: Up to 10,000 images');
console.log('');

// Run setup check
quickSetup()
  .then(() => {
    console.log('\n✅ Setup check complete!');
    console.log('📖 See COMPLETE_SETUP_GUIDE.md for detailed instructions');
  })
  .catch((error) => {
    console.error('Setup check failed:', error.message);
  });
