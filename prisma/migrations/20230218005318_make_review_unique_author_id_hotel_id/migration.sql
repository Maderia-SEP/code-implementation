/*
  Warnings:

  - A unique constraint covering the columns `[authorId,hotelId]` on the table `review` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "review_authorId_hotelId_key" ON "review"("authorId", "hotelId");
