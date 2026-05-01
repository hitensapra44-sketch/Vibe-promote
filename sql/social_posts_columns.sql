-- If the table already exists, ensure these columns are present:
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS views        INTEGER;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS engagements   INTEGER;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS comments      INTEGER;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS link_clicks   INTEGER;