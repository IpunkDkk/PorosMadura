CREATE TABLE IF NOT EXISTS "post_source_checks" (
  "id" serial PRIMARY KEY NOT NULL,
  "post_id" integer NOT NULL,
  "source_url" text NOT NULL,
  "status_code" integer,
  "content_hash" text,
  "resolved_url" text,
  "review_reason" text,
  "error_message" text,
  "checked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_source_checks" ADD CONSTRAINT "post_source_checks_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_source_checks_post_id_checked_at_idx" ON "post_source_checks" ("post_id", "checked_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_source_checks_review_reason_idx" ON "post_source_checks" ("review_reason");
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'source_checked_at'
  ) THEN
    INSERT INTO "post_source_checks" (
      "post_id",
      "source_url",
      "status_code",
      "content_hash",
      "resolved_url",
      "review_reason",
      "checked_at"
    )
    SELECT
      "id",
      "source_url",
      "source_status_code",
      "source_content_hash",
      "source_last_resolved_url",
      "source_review_reason",
      COALESCE("source_checked_at", now())
    FROM "posts"
    WHERE "source_url" IS NOT NULL
      AND "source_url" <> ''
      AND (
        "source_checked_at" IS NOT NULL
        OR "source_status_code" IS NOT NULL
        OR "source_content_hash" IS NOT NULL
        OR "source_last_resolved_url" IS NOT NULL
        OR "source_review_reason" IS NOT NULL
      );
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN IF EXISTS "source_checked_at";
--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN IF EXISTS "source_status_code";
--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN IF EXISTS "source_content_hash";
--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN IF EXISTS "source_last_resolved_url";
--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN IF EXISTS "source_review_reason";
