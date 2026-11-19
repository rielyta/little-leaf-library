-- CreateTable
CREATE TABLE "saved_word" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "partOfSpeech" TEXT,
    "definition" TEXT,
    "page" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_word_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_word_userId_idx" ON "saved_word"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_word_bookId_word_key" ON "saved_word"("bookId", "word");

-- AddForeignKey
ALTER TABLE "saved_word" ADD CONSTRAINT "saved_word_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_word" ADD CONSTRAINT "saved_word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
