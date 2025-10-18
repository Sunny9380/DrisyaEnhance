import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const VELVET_PROMPT = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the earrings design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. make a image size is 1080 X 1080px.`;

async function setupVelvetTemplate() {
  console.log('🎨 Setting up Dark Blue Velvet Luxury Template...\n');

  // Create database connection
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'drisya',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    // Check if template already exists
    const [existingTemplates] = await pool.execute(
      'SELECT * FROM templates WHERE name = ?',
      ['Dark Blue Velvet Luxury']
    );

    if (existingTemplates.length > 0) {
      console.log('✅ Template already exists, updating...');
      
      // Update existing template
      await pool.execute(`
        UPDATE templates SET
          description = ?,
          settings = ?,
          coin_cost = 2,
          is_active = true
        WHERE name = ?
      `, [
        'Premium velvet background with moody lighting for luxury jewelry photography',
        JSON.stringify({
          diffusionPrompt: VELVET_PROMPT,
          shadowIntensity: 0.7,
          vignetteStrength: 0.3,
          colorGrading: 'cinematic',
          gradientColors: ['#1a237e', '#283593'],
          outputSize: '1080x1080'
        }),
        'Dark Blue Velvet Luxury'
      ]);
      
      console.log('✅ Template updated successfully!');
    } else {
      console.log('📝 Creating new template...');
      
      // Create new template
      await pool.execute(`
        INSERT INTO templates (
          name, category, background_style, lighting_preset, description,
          settings, is_premium, is_active, coin_cost, price_per_image,
          features, benefits, use_cases, why_buy
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Dark Blue Velvet Luxury',
        'jewelry',
        'velvet',
        'moody',
        'Premium velvet background with moody lighting for luxury jewelry photography',
        JSON.stringify({
          diffusionPrompt: VELVET_PROMPT,
          shadowIntensity: 0.7,
          vignetteStrength: 0.3,
          colorGrading: 'cinematic',
          gradientColors: ['#1a237e', '#283593'],
          outputSize: '1080x1080'
        }),
        false, // is_premium
        true,  // is_active
        2,     // coin_cost
        2,     // price_per_image
        JSON.stringify([
          { title: 'Dark Blue Velvet Background', description: 'Elegant matte velvet texture', icon: 'palette' },
          { title: 'Windowpane Shadows', description: 'Realistic criss-cross shadow patterns', icon: 'grid' },
          { title: 'Moody Lighting', description: 'Cinematic directional lighting', icon: 'lightbulb' },
          { title: 'Product Preservation', description: 'Maintains exact jewelry details', icon: 'shield' }
        ]),
        JSON.stringify([
          'Professional luxury appearance',
          'Perfect for e-commerce listings',
          'Social media ready',
          'Consistent branding'
        ]),
        JSON.stringify([
          { title: 'Jewelry Photography', description: 'Earrings, necklaces, rings', imageUrl: null },
          { title: 'E-commerce Listings', description: 'Professional product photos', imageUrl: null },
          { title: 'Social Media', description: 'Instagram-ready content', imageUrl: null }
        ]),
        'Transform your jewelry photos into luxury masterpieces with our signature velvet background and cinematic lighting.'
      ]);
      
      console.log('✅ Template created successfully!');
    }

    // Get the template ID for reference
    const [template] = await pool.execute(
      'SELECT id FROM templates WHERE name = ?',
      ['Dark Blue Velvet Luxury']
    );

    console.log(`📋 Template ID: ${template[0].id}`);
    console.log('🎯 Template Features:');
    console.log('   - Uses your Stability AI API key');
    console.log('   - Applies your exact velvet prompt');
    console.log('   - Costs 2 coins per image');
    console.log('   - Outputs 1080x1080px images');
    console.log('   - Shows results in Processing History');

    // Close the connection
    await pool.end();
    return template[0].id;

  } catch (error) {
    console.error('❌ Failed to setup template:', error);
    await pool.end();
    throw error;
  }
}

// Run the setup
setupVelvetTemplate()
  .then((templateId) => {
    console.log(`\n🎉 Template setup complete! Template ID: ${templateId}`);
    console.log('\n📋 Next steps:');
    console.log('1. Start your server: npm run dev');
    console.log('2. Login as admin: admin@drisya.app / admin123');
    console.log('3. Upload jewelry images');
    console.log('4. Select "Dark Blue Velvet Luxury" template');
    console.log('5. Watch AI enhancement with Stability AI!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
