-- AlterTable
ALTER TABLE `DaoMember` ADD COLUMN `votesCast` INTEGER NULL,
    MODIFY `biography` TEXT NOT NULL DEFAULT '',
    MODIFY `contributions` TEXT NOT NULL DEFAULT '';
