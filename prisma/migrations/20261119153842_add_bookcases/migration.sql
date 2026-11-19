-- CreateEnum
CREATE TYPE "Wood" AS ENUM ('honey', 'cream', 'mint');

-- CreateTable
CREATE TABLE "bookcase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wood" "Wood" NOT NULL DEFAULT 'honey',
    "position" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookcase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookcase_userId_position_idx" ON "bookcase"("userId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "bookcase_userId_name_key" ON "bookcase"("userId", "name");

-- AddForeignKey
ALTER TABLE "bookcase" ADD CONSTRAINT "bookcase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
