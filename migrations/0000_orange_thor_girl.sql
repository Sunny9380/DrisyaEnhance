CREATE TABLE `ai_edits` (
	`id` varchar(36) NOT NULL DEFAULT UNHEX(REPLACE(UUID(), '-', '')),
	`user_id` varchar(36) NOT NULL,
	`job_id` varchar(36),
	`image_id` varchar(36),
	`prompt` text NOT NULL,
	`ai_model` text NOT NULL DEFAULT ('auto'),
	`quality` text NOT NULL DEFAULT ('4k'),
	`status` text NOT NULL DEFAULT ('queued'),
	`input_image_url` text NOT NULL,
	`output_image_url` text,
	`cost` int NOT NULL DEFAULT 0,
	`error_message` text,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` datetime,
	CONSTRAINT `ai_edits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_usage_ledger` (
	`id` varchar(36) NOT NULL DEFAULT UNHEX(REPLACE(UUID(), '-', '')),
	`user_id` varchar(36) NOT NULL,
	`month` text NOT NULL DEFAULT DATE_FORMAT(CURRENT_DATE, '%Y-%m'),
	`free_requests` int NOT NULL DEFAULT 0,
	`paid_requests` int NOT NULL DEFAULT 0,
	`total_cost` int NOT NULL DEFAULT 0,
	`last_reset` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_usage_ledger_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_usage_ledger_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` varchar(36) NOT NULL DEFAULT UNHEX(REPLACE(UUID(), '-', '')),
	`user_id` varchar(36),
	`action` text NOT NULL,
	`ip_address` text NOT NULL,
	`user_agent` text,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backgrounds` (
	`id` varchar(36) NOT NULL DEFAULT UNHEX(REPLACE(UUID(), '-', '')),
	`name` text NOT NULL,
	`category` text NOT NULL,
	`tags` json,
	`image_url` text NOT NULL,
	`thumbnail_url` text,
	`source` text NOT NULL DEFAULT ('upload'),
	`source_id` text,
	`source_author` text,
	`is_premium` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backgrounds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coin_packages` (
	`id` varchar(36) NOT NULL DEFAULT UNHEX(REPLACE(UUID(), '-', '')),
	`name` text NOT NULL,
	`coin_amount` int NOT NULL,
	`price_in_inr` int NOT NULL,
	`discount` int DEFAULT 0,
	`description` text,
	`whatsapp_number` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coin_packages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` varchar(36) NOT NULL DEFAULT UNHEX(REPLACE(UUID(), '-', '')),
	`job_id` varchar(36) NOT NULL,
	`original_url` text NOT NULL,
	`processed_url` text,
	`status` text NOT NULL DEFAULT ('pending'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manual_transactions` (
	`id` varchar(36) NOT NULL DEFAULT UNHEX(REPLACE(UUID(), '-', '')),
	`user_id` varchar(36) NOT NULL,
	`package_id` varchar(36),
	`coin_amount` int NOT NULL,
	`price_in_inr` int NOT NULL,
	`payment_method` text NOT NULL DEFAULT ('whatsapp'),
	`payment_reference` text,
	`admin_id` varchar(36),
	`admin_notes` text,
	`user_phone` text,
	`status` text NOT NULL DEFAULT ('pending'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`approved_at` datetime,
	`completed_at` datetime,
	CONSTRAINT `manual_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_library` (
	`id` varchar(36) NOT NULL DEFAULT UNHEX(REPLACE(UUID(), '-', '')),
	`user_id` varchar(36) NOT NULL,
	`job_id` varchar(36),
	`image_id` varchar(36),
	`file_name` text NOT NULL,
	`processed_url` text NOT NULL,
	`thumbnail_url` text,
	`file_size` int,
	`dimensions` text,
	`template_used` text,
	`tags` json,
	`is_favorite` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_library_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processing_jobs` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`template_id` varchar(36) NOT NULL,
	`status` text NOT NULL DEFAULT ('queued'),
	`total_images` int NOT NULL,
	`processed_images` int NOT NULL DEFAULT 0,
	`coins_used` int NOT NULL,
	`batch_settings` json,
	`zip_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` datetime,
	CONSTRAINT `processing_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` varchar(36) NOT NULL DEFAULT UNHEX(REPLACE(UUID(), '-', '')),
	`referrer_id` varchar(36) NOT NULL,
	`referred_user_id` varchar(36),
	`referral_code` text NOT NULL,
	`status` text NOT NULL DEFAULT ('pending'),
	`coins_earned` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` datetime,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referral_code_unique` UNIQUE(`referral_code`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` varchar(36) NOT NULL DEFAULT UNHEX(REPLACE(UUID(), '-', '')),
	`organization_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` text NOT NULL,
	`status` text NOT NULL DEFAULT ('pending'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `template_favorites` (
	`id` varchar(36) NOT NULL DEFAULT UNHEX(REPLACE(UUID(), '-', '')),
	`user_id` varchar(36) NOT NULL,
	`template_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `template_favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` text NOT NULL,
	`category` text NOT NULL,
	`background_style` text DEFAULT ('gradient'),
	`lighting_preset` text DEFAULT ('soft-glow'),
	`description` text,
	`thumbnail_url` text,
	`settings` json,
	`is_premium` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`coin_cost` int NOT NULL DEFAULT 1,
	`price_per_image` int,
	`features` json,
	`benefits` json,
	`use_cases` json,
	`why_buy` text,
	`testimonials` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(36) NOT NULL DEFAULT UNHEX(REPLACE(UUID(), '-', '')),
	`user_id` varchar(36) NOT NULL,
	`type` text NOT NULL,
	`amount` int NOT NULL,
	`description` text NOT NULL,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text,
	`phone` text,
	`avatar_url` text,
	`referral_code` text,
	`coin_balance` int NOT NULL DEFAULT 0,
	`role` text NOT NULL DEFAULT ('user'),
	`user_tier` text NOT NULL DEFAULT ('free'),
	`monthly_quota` int NOT NULL DEFAULT 50,
	`monthly_usage` int NOT NULL DEFAULT 0,
	`quota_reset_date` timestamp NOT NULL DEFAULT (now()),
	`email_notifications` boolean NOT NULL DEFAULT true,
	`notify_job_completion` boolean NOT NULL DEFAULT true,
	`notify_payment_confirmed` boolean NOT NULL DEFAULT true,
	`notify_coins_added` boolean NOT NULL DEFAULT true,
	`is_trial_used` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_referral_code_unique` UNIQUE(`referral_code`)
);
--> statement-breakpoint
ALTER TABLE `ai_edits` ADD CONSTRAINT `ai_edits_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_edits` ADD CONSTRAINT `ai_edits_job_id_processing_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `processing_jobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_edits` ADD CONSTRAINT `ai_edits_image_id_images_id_fk` FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_usage_ledger` ADD CONSTRAINT `ai_usage_ledger_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `backgrounds` ADD CONSTRAINT `backgrounds_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `images` ADD CONSTRAINT `images_job_id_processing_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `processing_jobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manual_transactions` ADD CONSTRAINT `manual_transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manual_transactions` ADD CONSTRAINT `manual_transactions_package_id_coin_packages_id_fk` FOREIGN KEY (`package_id`) REFERENCES `coin_packages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manual_transactions` ADD CONSTRAINT `manual_transactions_admin_id_users_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_library` ADD CONSTRAINT `media_library_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_library` ADD CONSTRAINT `media_library_job_id_processing_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `processing_jobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_library` ADD CONSTRAINT `media_library_image_id_images_id_fk` FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `processing_jobs` ADD CONSTRAINT `processing_jobs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `processing_jobs` ADD CONSTRAINT `processing_jobs_template_id_templates_id_fk` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrer_id_users_id_fk` FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referred_user_id_users_id_fk` FOREIGN KEY (`referred_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_organization_id_users_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `template_favorites` ADD CONSTRAINT `template_favorites_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `template_favorites` ADD CONSTRAINT `template_favorites_template_id_templates_id_fk` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;