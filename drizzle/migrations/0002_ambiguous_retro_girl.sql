DROP INDEX "ad_positions_position_active_idx";--> statement-breakpoint
DROP INDEX "categories_slug_idx";--> statement-breakpoint
DROP INDEX "comments_post_created_idx";--> statement-breakpoint
DROP INDEX "comments_user_id_idx";--> statement-breakpoint
DROP INDEX "log_approvals_post_idx";--> statement-breakpoint
DROP INDEX "log_approvals_approver_idx";--> statement-breakpoint
DROP INDEX "log_approvals_active_post_action_idx";--> statement-breakpoint
DROP INDEX "master_admin_user_id_idx";--> statement-breakpoint
DROP INDEX "page_views_viewed_at_idx";--> statement-breakpoint
DROP INDEX "page_views_visitor_post_idx";--> statement-breakpoint
DROP INDEX "password_resets_token_idx";--> statement-breakpoint
DROP INDEX "password_resets_email_idx";--> statement-breakpoint
DROP INDEX "password_resets_expires_used_idx";--> statement-breakpoint
DROP INDEX "post_tags_post_tag_idx";--> statement-breakpoint
DROP INDEX "post_tags_tag_post_idx";--> statement-breakpoint
DROP INDEX "posts_slug_idx";--> statement-breakpoint
DROP INDEX "posts_user_id_idx";--> statement-breakpoint
DROP INDEX "posts_category_id_idx";--> statement-breakpoint
DROP INDEX "posts_category_created_idx";--> statement-breakpoint
DROP INDEX "posts_created_at_idx";--> statement-breakpoint
DROP INDEX "posts_status_idx";--> statement-breakpoint
DROP INDEX "tags_slug_idx";--> statement-breakpoint
DROP INDEX "users_email_idx";--> statement-breakpoint
DROP INDEX "users_role_idx";--> statement-breakpoint
-- Migrate existing text data to integer before altering column type
UPDATE `log_approvals` SET `action` = 1 WHERE `action` = 'approved';
UPDATE `log_approvals` SET `action` = 0 WHERE `action` = 'revision';
ALTER TABLE `log_approvals` ALTER COLUMN "action" TO "action" integer NOT NULL;--> statement-breakpoint
CREATE INDEX `ad_positions_position_active_idx` ON `ad_positions` (`position`,`is_active`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_idx` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `comments_post_created_idx` ON `comments` (`post_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `comments_user_id_idx` ON `comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `log_approvals_post_idx` ON `log_approvals` (`post_id`);--> statement-breakpoint
CREATE INDEX `log_approvals_approver_idx` ON `log_approvals` (`approver_id`);--> statement-breakpoint
CREATE INDEX `log_approvals_active_post_action_idx` ON `log_approvals` (`is_active`,`post_id`,`action`);--> statement-breakpoint
CREATE UNIQUE INDEX `master_admin_user_id_idx` ON `master_admin` (`user_id`);--> statement-breakpoint
CREATE INDEX `page_views_viewed_at_idx` ON `page_views` (`viewed_at`);--> statement-breakpoint
CREATE INDEX `page_views_visitor_post_idx` ON `page_views` (`visitor_id`,`post_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `password_resets_token_idx` ON `password_resets` (`token`);--> statement-breakpoint
CREATE INDEX `password_resets_email_idx` ON `password_resets` (`email`);--> statement-breakpoint
CREATE INDEX `password_resets_expires_used_idx` ON `password_resets` (`expires_at`,`used_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `post_tags_post_tag_idx` ON `post_tags` (`post_id`,`tag_id`);--> statement-breakpoint
CREATE INDEX `post_tags_tag_post_idx` ON `post_tags` (`tag_id`,`post_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_idx` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_user_id_idx` ON `posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `posts_category_id_idx` ON `posts` (`category_id`);--> statement-breakpoint
CREATE INDEX `posts_category_created_idx` ON `posts` (`category_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `posts_created_at_idx` ON `posts` (`created_at`);--> statement-breakpoint
CREATE INDEX `posts_status_idx` ON `posts` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_idx` ON `tags` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);