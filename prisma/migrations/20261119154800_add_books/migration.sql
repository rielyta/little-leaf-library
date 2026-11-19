-- CreateTable
CREATE TABLE "book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "pageCount" INTEGER NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileKey" TEXT NOT NULL,
    "spineColor" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "lastReadPage" INTEGER NOT NULL DEFAULT 0,
    "bookcaseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "book_fileKey_key" ON "book"("fileKey");

-- CreateIndex
CREATE INDEX "book_bookcaseId_position_idx" ON "book"("bookcaseId", "position");

-- CreateIndex
CREATE INDEX "book_userId_idx" ON "book"("userId");

-- AddForeignKey
ALTER TABLE "book" ADD CONSTRAINT "book_bookcaseId_fkey" FOREIGN KEY ("bookcaseId") REFERENCES "bookcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book" ADD CONSTRAINT "book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
