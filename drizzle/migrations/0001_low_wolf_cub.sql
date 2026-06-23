CREATE TABLE `password_resets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `password_resets_token_idx` ON `password_resets` (`token`);--> statement-breakpoint
CREATE INDEX `password_resets_email_idx` ON `password_resets` (`email`);--> statement-breakpoint
CREATE INDEX `password_resets_expires_used_idx` ON `password_resets` (`expires_at`,`used_at`);