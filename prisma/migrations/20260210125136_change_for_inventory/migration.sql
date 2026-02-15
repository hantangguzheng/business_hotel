/*
  Warnings:

  - You are about to drop the column `roomType` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `room` table. All the data in the column will be lost.
  - Added the required column `area_range` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bed_type` to the `room` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `room_price_idx` ON `room`;

-- AlterTable
ALTER TABLE `room` DROP COLUMN `roomType`,
    DROP COLUMN `stock`,
    ADD COLUMN `area_range` ENUM('UNDER_25', 'GTE_25', 'GTE_30', 'GTE_55') NOT NULL,
    ADD COLUMN `bed_type` ENUM('LARGE_BED', 'TWIN_BED', 'SINGLE_BED', 'TRIPLE_BED', 'KING_BED', 'MULTIPLE_BED') NOT NULL,
    ADD COLUMN `capacity` INTEGER NOT NULL DEFAULT 2,
    ADD COLUMN `meal_type` ENUM('NONE', 'BREAKFAST', 'SINGLE_BREAKFAST', 'DOUBLE_BREAKFAST', 'DINNER', 'SINGLE_DINNER', 'DOUBLE_DINNER') NOT NULL DEFAULT 'NONE',
    ADD COLUMN `total_stock` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `room_inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `available_count` INTEGER NOT NULL DEFAULT 0,
    `price` DECIMAL(10, 2) NOT NULL,

    INDEX `room_inventory_date_idx`(`date`),
    UNIQUE INDEX `room_inventory_room_id_date_key`(`room_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `room_bed_type_idx` ON `room`(`bed_type`);

-- CreateIndex
CREATE INDEX `room_area_range_idx` ON `room`(`area_range`);

-- AddForeignKey
ALTER TABLE `room_inventory` ADD CONSTRAINT `room_inventory_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
