/*
  Warnings:

  - You are about to drop the column `role` on the `TaskMembers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'TODO';

-- AlterTable
ALTER TABLE "TaskMembers" DROP COLUMN "role";
