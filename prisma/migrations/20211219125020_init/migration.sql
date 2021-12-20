/*
  Warnings:

  - You are about to drop the column `position` on the `Task` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Task_position_key";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "position";
