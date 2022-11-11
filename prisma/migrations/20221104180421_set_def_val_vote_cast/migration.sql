-- AlterTable
ALTER TABLE `DaoMember` ADD COLUMN `votesCast` INTEGER NULL DEFAULT 0,
    MODIFY `biography` TEXT NOT NULL DEFAULT '',
    MODIFY `contributions` TEXT NOT NULL DEFAULT '';
