-- Create Drisya Database
CREATE DATABASE IF NOT EXISTS drisya;
USE drisya;

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Processing jobs table
CREATE TABLE IF NOT EXISTS processing_jobs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  template_id VARCHAR(36) NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  total_images INT NOT NULL,
  processed_images INT NOT NULL DEFAULT 0,
  coins_used INT NOT NULL,
  batch_settings JSON,
  zip_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UNHEX(REPLACE(UUID(), '-', ''))),
  job_id VARCHAR(36) NOT NULL,
  original_url TEXT NOT NULL,
  processed_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES processing_jobs(id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UNHEX(REPLACE(UUID(), '-', ''))),
  user_id VARCHAR(36) NOT NULL,
  type TEXT NOT NULL,
  amount INT NOT NULL,
  description TEXT NOT NULL,
  metadata JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Template favorites table
CREATE TABLE IF NOT EXISTS template_favorites (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UNHEX(REPLACE(UUID(), '-', ''))),
  user_id VARCHAR(36) NOT NULL,
  template_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UNHEX(REPLACE(UUID(), '-', ''))),
  referrer_id VARCHAR(36) NOT NULL,
  referred_user_id VARCHAR(36),
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  coins_earned INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (referrer_id) REFERENCES users(id),
  FOREIGN KEY (referred_user_id) REFERENCES users(id)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UNHEX(REPLACE(UUID(), '-', ''))),
  user_id VARCHAR(36),
  action TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  metadata JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Coin packages table
CREATE TABLE IF NOT EXISTS coin_packages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UNHEX(REPLACE(UUID(), '-', ''))),
  name TEXT NOT NULL,
  coin_amount INT NOT NULL,
  price_in_inr INT NOT NULL,
  discount INT DEFAULT 0,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Manual transactions table
CREATE TABLE IF NOT EXISTS manual_transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UNHEX(REPLACE(UUID(), '-', ''))),
  user_id VARCHAR(36) NOT NULL,
  package_id VARCHAR(36),
  coin_amount INT NOT NULL,
  price_in_inr INT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'whatsapp',
  payment_reference TEXT,
  admin_id VARCHAR(36),
  admin_notes TEXT,
  user_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (package_id) REFERENCES coin_packages(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Media library table
CREATE TABLE IF NOT EXISTS media_library (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UNHEX(REPLACE(UUID(), '-', ''))),
  user_id VARCHAR(36) NOT NULL,
  job_id VARCHAR(36),
  image_id VARCHAR(36),
  file_name TEXT NOT NULL,
  processed_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INT,
  dimensions TEXT,
  template_used TEXT,
  tags JSON,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (job_id) REFERENCES processing_jobs(id),
  FOREIGN KEY (image_id) REFERENCES images(id)
);

-- AI edits table
CREATE TABLE IF NOT EXISTS ai_edits (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UNHEX(REPLACE(UUID(), '-', ''))),
  user_id VARCHAR(36) NOT NULL,
  job_id VARCHAR(36),
  image_id VARCHAR(36),
  prompt TEXT NOT NULL,
  ai_model TEXT NOT NULL DEFAULT 'auto',
  quality TEXT NOT NULL DEFAULT '4k',
  status TEXT NOT NULL DEFAULT 'queued',
  input_image_url TEXT NOT NULL,
  output_image_url TEXT,
  cost INT NOT NULL DEFAULT 0,
  error_message TEXT,
  metadata JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (job_id) REFERENCES processing_jobs(id),
  FOREIGN KEY (image_id) REFERENCES images(id)
);

-- AI usage ledger table
CREATE TABLE IF NOT EXISTS ai_usage_ledger (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UNHEX(REPLACE(UUID(), '-', ''))),
  user_id VARCHAR(36) NOT NULL UNIQUE,
  monthly_quota INT NOT NULL DEFAULT 10,
  monthly_usage INT NOT NULL DEFAULT 0,
  quota_reset_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default templates
INSERT IGNORE INTO templates (name, category, background_style, lighting_preset, description, coin_cost, is_active) VALUES
('Classic Jewelry', 'jewelry', 'gradient', 'soft-glow', 'Perfect for showcasing jewelry with elegant backgrounds', 1, TRUE),
('Modern Minimalist', 'jewelry', 'minimal', 'studio', 'Clean, modern look for contemporary jewelry pieces', 1, TRUE),
('Luxury Velvet', 'jewelry', 'velvet', 'moody', 'Rich velvet backgrounds for premium jewelry photography', 2, TRUE);

-- Insert default coin packages
INSERT IGNORE INTO coin_packages (name, coin_amount, price_in_inr, description, display_order) VALUES
('Starter Pack', 100, 500, 'Perfect for trying out our services', 1),
('Popular Pack', 250, 1000, 'Most popular choice for regular users', 2),
('Professional Pack', 500, 1800, 'Best value for professionals', 3),
('Enterprise Pack', 1000, 3000, 'For high-volume users', 4);
