CREATE TABLE `clients` (
	`id` varchar(128) NOT NULL,
	`client_name` varchar(100) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` varchar(128) NOT NULL,
	`name` varchar(100) NOT NULL,
	`html_content` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` varchar(128) NOT NULL,
	`description` text NOT NULL,
	`title` varchar(100) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`features` json NOT NULL,
	`type` varchar(10) NOT NULL,
	`email` varchar(50),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `plans_title_unique` UNIQUE(`title`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`session_id` varchar(128) NOT NULL,
	`expires` int NOT NULL,
	`data` mediumtext,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_session_id` PRIMARY KEY(`session_id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` varchar(128) NOT NULL,
	`content` text NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`rating` enum('1','1.5','2','2.5','3','3.5','4','4.5','5') NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `throttle_insight` (
	`wait_time` int NOT NULL,
	`ms_before_next` int NOT NULL,
	`end_point` varchar(225),
	`allotted_points` int NOT NULL,
	`consumed_points` int NOT NULL,
	`remaining_points` int NOT NULL,
	`key` varchar(225) NOT NULL,
	`is_first_in_duration` boolean NOT NULL,
	CONSTRAINT `throttle_insight_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` varchar(128) NOT NULL,
	`client_theme` enum('light','dark') DEFAULT 'light',
	`client_link` json NOT NULL,
	`user_id` varchar(128) NOT NULL,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(128) NOT NULL,
	`is_proxy` boolean DEFAULT false,
	`full_name` varchar(100),
	`proxy_data` json,
	`profile_pic` varchar(255),
	`company_name` varchar(100),
	`permissions` json,
	`is_deactivated` boolean DEFAULT false,
	`password` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`show_rating_alert` boolean DEFAULT false,
	`profile_public_id` varchar(255),
	`stripe_customer_id` varchar(100),
	`plan_id` varchar(128),
	`user_roles` enum('user','admin','client','sub_admin') DEFAULT 'user',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(128) NOT NULL,
	`email` varchar(100) NOT NULL,
	`token` text NOT NULL,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`),
	CONSTRAINT `verification_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_plan_id_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE set null ON UPDATE no action;