-- CreateTable
CREATE TABLE "bookmark" (
    "id" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookmark_userId_idx" ON "bookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bookmark_bookId_page_key" ON "bookmark"("bookId", "page");

-- AddForeignKey
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
