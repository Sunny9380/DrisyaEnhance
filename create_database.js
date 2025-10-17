import mysql from 'mysql2/promise';

async function createDatabase() {
  let connection;
  
  try {
    // Connect to MySQL without specifying a database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS drisya');
    console.log('✅ Database "drisya" created or already exists');

    // Close connection
    await connection.end();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createDatabase();
