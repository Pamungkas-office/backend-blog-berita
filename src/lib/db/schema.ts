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

import { relations, sql } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// ─────────────────────────────────────────────
// 1. USERS
// ─────────────────────────────────────────────
export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    /** Unique enforced via uniqueIndex below */
    email: text('email').notNull(),
    password: text('password').notNull(),
    role: text('role', { enum: ['admin', 'user'] })
      .notNull()
      .default('user'),
    created_at: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    /** Primary lookup: login / session resolution */
    emailIdx: uniqueIndex('users_email_idx').on(t.email),
    /** Filter by role (admin dashboards, permission checks) */
    roleIdx: index('users_role_idx').on(t.role),
  }),
);

// ─────────────────────────────────────────────
// 2. CATEGORIES
// ─────────────────────────────────────────────
export const categories = sqliteTable(
  'categories',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex('categories_slug_idx').on(t.slug),
  }),
);

// ─────────────────────────────────────────────
// 3. TAGS
// ─────────────────────────────────────────────
export const tags = sqliteTable(
  'tags',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex('tags_slug_idx').on(t.slug),
  }),
);

// ─────────────────────────────────────────────
// 4. POSTS
// ─────────────────────────────────────────────
export const posts = sqliteTable(
  'posts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    /** FK → users.id  (author) */
    user_id: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    /** FK → categories.id */
    category_id: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    content: text('content').notNull(),
    /** URL thumbnail/cover image */
    thumbnail: text('thumbnail'),
    /** draft | published */
    status: text('status', { enum: ['draft', 'published'] })
      .notNull()
      .default('draft'),
    /** SEO */
    meta_title: text('meta_title'),
    meta_description: text('meta_description'),
    created_at: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    /** URL resolution — most frequent public query */
    slugIdx: uniqueIndex('posts_slug_idx').on(t.slug),
    /** Author page / dashboard listing */
    userIdx: index('posts_user_id_idx').on(t.user_id),
    /** Category archive page */
    categoryIdx: index('posts_category_id_idx').on(t.category_id),
    /**
     * Covering index: category archive sorted by newest-first.
     * Satisfies: WHERE category_id = ? ORDER BY created_at DESC
     * without a separate sort pass.
     */
    categoryCreatedIdx: index('posts_category_created_idx').on(
      t.category_id,
      t.created_at,
    ),
    /** Feed / homepage: all posts newest-first */
    createdAtIdx: index('posts_created_at_idx').on(t.created_at),
    /** Filter published / draft posts */
    statusIdx: index('posts_status_idx').on(t.status),
  }),
);

// ─────────────────────────────────────────────
// 5. POST ↔ TAGS  (Many-to-Many junction)
// ─────────────────────────────────────────────
export const post_tags = sqliteTable(
  'post_tags',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    post_id: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tag_id: integer('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    /**
     * Composite unique index:
     *  - Prevents duplicate (post, tag) pairs
     *  - Acts as a covering index for both directions of the M:N join
     */
    postTagUniqueIdx: uniqueIndex('post_tags_post_tag_idx').on(
      t.post_id,
      t.tag_id,
    ),
    /**
     * Reverse index: "which posts have tag X?" lookup
     * (tag cloud, tag archive page)
     */
    tagPostIdx: index('post_tags_tag_post_idx').on(t.tag_id, t.post_id),
  }),
);

// ─────────────────────────────────────────────
// 6. COMMENTS
// ─────────────────────────────────────────────
export const comments = sqliteTable(
  'comments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    post_id: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    /** Nullable — anonymous visitor comments are allowed */
    user_id: integer('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    /** Display name for anonymous comments */
    comment: text('comment').notNull(),
    created_at: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    /** Load comments for a post thread, newest-first */
    postCreatedIdx: index('comments_post_created_idx').on(
      t.post_id,
      t.created_at,
    ),
    /** Lookup all comments by a registered user */
    userIdx: index('comments_user_id_idx').on(t.user_id),
  }),
);

// ─────────────────────────────────────────────
// 7. AD POSITIONS
// ─────────────────────────────────────────────
export const ad_positions = sqliteTable(
  'ad_positions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    /**
     * Allowed values: 'header' | 'sidebar' | 'in_article' | 'footer'
     * Enforced at the application layer (Zod / class-validator).
     * SQLite has no CHECK constraint in older versions, but drizzle
     * can emit one — add if your SQLite ≥ 3.25.
     */
    position: text('position', {
      enum: ['auto_ads', 'header', 'sidebar', 'in_article', 'footer'],
    }).notNull(),
    ad_code: text('ad_code').notNull(),
    /** 1 = active, 0 = paused */
    is_active: integer('is_active', { mode: 'boolean' })
      .notNull()
      .default(true),
  },
  (t) => ({
    /**
     * Render-path query: SELECT * FROM ad_positions
     * WHERE position = ? AND is_active = 1
     * This composite index covers both predicates.
     */
    positionActiveIdx: index('ad_positions_position_active_idx').on(
      t.position,
      t.is_active,
    ),
  }),
);

// ─────────────────────────────────────────────
// 8. PAGE VIEWS  (analytics / statistics)
// ─────────────────────────────────────────────
export const page_views = sqliteTable(
  'page_views',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    post_id: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    ip_address: text('ip_address').notNull(),
    viewed_at: text('viewed_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    /**
     * Aggregate view counts per post:
     * SELECT COUNT(*) FROM page_views WHERE post_id = ?
     */
    postIdx: index('page_views_post_id_idx').on(t.post_id),
    /**
     * Unique-visitor deduplication within a time window:
     * WHERE post_id = ? AND ip_address = ? AND viewed_at > ?
     */
    postIpViewedIdx: index('page_views_post_ip_viewed_idx').on(
      t.post_id,
      t.ip_address,
      t.viewed_at,
    ),
    /**
     * Trend / time-series queries (daily / weekly stats dashboard):
     * WHERE viewed_at BETWEEN ? AND ?
     */
    viewedAtIdx: index('page_views_viewed_at_idx').on(t.viewed_at),
  }),
);

// ─────────────────────────────────────────────
// RELATIONS  (for Drizzle relational queries)
// ─────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
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
}));