import { index, pgTable, serial, text, varchar, timestamp, integer, boolean, jsonb, numeric } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ==========================================
// 1. BETTER AUTH TABLES
// ==========================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull().unique(),
  role: text('role').notNull().default('author'), // 'admin' | 'editor' | 'author' | 'viewer'
  avatarId: integer('avatar_id').references(() => media.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  resetPasswordToken: varchar('reset_password_token'),
  resetPasswordExpiration: timestamp('reset_password_expiration'),
  salt: varchar('salt'),
  hash: varchar('hash'),
  loginAttempts: numeric('login_attempts').default('0'),
  lockUntil: timestamp('lock_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
})

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  providerId: text('provider_id').notNull(),
  accountId: text('account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: timestamp('expires_at'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

export const authUsers = pgTable('auth_users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const authSessions = pgTable('auth_sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
})

export const authAccounts = pgTable('auth_accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const authVerifications = pgTable('auth_verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ==========================================
// 2. CORE CMS TABLES
// ==========================================

export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  alt: varchar('alt').notNull(),
  caption: varchar('caption'),
  credit: varchar('credit'),
  folder: varchar('folder').default('/'),
  url: varchar('url'),
  thumbnailURL: varchar('thumbnail_u_r_l'),
  filename: varchar('filename'),
  mimeType: varchar('mime_type'),
  filesize: numeric('filesize', { mode: 'number' }),
  width: numeric('width', { mode: 'number' }),
  height: numeric('height', { mode: 'number' }),
  focalX: numeric('focal_x', { mode: 'number' }),
  focalY: numeric('focal_y', { mode: 'number' }),
  sizesThumbnailUrl: varchar('sizes_thumbnail_url'),
  sizesThumbnailWidth: numeric('sizes_thumbnail_width', { mode: 'number' }),
  sizesThumbnailHeight: numeric('sizes_thumbnail_height', { mode: 'number' }),
  sizesThumbnailMimeType: varchar('sizes_thumbnail_mime_type'),
  sizesThumbnailFilesize: numeric('sizes_thumbnail_filesize', { mode: 'number' }),
  sizesThumbnailFilename: varchar('sizes_thumbnail_filename'),
  sizesCardUrl: varchar('sizes_card_url'),
  sizesCardWidth: numeric('sizes_card_width', { mode: 'number' }),
  sizesCardHeight: numeric('sizes_card_height', { mode: 'number' }),
  sizesCardMimeType: varchar('sizes_card_mime_type'),
  sizesCardFilesize: numeric('sizes_card_filesize', { mode: 'number' }),
  sizesCardFilename: varchar('sizes_card_filename'),
  sizesHeroUrl: varchar('sizes_hero_url'),
  sizesHeroWidth: numeric('sizes_hero_width', { mode: 'number' }),
  sizesHeroHeight: numeric('sizes_hero_height', { mode: 'number' }),
  sizesHeroMimeType: varchar('sizes_hero_mime_type'),
  sizesHeroFilesize: numeric('sizes_hero_filesize', { mode: 'number' }),
  sizesHeroFilename: varchar('sizes_hero_filename'),
  sizesOgUrl: varchar('sizes_og_url'),
  sizesOgWidth: numeric('sizes_og_width', { mode: 'number' }),
  sizesOgHeight: numeric('sizes_og_height', { mode: 'number' }),
  sizesOgMimeType: varchar('sizes_og_mime_type'),
  sizesOgFilesize: numeric('sizes_og_filesize', { mode: 'number' }),
  sizesOgFilename: varchar('sizes_og_filename'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  bio: text('bio'),
  avatarId: integer('avatar_id').references(() => media.id, { onDelete: 'set null' }),
  email: varchar('email'),
  socialLinksFacebook: varchar('social_links_facebook'),
  socialLinksTwitter: varchar('social_links_twitter'),
  socialLinksInstagram: varchar('social_links_instagram'),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: integer('parent_id').references((): any => categories.id, { onDelete: 'set null' }),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  order: numeric('order', { mode: 'number' }).default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: jsonb('content'), // rich text JSON; render layer can also accept HTML strings
  featuredImageId: integer('featured_image_id').references(() => media.id, { onDelete: 'set null' }),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  authorId: integer('author_id').references(() => authors.id, { onDelete: 'set null' }),
  status: text('status').default('draft').notNull(), // 'draft' | 'review' | 'scheduled' | 'published' | 'archived'
  publishedAt: timestamp('published_at'),
  scheduledAt: timestamp('scheduled_at'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  canonicalUrl: text('canonical_url'),
  ogImageId: integer('og_image_id').references(() => media.id, { onDelete: 'set null' }),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isBreakingNews: boolean('is_breaking_news').default(false).notNull(),
  allowIndex: boolean('allow_index').default(true).notNull(),
  sourceName: text('source_name'),
  sourceUrl: text('source_url'),
  views: integer('views').default(0).notNull(),
  readingTime: numeric('reading_time', { mode: 'number' }).default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const postSourceChecks = pgTable('post_source_checks', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  sourceUrl: text('source_url').notNull(),
  statusCode: integer('status_code'),
  contentHash: text('content_hash'),
  resolvedUrl: text('resolved_url'),
  reviewReason: text('review_reason'),
  errorMessage: text('error_message'),
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
}, (table) => ({
  postCheckedAtIdx: index('post_source_checks_post_id_checked_at_idx').on(table.postId, table.checkedAt),
  reviewReasonIdx: index('post_source_checks_review_reason_idx').on(table.reviewReason),
}))

export const postTags = pgTable('posts_rels', {
  id: serial('id').primaryKey(),
  order: integer('order'),
  parentId: integer('parent_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  path: varchar('path').notNull(),
  tagId: integer('tags_id').references(() => tags.id, { onDelete: 'cascade' }),
})

export const postRevisions = pgTable('post_revisions', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  type: text('type').default('manual').notNull(), // 'manual' | 'autosave' | 'restore'
  title: text('title'),
  snapshot: jsonb('snapshot').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const pages = pgTable('pages', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: jsonb('content'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  status: text('status').default('draft').notNull(), // 'draft' | 'published'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const redirects = pgTable('redirects', {
  id: serial('id').primaryKey(),
  fromPath: text('from_path').notNull(),
  toPath: text('to_path').notNull(),
  statusCode: text('status_code').default('301').notNull(), // 301 | 302
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ==========================================
// 3. HYBRID AD SYSTEM TABLES
// ==========================================

export const adSlots = pgTable('ad_slots', {
  id: serial('id').primaryKey(),
  placement: text('placement').notNull().unique(), // e.g. 'home_top_banner'
  label: text('label').notNull(),
  description: text('description'),
  fallbackType: text('fallback_type').default('none').notNull(),
  fallbackCode: text('fallback_code'),
  isFallbackActive: boolean('is_fallback_active').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const ads = pgTable('ads', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  advertiserName: text('advertiser_name'),
  advertiserContact: text('advertiser_contact'),
  imageDesktopId: integer('image_desktop_id').references(() => media.id, { onDelete: 'set null' }),
  imageMobileId: integer('image_mobile_id').references(() => media.id, { onDelete: 'set null' }),
  targetUrl: text('target_url').notNull(),
  placement: varchar('placement').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: text('status').default('draft').notNull(), // 'draft' | 'active' | 'inactive'
  priority: numeric('priority', { mode: 'number' }).default(0),
  impressionsCount: numeric('impressions_count', { mode: 'number' }).default(0),
  clicksCount: numeric('clicks_count', { mode: 'number' }).default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const adEvents = pgTable('ad_events', {
  id: serial('id').primaryKey(),
  eventType: text('event_type').notNull(), // 'impression' | 'click'
  adId: integer('ad_id').references(() => ads.id, { onDelete: 'set null' }),
  placement: varchar('placement'),
  pageUrl: varchar('page_url'),
  userAgent: text('user_agent'),
  ipHash: varchar('ip_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ==========================================
// 4. GLOBAL SETTINGS TABLE
// ==========================================

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  siteName: text('site_name').default('PorosMadura').notNull(),
  tagline: text('tagline'),
  siteDescription: text('site_description'),
  siteUrl: text('site_url'),
  contactEmail: text('contact_email'),
  logoId: integer('logo_id').references(() => media.id, { onDelete: 'set null' }),
  logoDarkId: integer('logo_dark_id').references(() => media.id, { onDelete: 'set null' }),
  faviconId: integer('favicon_id').references(() => media.id, { onDelete: 'set null' }),
  defaultOgImageId: integer('default_og_image_id').references(() => media.id, { onDelete: 'set null' }),
  socialLinksFacebook: varchar('social_links_facebook'),
  socialLinksTwitter: varchar('social_links_twitter'),
  socialLinksInstagram: varchar('social_links_instagram'),
  socialLinksYoutube: varchar('social_links_youtube'),
  defaultSeoTitle: text('default_seo_title').default('PorosMadura'),
  defaultSeoDescription: text('default_seo_description').default('Berita Tepat, Fakta Kuat'),
  googleAnalyticsId: text('google_analytics_id'),
  rssTitle: text('rss_title').default('PorosMadura'),
  rssDescription: text('rss_description').default('Berita Tepat, Fakta Kuat'),
  newsPublicationName: text('news_publication_name').default('PorosMadura'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ==========================================
// 5. RELATIONS DEFINITIONS
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const authUsersRelations = relations(authUsers, ({ many }) => ({
  sessions: many(authSessions),
  accounts: many(authAccounts),
}))

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
  user: one(authUsers, {
    fields: [authSessions.userId],
    references: [authUsers.id],
  }),
}))

export const authAccountsRelations = relations(authAccounts, ({ one }) => ({
  user: one(authUsers, {
    fields: [authAccounts.userId],
    references: [authUsers.id],
  }),
}))

export const mediaRelations = relations(media, ({ many }) => ({
  authors: many(authors),
  posts: many(posts, { relationName: 'featuredImage' }),
  adsDesktop: many(ads, { relationName: 'imageDesktop' }),
  adsMobile: many(ads, { relationName: 'imageMobile' }),
  settingsLogo: many(settings, { relationName: 'siteLogo' }),
  settingsOg: many(settings, { relationName: 'siteOgImage' }),
}))

export const authorsRelations = relations(authors, ({ one, many }) => ({
  avatar: one(media, {
    fields: [authors.avatarId],
    references: [media.id],
  }),
  posts: many(posts),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  featuredImage: one(media, {
    fields: [posts.featuredImageId],
    references: [media.id],
    relationName: 'featuredImage',
  }),
  ogImage: one(media, {
    fields: [posts.ogImageId],
    references: [media.id],
    relationName: 'postOgImage',
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  author: one(authors, {
    fields: [posts.authorId],
    references: [authors.id],
  }),
  postTags: many(postTags),
  sourceChecks: many(postSourceChecks),
}))

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.parentId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}))

export const postSourceChecksRelations = relations(postSourceChecks, ({ one }) => ({
  post: one(posts, {
    fields: [postSourceChecks.postId],
    references: [posts.id],
  }),
}))

export const adSlotsRelations = relations(adSlots, ({ many }) => ({
  ads: many(ads),
}))

export const adsRelations = relations(ads, ({ one, many }) => ({
  imageDesktop: one(media, {
    fields: [ads.imageDesktopId],
    references: [media.id],
    relationName: 'imageDesktop',
  }),
  imageMobile: one(media, {
    fields: [ads.imageMobileId],
    references: [media.id],
    relationName: 'imageMobile',
  }),
  events: many(adEvents),
}))

export const adEventsRelations = relations(adEvents, ({ one }) => ({
  ad: one(ads, {
    fields: [adEvents.adId],
    references: [ads.id],
  }),
}))

export const settingsRelations = relations(settings, ({ one }) => ({
  logo: one(media, {
    fields: [settings.logoId],
    references: [media.id],
    relationName: 'siteLogo',
  }),
  defaultOgImage: one(media, {
    fields: [settings.defaultOgImageId],
    references: [media.id],
    relationName: 'siteOgImage',
  }),
}))
