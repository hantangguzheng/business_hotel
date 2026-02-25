-- CreateTable
CREATE TABLE `booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `hotel_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,
    `check_in` DATE NOT NULL,
    `check_out` DATE NOT NULL,
    `rooms` INTEGER NOT NULL DEFAULT 1,
    `people` INTEGER NOT NULL DEFAULT 1,
    `total_price` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `booking_user_id_idx`(`user_id`),
    INDEX `booking_hotel_id_idx`(`hotel_id`),
    INDEX `booking_room_id_idx`(`room_id`),
    INDEX `booking_check_in_check_out_idx`(`check_in`, `check_out`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
