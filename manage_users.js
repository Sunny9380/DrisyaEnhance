import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

class UserManager {
  constructor() {
    this.connection = null;
  }

  async connect() {
    this.connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'drisya'
    });
    console.log('✅ Connected to MySQL database');
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 Database connection closed');
    }
  }

  async listUsers() {
    const [users] = await this.connection.execute(`
      SELECT id, email, name, role, user_tier, coin_balance, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log('\n👥 All Users:');
    console.log('─'.repeat(80));
    users.forEach((user, index) => {
      const roleIcon = user.role === 'admin' ? '👑' : '👤';
      const tierIcon = user.user_tier === 'enterprise' ? '💎' : user.user_tier === 'premium' ? '⭐' : '🆓';
      console.log(`${index + 1}. ${roleIcon} ${user.email}`);
      console.log(`   Name: ${user.name || 'Not set'}`);
      console.log(`   Role: ${user.role} | Tier: ${user.user_tier} ${tierIcon} | Coins: ${user.coin_balance}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log('');
    });
    
    return users;
  }

  async promoteToAdmin(emailOrId) {
    // Try to find user by email first, then by ID
    let [users] = await this.connection.execute(
      'SELECT * FROM users WHERE email = ? OR id = ?',
      [emailOrId, emailOrId]
    );

    if (users.length === 0) {
      throw new Error(`❌ User not found: ${emailOrId}`);
    }

    const user = users[0];
    
    await this.connection.execute(
      'UPDATE users SET role = ?, user_tier = ?, coin_balance = ? WHERE id = ?',
      ['admin', 'enterprise', Math.max(user.coin_balance, 10000), user.id]
    );

    console.log(`✅ User promoted to admin:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: user → admin 👑`);
    console.log(`   Tier: ${user.user_tier} → enterprise 💎`);
    console.log(`   Coins: ${user.coin_balance} → ${Math.max(user.coin_balance, 10000)}`);
    
    return user;
  }

  async demoteFromAdmin(emailOrId) {
    let [users] = await this.connection.execute(
      'SELECT * FROM users WHERE email = ? OR id = ?',
      [emailOrId, emailOrId]
    );

    if (users.length === 0) {
      throw new Error(`❌ User not found: ${emailOrId}`);
    }

    const user = users[0];
    
    if (user.role !== 'admin') {
      throw new Error(`❌ User ${user.email} is not an admin`);
    }

    await this.connection.execute(
      'UPDATE users SET role = ?, user_tier = ? WHERE id = ?',
      ['user', 'free', user.id]
    );

    console.log(`✅ User demoted from admin:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: admin → user 👤`);
    console.log(`   Tier: enterprise → free 🆓`);
    
    return user;
  }

  async createAdmin(email, password, name = 'Admin User') {
    // Check if user already exists
    const [existingUsers] = await this.connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      throw new Error(`❌ User with email ${email} already exists`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create admin user
    await this.connection.execute(
      `INSERT INTO users (
        id, email, password, name, role, user_tier, coin_balance, 
        monthly_quota, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        email,
        hashedPassword,
        name,
        'admin',
        'enterprise',
        10000,
        999999
      ]
    );

    console.log(`✅ Admin user created successfully:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${name}`);
    console.log(`   Role: admin 👑`);
    console.log(`   Tier: enterprise 💎`);
    console.log(`   Coins: 10000`);
    console.log(`   ID: ${userId}`);

    return { id: userId, email, name };
  }

  async updateUserCoins(emailOrId, coinAmount) {
    let [users] = await this.connection.execute(
      'SELECT * FROM users WHERE email = ? OR id = ?',
      [emailOrId, emailOrId]
    );

    if (users.length === 0) {
      throw new Error(`❌ User not found: ${emailOrId}`);
    }

    const user = users[0];
    
    await this.connection.execute(
      'UPDATE users SET coin_balance = ? WHERE id = ?',
      [coinAmount, user.id]
    );

    console.log(`✅ User coins updated:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Coins: ${user.coin_balance} → ${coinAmount}`);
    
    return user;
  }

  async updateUserTier(emailOrId, tier) {
    const validTiers = ['free', 'premium', 'enterprise'];
    if (!validTiers.includes(tier)) {
      throw new Error(`❌ Invalid tier: ${tier}. Valid tiers: ${validTiers.join(', ')}`);
    }

    let [users] = await this.connection.execute(
      'SELECT * FROM users WHERE email = ? OR id = ?',
      [emailOrId, emailOrId]
    );

    if (users.length === 0) {
      throw new Error(`❌ User not found: ${emailOrId}`);
    }

    const user = users[0];
    
    await this.connection.execute(
      'UPDATE users SET user_tier = ? WHERE id = ?',
      [tier, user.id]
    );

    const tierIcon = tier === 'enterprise' ? '💎' : tier === 'premium' ? '⭐' : '🆓';
    console.log(`✅ User tier updated:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Tier: ${user.user_tier} → ${tier} ${tierIcon}`);
    
    return user;
  }
}

// CLI Interface
async function main() {
  const userManager = new UserManager();
  
  try {
    await userManager.connect();
    
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'list':
        await userManager.listUsers();
        break;

      case 'promote':
        if (!args[1]) {
          console.log('❌ Usage: node manage_users.js promote <email_or_id>');
          return;
        }
        await userManager.promoteToAdmin(args[1]);
        break;

      case 'demote':
        if (!args[1]) {
          console.log('❌ Usage: node manage_users.js demote <email_or_id>');
          return;
        }
        await userManager.demoteFromAdmin(args[1]);
        break;

      case 'create-admin':
        if (!args[1] || !args[2]) {
          console.log('❌ Usage: node manage_users.js create-admin <email> <password> [name]');
          return;
        }
        await userManager.createAdmin(args[1], args[2], args[3] || 'Admin User');
        break;

      case 'coins':
        if (!args[1] || !args[2]) {
          console.log('❌ Usage: node manage_users.js coins <email_or_id> <amount>');
          return;
        }
        await userManager.updateUserCoins(args[1], parseInt(args[2]));
        break;

      case 'tier':
        if (!args[1] || !args[2]) {
          console.log('❌ Usage: node manage_users.js tier <email_or_id> <free|premium|enterprise>');
          return;
        }
        await userManager.updateUserTier(args[1], args[2]);
        break;

      default:
        console.log('🔧 Drisya User Management Tool');
        console.log('');
        console.log('Available commands:');
        console.log('  list                                    - List all users');
        console.log('  promote <email_or_id>                  - Promote user to admin');
        console.log('  demote <email_or_id>                   - Demote admin to user');
        console.log('  create-admin <email> <password> [name] - Create new admin user');
        console.log('  coins <email_or_id> <amount>           - Update user coin balance');
        console.log('  tier <email_or_id> <tier>              - Update user tier (free/premium/enterprise)');
        console.log('');
        console.log('Examples:');
        console.log('  node manage_users.js list');
        console.log('  node manage_users.js promote user@example.com');
        console.log('  node manage_users.js create-admin admin@drisya.app admin123 "Super Admin"');
        console.log('  node manage_users.js coins user@example.com 5000');
        console.log('  node manage_users.js tier user@example.com premium');
        break;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await userManager.disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { UserManager };
