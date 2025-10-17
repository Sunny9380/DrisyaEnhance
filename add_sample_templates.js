import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

async function addSampleTemplates() {
  let connection;
  
  try {
    // Connect to MySQL database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'drisya'
    });

    console.log('Connected to MySQL database');

    // Sample templates to add
    const sampleTemplates = [
      {
        id: uuidv4(),
        name: 'Dark Blue Velvet Luxury',
        category: 'jewelry',
        backgroundStyle: 'velvet',
        lightingPreset: 'moody',
        description: 'Transform background to dark elegant matte blue velvet texture with soft luxury feel.',
        coinCost: 2,
        pricePerImage: null,
        isPremium: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Minimal White Studio',
        category: 'fashion',
        backgroundStyle: 'minimal',
        lightingPreset: 'studio',
        description: 'Clean white background with professional studio lighting for fashion photography.',
        coinCost: 1,
        pricePerImage: null,
        isPremium: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Golden Gradient Luxury',
        category: 'jewelry',
        backgroundStyle: 'gradient',
        lightingPreset: 'soft-glow',
        description: 'Elegant golden gradient background with soft glow lighting for premium jewelry.',
        coinCost: 3,
        pricePerImage: 50,
        isPremium: true,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Marble Elegance',
        category: 'beauty',
        backgroundStyle: 'marble',
        lightingPreset: 'natural',
        description: 'Sophisticated marble background with natural lighting for beauty products.',
        coinCost: 2,
        pricePerImage: null,
        isPremium: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert sample templates
    for (const template of sampleTemplates) {
      await connection.execute(
        `INSERT INTO templates (
          id, name, category, background_style, lighting_preset, description,
          coin_cost, price_per_image, is_premium, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          category = VALUES(category),
          updated_at = VALUES(updated_at)`,
        [
          template.id,
          template.name,
          template.category,
          template.backgroundStyle,
          template.lightingPreset,
          template.description,
          template.coinCost,
          template.pricePerImage,
          template.isPremium,
          template.isActive,
          template.createdAt,
          template.updatedAt
        ]
      );
      
      console.log(`✅ Added template: ${template.name}`);
    }

    // Show all templates
    const [allTemplates] = await connection.execute(
      'SELECT id, name, category, background_style, lighting_preset, coin_cost, is_active FROM templates ORDER BY created_at DESC'
    );
    
    console.log('\n📋 All templates in database:');
    allTemplates.forEach((template, index) => {
      const status = template.is_active ? '🟢 Active' : '🔴 Inactive';
      console.log(`${index + 1}. ${template.name} (${template.category}) - ${template.coin_cost} coins - ${status}`);
    });

    console.log('\n🎉 Sample templates added successfully!');
    console.log('You can now test the Template Management CRUD operations in the admin panel.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

// Run the script
addSampleTemplates();
