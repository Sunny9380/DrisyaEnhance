-- Manual Database Setup for Drisya Platform
-- Use this if Drizzle db:push fails

-- Create database
CREATE DATABASE IF NOT EXISTS drisya;
USE drisya;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email TEXT NOT NULL,
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_email (email(255)),
  UNIQUE KEY unique_referral_code (referral_code(255))
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
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

-- Processing Jobs table
CREATE TABLE IF NOT EXISTS processing_jobs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  template_id VARCHAR(36) NOT NULL,
  total_images INT NOT NULL,
  completed_images INT NOT NULL DEFAULT 0,
  coins_used INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  zip_url TEXT,
  batch_settings JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  job_id VARCHAR(36) NOT NULL,
  original_url TEXT NOT NULL,
  processed_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES processing_jobs(id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  type TEXT NOT NULL,
  amount INT NOT NULL,
  description TEXT,
  metadata JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Template Favorites table
CREATE TABLE IF NOT EXISTS template_favorites (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  template_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (template_id) REFERENCES templates(id),
  UNIQUE KEY unique_user_template (user_id, template_id)
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36),
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Coin Packages table
CREATE TABLE IF NOT EXISTS coin_packages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name TEXT NOT NULL,
  coins INT NOT NULL,
  price INT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Manual Transactions table
CREATE TABLE IF NOT EXISTS manual_transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  admin_id VARCHAR(36) NOT NULL,
  type TEXT NOT NULL,
  amount INT NOT NULL,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  referrer_id VARCHAR(36) NOT NULL,
  referral_code TEXT NOT NULL,
  referred_user_id VARCHAR(36),
  coins_awarded INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (referrer_id) REFERENCES users(id),
  FOREIGN KEY (referred_user_id) REFERENCES users(id)
);

-- AI Edits table
CREATE TABLE IF NOT EXISTS ai_edits (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  prompt TEXT NOT NULL,
  input_image_url TEXT NOT NULL,
  output_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  ai_model TEXT DEFAULT 'auto',
  quality TEXT DEFAULT 'standard',
  job_id VARCHAR(36),
  image_id VARCHAR(36),
  error_message TEXT,
  processing_time_ms INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI Usage Ledger table
CREATE TABLE IF NOT EXISTS ai_usage_ledger (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  edit_id VARCHAR(36) NOT NULL,
  tokens_used INT NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10,4) DEFAULT 0.0000,
  model_used TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (edit_id) REFERENCES ai_edits(id)
);

-- Insert default coin packages
INSERT IGNORE INTO coin_packages (id, name, coins, price, description) VALUES
(UUID(), 'Starter Pack', 500, 499, '500 coins for beginners'),
(UUID(), 'Pro Pack', 2000, 1599, '2000 coins for professionals'),
(UUID(), 'Enterprise Pack', 5000, 3499, '5000 coins for businesses');

-- Create admin user (password: admin123)
INSERT IGNORE INTO users (id, email, password, name, role, user_tier, coin_balance) VALUES
(UUID(), 'admin@drisya.app', '$2b$10$rQZ9QmZJ5fQ5K5K5K5K5KuJ5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K', 'Admin User', 'admin', 'enterprise', 10000);

SHOW TABLES;
SELECT 'Database setup complete!' as status;
