-- AlterTable
ALTER TABLE `DaoMember` MODIFY `biography` TEXT NOT NULL DEFAULT '',
    MODIFY `contributions` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `tempDaoMember` ADD COLUMN `claimed` BOOLEAN NULL;
