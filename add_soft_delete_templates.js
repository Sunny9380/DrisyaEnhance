import mysql from 'mysql2/promise';

async function addSoftDeleteColumn() {
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

    // Check if deleted_at column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'drisya' 
      AND TABLE_NAME = 'templates' 
      AND COLUMN_NAME = 'deleted_at'
    `);

    if (columns.length > 0) {
      console.log('✅ deleted_at column already exists in templates table');
    } else {
      // Add deleted_at column to templates table
      await connection.execute(`
        ALTER TABLE templates 
        ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
        COMMENT 'Soft delete timestamp - NULL means not deleted'
        AFTER created_at
      `);
      
      console.log('✅ Added deleted_at column to templates table');
    }

    // Show table structure
    const [tableStructure] = await connection.execute('DESCRIBE templates');
    
    console.log('\n📋 Updated templates table structure:');
    tableStructure.forEach((column, index) => {
      console.log(`${index + 1}. ${column.Field} (${column.Type}) - ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Show current templates with their status
    const [allTemplates] = await connection.execute(`
      SELECT id, name, category, is_active, deleted_at, created_at 
      FROM templates 
      ORDER BY created_at DESC
    `);
    
    console.log('\n📋 Current templates in database:');
    if (allTemplates.length === 0) {
      console.log('No templates found. You can add some using the admin panel.');
    } else {
      allTemplates.forEach((template, index) => {
        const status = template.is_active ? '🟢 Active' : '🔴 Inactive';
        const deleted = template.deleted_at ? '🗑️ SOFT DELETED' : '✅ Available';
        console.log(`${index + 1}. ${template.name} (${template.category}) - ${status} - ${deleted}`);
      });
    }

    console.log('\n🎉 Soft delete migration completed successfully!');
    console.log('Templates can now be soft deleted instead of permanently removed.');
    console.log('Benefits:');
    console.log('- ✅ Data preservation for audit trails');
    console.log('- ✅ Ability to restore accidentally deleted templates');
    console.log('- ✅ Better data integrity and history tracking');

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
addSoftDeleteColumn();
