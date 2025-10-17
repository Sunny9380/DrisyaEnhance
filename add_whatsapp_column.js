import mysql from 'mysql2/promise';

async function addWhatsAppColumn() {
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

    // Check if whatsapp_number column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'drisya' 
      AND TABLE_NAME = 'coin_packages' 
      AND COLUMN_NAME = 'whatsapp_number'
    `);

    if (columns.length > 0) {
      console.log('✅ whatsapp_number column already exists in coin_packages table');
    } else {
      // Add whatsapp_number column to coin_packages table
      await connection.execute(`
        ALTER TABLE coin_packages 
        ADD COLUMN whatsapp_number TEXT NULL 
        COMMENT 'WhatsApp number for customer support'
        AFTER description
      `);
      
      console.log('✅ Added whatsapp_number column to coin_packages table');
    }

    // Show table structure
    const [tableStructure] = await connection.execute('DESCRIBE coin_packages');
    
    console.log('\n📋 Updated coin_packages table structure:');
    tableStructure.forEach((column, index) => {
      console.log(`${index + 1}. ${column.Field} (${column.Type}) - ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n🎉 Database migration completed successfully!');
    console.log('The Coin Package CRUD now supports WhatsApp numbers for customer support.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

// Run the migration
addWhatsAppColumn();
