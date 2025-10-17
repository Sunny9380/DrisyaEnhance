import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

async function addSampleCoinPackages() {
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

    // Sample coin packages with WhatsApp numbers
    const samplePackages = [
      {
        id: uuidv4(),
        name: 'Starter Pack',
        coinAmount: 50,
        priceInINR: 99,
        discount: 0,
        description: 'Perfect for trying out our AI image enhancement',
        whatsappNumber: '+91 98765 43210',
        isActive: true,
        displayOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Popular Pack',
        coinAmount: 200,
        priceInINR: 349,
        discount: 15,
        description: 'Most popular choice for small businesses',
        whatsappNumber: '+91 98765 43211',
        isActive: true,
        displayOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Professional Pack',
        coinAmount: 500,
        priceInINR: 799,
        discount: 20,
        description: 'Best value for professional photographers',
        whatsappNumber: '+91 98765 43212',
        isActive: true,
        displayOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Enterprise Pack',
        coinAmount: 1000,
        priceInINR: 1499,
        discount: 25,
        description: 'Bulk package for agencies and large businesses',
        whatsappNumber: '+91 98765 43213',
        isActive: true,
        displayOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Premium Pack',
        coinAmount: 2000,
        priceInINR: 2799,
        discount: 30,
        description: 'Ultimate package with maximum savings',
        whatsappNumber: '+91 98765 43214',
        isActive: false, // Inactive for testing
        displayOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert sample packages
    for (const pkg of samplePackages) {
      await connection.execute(
        `INSERT INTO coin_packages (
          id, name, coin_amount, price_in_inr, discount, description,
          whatsapp_number, is_active, display_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          coin_amount = VALUES(coin_amount),
          price_in_inr = VALUES(price_in_inr),
          updated_at = VALUES(updated_at)`,
        [
          pkg.id,
          pkg.name,
          pkg.coinAmount,
          pkg.priceInINR,
          pkg.discount,
          pkg.description,
          pkg.whatsappNumber,
          pkg.isActive,
          pkg.displayOrder,
          pkg.createdAt,
          pkg.updatedAt
        ]
      );
      
      console.log(`✅ Added package: ${pkg.name} - ${pkg.coinAmount} coins for ₹${pkg.priceInINR}`);
    }

    // Show all packages
    const [allPackages] = await connection.execute(
      'SELECT id, name, coin_amount, price_in_inr, discount, whatsapp_number, is_active FROM coin_packages ORDER BY display_order'
    );
    
    console.log('\n📋 All coin packages in database:');
    allPackages.forEach((pkg, index) => {
      const status = pkg.is_active ? '🟢 Active' : '🔴 Inactive';
      const discount = pkg.discount > 0 ? ` (${pkg.discount}% off)` : '';
      const whatsapp = pkg.whatsapp_number ? ` | WhatsApp: ${pkg.whatsapp_number}` : '';
      console.log(`${index + 1}. ${pkg.name} - ${pkg.coin_amount} coins for ₹${pkg.price_in_inr}${discount} - ${status}${whatsapp}`);
    });

    console.log('\n🎉 Sample coin packages added successfully!');
    console.log('You can now test the Coin Package CRUD operations with WhatsApp numbers in the admin panel.');

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
addSampleCoinPackages();
