/*
  Warnings:

  - You are about to drop the column `image_url` on the `hotel` table. All the data in the column will be lost.
  - Added the required column `image_urls` to the `hotel` table without a default value. This is not possible if the table is not empty.
  - Made the column `name_en` on table `hotel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `opening_date` on table `hotel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `latitude` on table `hotel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longitude` on table `hotel` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `hotel` DROP COLUMN `image_url`,
    ADD COLUMN `image_urls` JSON NOT NULL,
    MODIFY `name_en` VARCHAR(128) NOT NULL,
    MODIFY `opening_date` DATE NOT NULL,
    MODIFY `latitude` DECIMAL(9, 6) NOT NULL,
    MODIFY `longitude` DECIMAL(9, 6) NOT NULL;
