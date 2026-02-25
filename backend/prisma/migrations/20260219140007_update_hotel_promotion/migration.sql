-- CreateTable
CREATE TABLE `hotel_promotion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_id` INTEGER NOT NULL,
    `promotion_type` ENUM('FLASH_SALE', 'HOLIDAY_SPECIAL', 'WEEKEND_DEAL', 'NEW_OPEN', 'SEASONAL', 'MEMBER_EXCLUSIVE') NOT NULL,
    `discount` DECIMAL(3, 2) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `hotel_promotion_hotel_id_idx`(`hotel_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hotel_promotion` ADD CONSTRAINT `hotel_promotion_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
