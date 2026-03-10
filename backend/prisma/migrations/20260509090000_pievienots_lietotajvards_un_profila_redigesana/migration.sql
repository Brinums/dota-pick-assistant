-- Add username field for profile identity
ALTER TABLE "users"
ADD COLUMN "username" TEXT;

-- Ensure username uniqueness (nullable, multiple NULL values are allowed in PostgreSQL)
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
