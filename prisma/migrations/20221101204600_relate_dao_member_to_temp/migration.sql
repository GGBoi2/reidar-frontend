-- AlterTable
ALTER TABLE `DaoMember` ADD COLUMN `tempDaoMemberId` VARCHAR(191) NULL,
    MODIFY `biography` TEXT NOT NULL DEFAULT '',
    MODIFY `contributions` TEXT NOT NULL DEFAULT '';
