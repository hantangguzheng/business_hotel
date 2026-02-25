/*
  Warnings:

  - You are about to drop the column `hasFreeWifi` on the `hotel` table. All the data in the column will be lost.
  - You are about to drop the column `hasGym` on the `hotel` table. All the data in the column will be lost.
  - You are about to drop the column `hasParking` on the `hotel` table. All the data in the column will be lost.
  - You are about to drop the column `hasTV` on the `hotel` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `hotel` table. All the data in the column will be lost.
  - You are about to drop the column `area_range` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `bed_type` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `meal_type` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `original_price` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `room_name` on the `room` table. All the data in the column will be lost.
  - Added the required column `price` to the `hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area_title` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bed_title` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `floor_title` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `picture_url` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smoke_title` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `window_title` to the `room` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `room_area_range_idx` ON `room`;

-- DropIndex
DROP INDEX `room_bed_type_idx` ON `room`;

-- AlterTable
ALTER TABLE `hotel` DROP COLUMN `hasFreeWifi`,
    DROP COLUMN `hasGym`,
    DROP COLUMN `hasParking`,
    DROP COLUMN `hasTV`,
    DROP COLUMN `tags`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `cross_line_price` DECIMAL(10, 2) NULL,
    ADD COLUMN `ctrip_image_url` VARCHAR(255) NULL,
    ADD COLUMN `currency` VARCHAR(10) NOT NULL DEFAULT 'RMB',
    ADD COLUMN `price` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `score` DECIMAL(2, 1) NOT NULL DEFAULT 0.0,
    ADD COLUMN `short_tags` JSON NULL,
    ADD COLUMN `total_reviews` INTEGER NOT NULL DEFAULT 0,
    MODIFY `star_rating` INTEGER NOT NULL DEFAULT 2;

-- AlterTable
ALTER TABLE `room` DROP COLUMN `area_range`,
    DROP COLUMN `bed_type`,
    DROP COLUMN `meal_type`,
    DROP COLUMN `original_price`,
    DROP COLUMN `room_name`,
    ADD COLUMN `accessible_facilities` JSON NULL,
    ADD COLUMN `amenity_facilities` JSON NULL,
    ADD COLUMN `area_title` VARCHAR(32) NOT NULL,
    ADD COLUMN `bathing_facilities` JSON NULL,
    ADD COLUMN `bathroom_facilities` JSON NULL,
    ADD COLUMN `bed_title` VARCHAR(64) NOT NULL,
    ADD COLUMN `child_facilities` JSON NULL,
    ADD COLUMN `cleaning_facilities` JSON NULL,
    ADD COLUMN `floor_title` VARCHAR(32) NOT NULL,
    ADD COLUMN `food_facilities` JSON NULL,
    ADD COLUMN `kitchen_facilities` JSON NULL,
    ADD COLUMN `layout_facilities` JSON NULL,
    ADD COLUMN `media_facilities` JSON NULL,
    ADD COLUMN `name` VARCHAR(64) NOT NULL,
    ADD COLUMN `network_facilities` JSON NULL,
    ADD COLUMN `picture_url` VARCHAR(255) NOT NULL,
    ADD COLUMN `room_spec_facilities` JSON NULL,
    ADD COLUMN `smoke_title` VARCHAR(32) NOT NULL,
    ADD COLUMN `view_facilities` JSON NULL,
    ADD COLUMN `wifi_info` VARCHAR(64) NULL,
    ADD COLUMN `window_title` VARCHAR(32) NOT NULL;
