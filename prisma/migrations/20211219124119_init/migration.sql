/*
  Warnings:

  - A unique constraint covering the columns `[position]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "position" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Task_position_key" ON "Task"("position");
