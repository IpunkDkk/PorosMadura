UPDATE "posts"
SET "published_at" = COALESCE("updated_at", "created_at", now())
WHERE "status" = 'published'
  AND "published_at" IS NULL;
