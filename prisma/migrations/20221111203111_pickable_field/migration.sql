-- AlterTable
ALTER TABLE `DaoMember` ADD COLUMN `pickable` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `biography` TEXT NOT NULL DEFAULT '',
    MODIFY `contributions` TEXT NOT NULL DEFAULT '';
