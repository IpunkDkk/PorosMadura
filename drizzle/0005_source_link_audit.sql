ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "source_checked_at" timestamp;
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "source_status_code" integer;
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "source_content_hash" text;
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "source_last_resolved_url" text;
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "source_review_reason" text;
