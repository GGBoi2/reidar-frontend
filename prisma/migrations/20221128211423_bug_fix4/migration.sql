/*
  Warnings:

  - You are about to drop the `VotingPeriod` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VotingRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `DaoMember` MODIFY `biography` TEXT NOT NULL DEFAULT '',
    MODIFY `contributions` TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE `VotingPeriod`;

-- DropTable
DROP TABLE `VotingRecord`;
