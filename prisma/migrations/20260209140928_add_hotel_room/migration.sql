-- CreateTable
CREATE TABLE `hotel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `merchant_id` INTEGER NOT NULL,
    `name_cn` VARCHAR(128) NOT NULL,
    `name_en` VARCHAR(128) NULL,
    `address` VARCHAR(255) NOT NULL,
    `star_rating` INTEGER NOT NULL,
    `opening_date` DATE NULL,
    `tags` JSON NULL,
    `city_code` VARCHAR(32) NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 0,
    `audit_reason` VARCHAR(255) NULL,
    `image_url` VARCHAR(512) NULL,
    `latitude` DECIMAL(9, 6) NULL,
    `longitude` DECIMAL(9, 6) NULL,

    INDEX `hotel_merchant_id_idx`(`merchant_id`),
    INDEX `hotel_city_code_idx`(`city_code`),
    INDEX `hotel_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_id` INTEGER NOT NULL,
    `room_name` VARCHAR(64) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `original_price` DECIMAL(10, 2) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,

    INDEX `room_hotel_id_idx`(`hotel_id`),
    INDEX `room_price_idx`(`price`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hotel` ADD CONSTRAINT `hotel_merchant_id_fkey` FOREIGN KEY (`merchant_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room` ADD CONSTRAINT `room_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
