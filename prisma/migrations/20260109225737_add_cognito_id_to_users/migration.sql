/*
  Warnings:

  - A unique constraint covering the columns `[cognitoId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cognitoId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add column as nullable first
ALTER TABLE "User" ADD COLUMN "cognitoId" TEXT;

-- Step 2: Backfill existing users with placeholder Cognito IDs
-- Format: PENDING_<user_id> - these should be updated with real Cognito IDs later
UPDATE "User" 
SET "cognitoId" = CONCAT('PENDING_', "id") 
WHERE "cognitoId" IS NULL;

-- Step 3: Make column required (NOT NULL)
ALTER TABLE "User" ALTER COLUMN "cognitoId" SET NOT NULL;

-- Step 4: Create unique index
CREATE UNIQUE INDEX "User_cognitoId_key" ON "User"("cognitoId");
