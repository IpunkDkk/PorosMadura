CREATE TABLE IF NOT EXISTS "post_revisions" (
  "id" serial PRIMARY KEY NOT NULL,
  "post_id" integer NOT NULL,
  "user_id" integer,
  "type" text DEFAULT 'manual' NOT NULL,
  "title" text,
  "snapshot" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_revisions_post_id_created_at_idx" ON "post_revisions" ("post_id", "created_at");
