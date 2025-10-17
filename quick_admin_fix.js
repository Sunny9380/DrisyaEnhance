import mysql from 'mysql2/promise';

async function quickAdminFix() {
  let connection;
  
  try {
    // Connect to MySQL database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'drisya'
    });

    console.log('🔧 Quick Admin Fix - Solving 403 Error');
    console.log('✅ Connected to MySQL database');

    // Check if any users exist
    const [existingUsers] = await connection.execute('SELECT * FROM users ORDER BY created_at DESC LIMIT 5');

    if (existingUsers.length === 0) {
      console.log('❌ No users found in database.');
      console.log('💡 Please register a user first through the web interface, then run this script again.');
      return;
    }

    console.log('\n👥 Found users:');
    existingUsers.forEach((user, index) => {
      const roleIcon = user.role === 'admin' ? '👑' : '👤';
      console.log(`${index + 1}. ${roleIcon} ${user.email} (${user.role})`);
    });

    // Check if any admin exists
    const adminUsers = existingUsers.filter(u => u.role === 'admin');
    
    if (adminUsers.length > 0) {
      console.log('\n✅ Admin users already exist:');
      adminUsers.forEach(admin => {
        console.log(`   👑 ${admin.email} - Admin`);
      });
      console.log('\n💡 You should be able to login with one of these admin accounts.');
      console.log('💡 If you forgot the password, you can reset it or create a new admin.');
      return;
    }

    // Promote the first user to admin
    const userToPromote = existingUsers[0];
    
    await connection.execute(
      'UPDATE users SET role = ?, user_tier = ?, coin_balance = GREATEST(coin_balance, ?), monthly_quota = ? WHERE id = ?',
      ['admin', 'enterprise', 10000, 999999, userToPromote.id]
    );

    console.log('\n🎉 SUCCESS! User promoted to admin:');
    console.log(`   Email: ${userToPromote.email}`);
    console.log(`   Name: ${userToPromote.name || 'Not set'}`);
    console.log(`   Role: user → admin 👑`);
    console.log(`   Tier: ${userToPromote.user_tier} → enterprise 💎`);
    console.log(`   Coins: ${userToPromote.coin_balance} → ${Math.max(userToPromote.coin_balance, 10000)}`);
    console.log(`   Monthly Quota: Unlimited`);

    console.log('\n🔑 Next Steps:');
    console.log('1. Login with this email and password');
    console.log('2. Access the admin panel');
    console.log('3. The 403 error should be resolved!');

    // Show updated user info
    const [updatedUser] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [userToPromote.id]
    );
    
    if (updatedUser.length > 0) {
      const user = updatedUser[0];
      console.log('\n📋 Updated User Details:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role} 👑`);
      console.log(`   Tier: ${user.user_tier} 💎`);
      console.log(`   Coins: ${user.coin_balance}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure XAMPP MySQL is running');
    console.log('2. Check if the database "drisya" exists');
    console.log('3. Verify the users table has data');
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the quick fix
quickAdminFix();
