-- DropForeignKey
ALTER TABLE "ProjectMembers" DROP CONSTRAINT "ProjectMembers_userId_fkey";

-- DropForeignKey
ALTER TABLE "TaskMembers" DROP CONSTRAINT "TaskMembers_userId_fkey";

-- AddForeignKey
ALTER TABLE "ProjectMembers" ADD CONSTRAINT "ProjectMembers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMembers" ADD CONSTRAINT "TaskMembers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
