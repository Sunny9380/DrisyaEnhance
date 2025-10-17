import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'drisya',
      multipleStatements: true
    });

    console.log('Connected to MySQL database');

    // Read the SQL file
    const sqlFile = fs.readFileSync('setup_database.sql', 'utf8');
    
    // Execute the SQL
    await connection.execute(sqlFile);
    console.log('✅ Database tables created successfully');

    // Close connection
    await connection.end();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
setupDatabase();
