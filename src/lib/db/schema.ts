/**
 * Blog Database Schema — Drizzle ORM (SQLite)
 *
 * Architecture decisions:
 *  - autoincrement PKs for insert performance on SQLite
 *  - Covering indexes on high-frequency JOIN columns (foreign keys)
 *  - Composite unique index on post_tags to enforce M:N integrity without a
 *    separate UNIQUE constraint scan
 *  - Partial / expression indexes are left as raw SQL in the migration file
 *    because drizzle-kit does not yet emit them from schema definitions
 *  - All timestamp columns use text (ISO-8601) — SQLite has no native
 *    TIMESTAMP type; text comparisons on ISO strings are index-safe
 */

import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ─────────────────────────────────────────────
// 1. USERS
// ─────────────────────────────────────────────
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    /** Unique enforced via uniqueIndex below */
    email: text("email").notNull(),
    password: text("password").notNull(),
    role: text("role", { enum: ["super_admin", "admin", "user"] })
      .notNull()
      .default("user"),
    email_verified_at: text("email_verified_at"),
    email_verification_token: text("email_verification_token"),
    email_verification_expires_at: text("email_verification_expires_at"),
    created_at: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    /** Primary lookup: login / session resolution */
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    /** Filter by role (admin dashboards, permission checks) */
    roleIdx: index("users_role_idx").on(t.role),
  }),
);

// ─────────────────────────────────────────────
// 2. MASTER ADMIN  —  extension table for admin users
// ─────────────────────────────────────────────
export const masterAdmin = sqliteTable(
  "master_admin",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Whether this admin has approval rights */
    is_approver: integer("is_approver", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (t) => ({
    /** 1:1 with users */
    userIdUnique: uniqueIndex("master_admin_user_id_idx").on(t.user_id),
  }),
);

// ─────────────────────────────────────────────
// 3. CATEGORIES
// ─────────────────────────────────────────────
export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("categories_slug_idx").on(t.slug),
  }),
);

// ─────────────────────────────────────────────
// 3. TAGS
// ─────────────────────────────────────────────
export const tags = sqliteTable(
  "tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("tags_slug_idx").on(t.slug),
  }),
);

// ─────────────────────────────────────────────
// 4. POSTS
// ─────────────────────────────────────────────
export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** FK → users.id  (author) */
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    /** FK → categories.id */
    category_id: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    content: text("content").notNull(),
    /** URL thumbnail/cover image */
    thumbnail: text("thumbnail"),
    /**
     * Status workflow:
     * draft            — admin masih ngirim progress
     * waiting_approval — sudah dikirim, nunggu review
     * approved         — sudah cukup approvals, siap publish
     * revision         — ditolak/diminta revisi oleh approver
     * published        — sudah tayang
     */
    status: text("status", {
      enum: ["draft", "waiting_approval", "approved", "revision", "published"],
    })
      .notNull()
      .default("draft"),
    /** SEO */
    meta_title: text("meta_title"),
    meta_description: text("meta_description"),
    created_at: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    /** Timestamp when super_admin publishes the post */
    published_at: text("published_at"),
  },
  (t) => ({
    /** URL resolution — most frequent public query */
    slugIdx: uniqueIndex("posts_slug_idx").on(t.slug),
    /** Author page / dashboard listing */
    userIdx: index("posts_user_id_idx").on(t.user_id),
    /** Category archive page */
    categoryIdx: index("posts_category_id_idx").on(t.category_id),
    /**
     * Covering index: category archive sorted by newest-first.
     * Satisfies: WHERE category_id = ? ORDER BY created_at DESC
     * without a separate sort pass.
     */
    categoryCreatedIdx: index("posts_category_created_idx").on(
      t.category_id,
      t.created_at,
    ),
    /** Feed / homepage: all posts newest-first */
    createdAtIdx: index("posts_created_at_idx").on(t.created_at),
    /** Filter published / draft posts */
    statusIdx: index("posts_status_idx").on(t.status),
  }),
);

// ─────────────────────────────────────────────
// 5. POST ↔ TAGS  (Many-to-Many junction)
// ─────────────────────────────────────────────
export const post_tags = sqliteTable(
  "post_tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    post_id: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tag_id: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    /**
     * Composite unique index:
     *  - Prevents duplicate (post, tag) pairs
     *  - Acts as a covering index for both directions of the M:N join
     */
    postTagUniqueIdx: uniqueIndex("post_tags_post_tag_idx").on(
      t.post_id,
      t.tag_id,
    ),
    /**
     * Reverse index: "which posts have tag X?" lookup
     * (tag cloud, tag archive page)
     */
    tagPostIdx: index("post_tags_tag_post_idx").on(t.tag_id, t.post_id),
  }),
);

// ─────────────────────────────────────────────
// 6. COMMENTS
// ─────────────────────────────────────────────
export const comments = sqliteTable(
  "comments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    post_id: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    /** Nullable — anonymous visitor comments are allowed */
    user_id: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    /** Display name for anonymous comments */
    comment: text("comment").notNull(),
    created_at: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    /** Load comments for a post thread, newest-first */
    postCreatedIdx: index("comments_post_created_idx").on(
      t.post_id,
      t.created_at,
    ),
    /** Lookup all comments by a registered user */
    userIdx: index("comments_user_id_idx").on(t.user_id),
  }),
);

// ─────────────────────────────────────────────
// 7. AD POSITIONS
// ─────────────────────────────────────────────
export const ad_positions = sqliteTable(
  "ad_positions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /**
     * Allowed values: 'header' | 'sidebar' | 'in_article' | 'footer'
     * Enforced at the application layer (Zod / class-validator).
     * SQLite has no CHECK constraint in older versions, but drizzle
     * can emit one — add if your SQLite ≥ 3.25.
     */
    position: text("position", {
      enum: ["auto_ads", "header", "sidebar", "in_article", "footer"],
    }).notNull(),
    ad_code: text("ad_code").notNull(),
    /** 1 = active, 0 = paused */
    is_active: integer("is_active", { mode: "boolean" })
      .notNull()
      .default(true),
  },
  (t) => ({
    /**
     * Render-path query: SELECT * FROM ad_positions
     * WHERE position = ? AND is_active = 1
     * This composite index covers both predicates.
     */
    positionActiveIdx: index("ad_positions_position_active_idx").on(
      t.position,
      t.is_active,
    ),
  }),
);

// ─────────────────────────────────────────────
// 8. PASSWORD RESETS  (forgot / reset password flow)
// ─────────────────────────────────────────────
export const passwordResets = sqliteTable(
  "password_resets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    token: text("token").notNull(),
    expiresAt: text("expires_at").notNull(),
    usedAt: text("used_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    /** Lookup by hashed token at reset time */
    tokenIdx: uniqueIndex("password_resets_token_idx").on(t.token),
    /** Cleanup old tokens for an email before inserting a new one */
    emailIdx: index("password_resets_email_idx").on(t.email),
    /** Speed up cleanup of expired + unused tokens (cron / on-read) */
    expiresUsedIdx: index("password_resets_expires_used_idx").on(
      t.expiresAt,
      t.usedAt,
    ),
  }),
);

// ─────────────────────────────────────────────
// 9. PAGE VIEWS  (analytics / statistics)
// ─────────────────────────────────────────────
export const page_views = sqliteTable(
  "page_views",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    post_id: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    user_id: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    visitor_id: text("visitor_id"),
    viewed_at: text("viewed_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    viewedAtIdx: index("page_views_viewed_at_idx").on(t.viewed_at),
    visitorPostIdx: index("page_views_visitor_post_idx").on(
      t.visitor_id,
      t.post_id,
    ),
  }),
);

// ─────────────────────────────────────────────
// 10. LOG APPROVALS  — approval & revision history
// ─────────────────────────────────────────────
export const logApprovals = sqliteTable(
  "log_approvals",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    post_id: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    approver_id: integer("approver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** 0 = revision, 1 = approved */
    action: integer("action").notNull(),
    /** Rich-text notes — required when action = 'revision', nullable for approval */
    notes: text("notes"),
    /** Soft toggle: set to false when admin resubmits a revision */
    is_active: integer("is_active", { mode: "boolean" })
      .notNull()
      .default(true),
    created_at: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    postIdx: index("log_approvals_post_idx").on(t.post_id),
    approverIdx: index("log_approvals_approver_idx").on(t.approver_id),
    activePostActionIdx: index("log_approvals_active_post_action_idx").on(
      t.is_active,
      t.post_id,
      t.action,
    ),
  }),
);

// ─────────────────────────────────────────────
// 11. APPROVAL CONFIG  — global threshold settings
// ─────────────────────────────────────────────
export const approvalConfig = sqliteTable("approval_config", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** How many admin-approver approvals are needed (super_admin is mandatory) */
  min_admin_approvals: integer("min_admin_approvals").notNull().default(2),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

// ─────────────────────────────────────────────
// RELATIONS  (for Drizzle relational queries)
// ─────────────────────────────────────────────
export const usersRelations = relations(users, ({ many, one }) => ({
  posts: many(posts),
  comments: many(comments),
  masterAdmin: one(masterAdmin, {
    fields: [users.id],
    references: [masterAdmin.user_id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  post_tags: many(post_tags),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.user_id], references: [users.id] }),
  category: one(categories, {
    fields: [posts.category_id],
    references: [categories.id],
  }),
  post_tags: many(post_tags),
  comments: many(comments),
  page_views: many(page_views),
  log_approvals: many(logApprovals),
}));

export const postTagsRelations = relations(post_tags, ({ one }) => ({
  post: one(posts, { fields: [post_tags.post_id], references: [posts.id] }),
  tag: one(tags, { fields: [post_tags.tag_id], references: [tags.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, { fields: [comments.post_id], references: [posts.id] }),
  user: one(users, { fields: [comments.user_id], references: [users.id] }),
}));

export const pageViewsRelations = relations(page_views, ({ one }) => ({
  post: one(posts, { fields: [page_views.post_id], references: [posts.id] }),
  user: one(users, { fields: [page_views.user_id], references: [users.id] }),
}));

export const logApprovalsRelations = relations(logApprovals, ({ one }) => ({
  post: one(posts, { fields: [logApprovals.post_id], references: [posts.id] }),
  approver: one(users, {
    fields: [logApprovals.approver_id],
    references: [users.id],
  }),
}));

export const masterAdminRelations = relations(masterAdmin, ({ one }) => ({
  user: one(users, { fields: [masterAdmin.user_id], references: [users.id] }),
}));

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.email],
    references: [users.email],
  }),
}));
