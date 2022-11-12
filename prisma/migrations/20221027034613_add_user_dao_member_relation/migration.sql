/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `DaoMember` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `DaoMember` ADD COLUMN `userId` VARCHAR(191) NULL,
    MODIFY `biography` TEXT NOT NULL DEFAULT '',
    MODIFY `contributions` TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX `DaoMember_userId_key` ON `DaoMember`(`userId`);
