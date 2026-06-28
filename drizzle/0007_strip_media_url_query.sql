UPDATE "media"
SET "url" = regexp_replace("url", '\?.*$', '')
WHERE "url" LIKE '%?%';
