/*
  Warnings:

  - You are about to drop the column `ableToVote` on the `DaoMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `DaoMember` DROP COLUMN `ableToVote`,
    MODIFY `biography` TEXT NOT NULL DEFAULT '',
    MODIFY `contributions` TEXT NOT NULL DEFAULT '';
