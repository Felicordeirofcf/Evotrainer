/*
  Warnings:

  - You are about to drop the column `eliteLink` on the `SystemConfig` table. All the data in the column will be lost.
  - You are about to drop the column `proLink` on the `SystemConfig` table. All the data in the column will be lost.
  - You are about to drop the column `startLink` on the `SystemConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SystemConfig" DROP COLUMN "eliteLink",
DROP COLUMN "proLink",
DROP COLUMN "startLink",
ALTER COLUMN "promoTitle" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkoutTemplate" ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "duration" SET DEFAULT '60 min';

-- CreateIndex
CREATE INDEX "Exercise_workoutId_idx" ON "Exercise"("workoutId");

-- CreateIndex
CREATE INDEX "User_trainerId_idx" ON "User"("trainerId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "WorkoutHistory_userId_idx" ON "WorkoutHistory"("userId");

-- CreateIndex
CREATE INDEX "WorkoutTemplate_userId_idx" ON "WorkoutTemplate"("userId");
