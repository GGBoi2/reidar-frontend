/*
  Warnings:

  - You are about to drop the column `pickable` on the `DaoMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `DaoMember` DROP COLUMN `pickable`,
    MODIFY `biography` TEXT NOT NULL DEFAULT '',
    MODIFY `contributions` TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `VotingRecord` (
    `id` VARCHAR(191) NOT NULL,
    `daoMemberId` VARCHAR(191) NOT NULL,
    `rawScore` INTEGER NOT NULL,
    `hasVoted` BOOLEAN NOT NULL,
    `votingTitle` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `VotingRecord_daoMemberId_key`(`daoMemberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VotingPeriod` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `maxVoteCount` INTEGER NOT NULL,

    UNIQUE INDEX `VotingPeriod_title_key`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
