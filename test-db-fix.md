# Database Fix Test Plan

## Issue
Drizzle `db:push` failing with error: `TypeError: Cannot read properties of undefined (reading 'checkConstraint')`

## Root Cause Analysis
This error typically occurs when:
1. Database connection is not properly established
2. MySQL version compatibility issues with Drizzle
3. Schema definition conflicts
4. Missing environment variables

## Test Plan

### Step 1: Environment Setup Test
```bash
# Check if .env file exists
ls -la .env

# If not, copy from example
cp .env.example .env

# Verify DATABASE_URL is set
echo $DATABASE_URL
```

### Step 2: Database Connection Test
```bash
# Test MySQL connection manually
mysql -u root -p -h localhost -P 3306

# Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS drisya;
USE drisya;
SHOW TABLES;
```

### Step 3: Drizzle Configuration Test
```bash
# Check Drizzle config
cat drizzle.config.ts

# Test with verbose output
npx drizzle-kit push --verbose

# Alternative: Generate migration first
npx drizzle-kit generate
```

### Step 4: Schema Validation Test
```bash
# Check schema syntax
npx tsc --noEmit shared/schema.ts

# Test schema import
node -e "console.log(require('./shared/schema.ts'))"
```

### Step 5: Manual Database Creation Test
If Drizzle fails, create tables manually:

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  referral_code TEXT UNIQUE,
  coin_balance INT NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user',
  user_tier TEXT NOT NULL DEFAULT 'free',
  monthly_quota INT NOT NULL DEFAULT 50,
  monthly_usage INT NOT NULL DEFAULT 0,
  quota_reset_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  notify_job_completion BOOLEAN NOT NULL DEFAULT TRUE,
  notify_payment_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  notify_coins_added BOOLEAN NOT NULL DEFAULT TRUE,
  is_trial_used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Templates table
CREATE TABLE templates (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  background_style TEXT DEFAULT 'gradient',
  lighting_preset TEXT DEFAULT 'soft-glow',
  description TEXT,
  thumbnail_url TEXT,
  settings JSON,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  coin_cost INT NOT NULL DEFAULT 1,
  price_per_image INT,
  features JSON,
  benefits JSON,
  use_cases JSON,
  why_buy TEXT,
  testimonials JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

## Expected Results
- [ ] Environment variables properly set
- [ ] MySQL connection successful
- [ ] Database 'drisya' exists
- [ ] Drizzle push completes without errors
- [ ] All tables created successfully
- [ ] Application starts without database errors

## Fallback Solutions
1. **Manual Schema Creation**: If Drizzle fails, use manual SQL
2. **Alternative ORM**: Consider switching to Prisma if issues persist
3. **Docker MySQL**: Use containerized MySQL for consistency
4. **Schema Simplification**: Remove complex JSON fields temporarily

## Verification Commands
```bash
# After fix, verify with:
npm run db:push
npm run build
npm start

# Test API endpoints:
curl http://localhost:5000/api/auth/me
curl http://localhost:5000/api/media
```
