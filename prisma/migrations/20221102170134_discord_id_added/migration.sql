/*
  Warnings:

  - A unique constraint covering the columns `[discordId]` on the table `DaoMember` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `DaoMember` MODIFY `biography` TEXT NOT NULL DEFAULT '',
    MODIFY `contributions` TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX `DaoMember_discordId_key` ON `DaoMember`(`discordId`);
