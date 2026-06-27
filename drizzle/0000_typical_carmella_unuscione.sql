CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider_id" text NOT NULL,
	"account_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"expires_at" timestamp,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"ad_id" integer,
	"placement" varchar,
	"page_url" varchar,
	"user_agent" text,
	"ip_hash" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"placement" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"fallback_type" text DEFAULT 'none' NOT NULL,
	"fallback_code" text,
	"is_fallback_active" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ad_slots_placement_unique" UNIQUE("placement")
);
--> statement-breakpoint
CREATE TABLE "ads" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"advertiser_name" text,
	"advertiser_contact" text,
	"image_desktop_id" integer,
	"image_mobile_id" integer,
	"target_url" text NOT NULL,
	"placement" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"priority" numeric DEFAULT 0,
	"impressions_count" numeric DEFAULT 0,
	"clicks_count" numeric DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"bio" text,
	"avatar_id" integer,
	"email" varchar,
	"social_links_facebook" varchar,
	"social_links_twitter" varchar,
	"social_links_instagram" varchar,
	"user_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "authors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent_id" integer,
	"seo_title" text,
	"seo_description" text,
	"order" numeric DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"alt" varchar NOT NULL,
	"caption" varchar,
	"credit" varchar,
	"folder" varchar DEFAULT '/',
	"url" varchar,
	"thumbnail_u_r_l" varchar,
	"filename" varchar,
	"mime_type" varchar,
	"filesize" numeric,
	"width" numeric,
	"height" numeric,
	"focal_x" numeric,
	"focal_y" numeric,
	"sizes_thumbnail_url" varchar,
	"sizes_thumbnail_width" numeric,
	"sizes_thumbnail_height" numeric,
	"sizes_thumbnail_mime_type" varchar,
	"sizes_thumbnail_filesize" numeric,
	"sizes_thumbnail_filename" varchar,
	"sizes_card_url" varchar,
	"sizes_card_width" numeric,
	"sizes_card_height" numeric,
	"sizes_card_mime_type" varchar,
	"sizes_card_filesize" numeric,
	"sizes_card_filename" varchar,
	"sizes_hero_url" varchar,
	"sizes_hero_width" numeric,
	"sizes_hero_height" numeric,
	"sizes_hero_mime_type" varchar,
	"sizes_hero_filesize" numeric,
	"sizes_hero_filename" varchar,
	"sizes_og_url" varchar,
	"sizes_og_width" numeric,
	"sizes_og_height" numeric,
	"sizes_og_mime_type" varchar,
	"sizes_og_filesize" numeric,
	"sizes_og_filename" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" jsonb,
	"seo_title" text,
	"seo_description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "posts_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"tags_id" integer
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" jsonb,
	"featured_image_id" integer,
	"category_id" integer,
	"author_id" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"scheduled_at" timestamp,
	"seo_title" text,
	"seo_description" text,
	"canonical_url" text,
	"og_image_id" integer,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_breaking_news" boolean DEFAULT false NOT NULL,
	"allow_index" boolean DEFAULT true NOT NULL,
	"source_name" text,
	"source_url" text,
	"views" integer DEFAULT 0 NOT NULL,
	"reading_time" numeric DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "redirects" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_path" text NOT NULL,
	"to_path" text NOT NULL,
	"status_code" text DEFAULT '301' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" integer NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_name" text DEFAULT 'PorosMadura' NOT NULL,
	"tagline" text,
	"site_description" text,
	"site_url" text,
	"contact_email" text,
	"logo_id" integer,
	"logo_dark_id" integer,
	"favicon_id" integer,
	"default_og_image_id" integer,
	"social_links_facebook" varchar,
	"social_links_twitter" varchar,
	"social_links_instagram" varchar,
	"social_links_youtube" varchar,
	"default_seo_title" text DEFAULT 'PorosMadura',
	"default_seo_description" text DEFAULT 'Berita Tepat, Fakta Kuat',
	"google_analytics_id" text,
	"rss_title" text DEFAULT 'PorosMadura',
	"rss_description" text DEFAULT 'Berita Tepat, Fakta Kuat',
	"news_publication_name" text DEFAULT 'PorosMadura',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"role" text DEFAULT 'author' NOT NULL,
	"avatar_id" integer,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"reset_password_token" varchar,
	"reset_password_expiration" timestamp,
	"salt" varchar,
	"hash" varchar,
	"login_attempts" numeric DEFAULT '0',
	"lock_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_events" ADD CONSTRAINT "ad_events_ad_id_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_image_desktop_id_media_id_fk" FOREIGN KEY ("image_desktop_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authors" ADD CONSTRAINT "authors_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authors" ADD CONSTRAINT "authors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_tags_id_tags_id_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_logo_dark_id_media_id_fk" FOREIGN KEY ("logo_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;