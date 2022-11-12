/*
  Warnings:

  - You are about to drop the column `votesCast` on the `DaoMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `DaoMember` DROP COLUMN `votesCast`,
    MODIFY `biography` TEXT NOT NULL DEFAULT '',
    MODIFY `contributions` TEXT NOT NULL DEFAULT '';
