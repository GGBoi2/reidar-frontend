-- CreateTable
CREATE TABLE `DaoMember` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT '',
    `roles` VARCHAR(191) NOT NULL DEFAULT '',
    `image_url` VARCHAR(191) NOT NULL DEFAULT '',
    `biography` TEXT NOT NULL DEFAULT '',
    `contributions` TEXT NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vote` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `votedFor` VARCHAR(191) NULL,
    `votedAgainst` VARCHAR(191) NULL,

    INDEX `Vote_votedFor_idx`(`votedFor`),
    INDEX `Vote_votedAgainst_idx`(`votedAgainst`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
