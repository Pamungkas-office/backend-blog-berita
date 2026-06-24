ALTER TABLE `users` ADD `email_verified_at` text;--> statement-breakpoint
ALTER TABLE `users` ADD `email_verification_token` text;--> statement-breakpoint
ALTER TABLE `users` ADD `email_verification_expires_at` text;