-- CreateEnum
CREATE TYPE "HighlightColor" AS ENUM ('pink', 'blue', 'green', 'yellow');

-- CreateTable
CREATE TABLE "highlight" (
    "id" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "color" "HighlightColor" NOT NULL,
    "text" TEXT NOT NULL,
    "rects" JSONB NOT NULL,
    "note" TEXT,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "highlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "highlight_bookId_page_idx" ON "highlight"("bookId", "page");

-- CreateIndex
CREATE INDEX "highlight_userId_idx" ON "highlight"("userId");

-- AddForeignKey
ALTER TABLE "highlight" ADD CONSTRAINT "highlight_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlight" ADD CONSTRAINT "highlight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
