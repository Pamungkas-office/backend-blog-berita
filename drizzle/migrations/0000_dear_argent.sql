CREATE TABLE `ad_positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`position` text NOT NULL,
	`ad_code` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ad_positions_position_active_idx` ON `ad_positions` (`position`,`is_active`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_idx` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`user_id` integer,
	`comment` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `comments_post_created_idx` ON `comments` (`post_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `comments_user_id_idx` ON `comments` (`user_id`);--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`ip_address` text NOT NULL,
	`viewed_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `page_views_post_id_idx` ON `page_views` (`post_id`);--> statement-breakpoint
CREATE INDEX `page_views_post_ip_viewed_idx` ON `page_views` (`post_id`,`ip_address`,`viewed_at`);--> statement-breakpoint
CREATE INDEX `page_views_viewed_at_idx` ON `page_views` (`viewed_at`);--> statement-breakpoint
CREATE TABLE `post_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_tags_post_tag_idx` ON `post_tags` (`post_id`,`tag_id`);--> statement-breakpoint
CREATE INDEX `post_tags_tag_post_idx` ON `post_tags` (`tag_id`,`post_id`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text NOT NULL,
	`thumbnail` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`meta_title` text,
	`meta_description` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_idx` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_user_id_idx` ON `posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `posts_category_id_idx` ON `posts` (`category_id`);--> statement-breakpoint
CREATE INDEX `posts_category_created_idx` ON `posts` (`category_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `posts_created_at_idx` ON `posts` (`created_at`);--> statement-breakpoint
CREATE INDEX `posts_status_idx` ON `posts` (`status`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_idx` ON `tags` (`slug`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);