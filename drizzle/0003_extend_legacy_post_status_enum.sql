DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'enum_posts_status'
  ) THEN
    ALTER TYPE enum_posts_status ADD VALUE IF NOT EXISTS 'review';
    ALTER TYPE enum_posts_status ADD VALUE IF NOT EXISTS 'scheduled';
    ALTER TYPE enum_posts_status ADD VALUE IF NOT EXISTS 'archived';
  END IF;
END $$;
