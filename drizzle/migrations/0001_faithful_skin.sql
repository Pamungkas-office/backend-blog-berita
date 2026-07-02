CREATE TABLE `approval_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`min_admin_approvals` integer DEFAULT 2 NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `log_approvals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`approver_id` integer NOT NULL,
	`action` text NOT NULL,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `log_approvals_post_idx` ON `log_approvals` (`post_id`);--> statement-breakpoint
CREATE INDEX `log_approvals_approver_idx` ON `log_approvals` (`approver_id`);--> statement-breakpoint
CREATE INDEX `log_approvals_active_post_action_idx` ON `log_approvals` (`is_active`,`post_id`,`action`);--> statement-breakpoint
CREATE TABLE `master_admin` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`is_approver` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `master_admin_user_id_idx` ON `master_admin` (`user_id`);--> statement-breakpoint
ALTER TABLE `posts` ADD `published_at` text;