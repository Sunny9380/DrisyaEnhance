import mysql from 'mysql2/promise';

async function createAdminUser() {
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

    // Check if any users exist
    const [existingUsers] = await connection.execute('SELECT * FROM users LIMIT 5');

    if (existingUsers.length > 0) {
      console.log('Found existing users. Updating first user to admin...');
      
      // Update the first user to be admin
      const userId = existingUsers[0].id;
      await connection.execute(
        'UPDATE users SET role = ?, user_tier = ?, coin_balance = ? WHERE id = ?',
        ['admin', 'enterprise', 10000, userId]
      );
      
      console.log(`✅ Updated user to admin role`);
      console.log(`User ID: ${userId}`);
      console.log(`Email: ${existingUsers[0].email}`);
      console.log(`Role: admin`);
      console.log(`Tier: enterprise`);
      console.log(`Coins: 10000`);
      console.log('\n🔑 You can now login with this user\'s existing credentials and access admin panel');
    } else {
      console.log('No existing users found. Please register a user first, then run this script again.');
    }

    // Show all users for reference
    const [allUsers] = await connection.execute(
      'SELECT id, email, name, role, user_tier, coin_balance FROM users'
    );
    
    console.log('\n📋 All users in database:');
    if (allUsers.length === 0) {
      console.log('No users found. Please register a user first.');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.role} (${user.user_tier}) - ${user.coin_balance} coins`);
      });
    }

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
createAdminUser();
