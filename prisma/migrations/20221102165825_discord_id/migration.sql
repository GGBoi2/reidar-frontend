/*
  Warnings:

  - You are about to drop the column `tempDaoMemberId` on the `DaoMember` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[discordId]` on the table `DaoMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `DaoMember_tempDaoMemberId_key` ON `DaoMember`;

-- AlterTable
ALTER TABLE `DaoMember` RENAME COLUMN `tempDaoMemberId` TO `discordId`,
    
    MODIFY `biography` TEXT NOT NULL DEFAULT '',
    MODIFY `contributions` TEXT NOT NULL DEFAULT '';


