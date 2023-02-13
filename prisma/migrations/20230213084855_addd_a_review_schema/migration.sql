/*
  Warnings:

  - You are about to drop the column `createdDate` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `downvotes` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `modifieddate` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `upvotes` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Review` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "RoomType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "expiryInterval" INTEGER NOT NULL,
    "totalNumber" INTEGER NOT NULL,
    "hotelId" INTEGER NOT NULL,
    CONSTRAINT "RoomType_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotels" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startTime" DATETIME NOT NULL,
    "lifetime" INTEGER NOT NULL,
    "occupancy" BOOLEAN NOT NULL,
    "occupancyLifetime" INTEGER NOT NULL,
    "roomTypeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Reservation_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hotels" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hotel_name" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "hotel_image" TEXT NOT NULL DEFAULT 'hotel-694bfd2d-0672-4953-893e-a4ebd192ae53.png',
    "averageRating" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Hotels" ("email", "hotel_image", "hotel_name", "id", "latitude", "longitude", "password_hash", "user_name") SELECT "email", "hotel_image", "hotel_name", "id", "latitude", "longitude", "password_hash", "user_name" FROM "Hotels";
DROP TABLE "Hotels";
ALTER TABLE "new_Hotels" RENAME TO "Hotels";
CREATE UNIQUE INDEX "Hotels_hotel_name_key" ON "Hotels"("hotel_name");
CREATE UNIQUE INDEX "Hotels_user_name_key" ON "Hotels"("user_name");
CREATE UNIQUE INDEX "Hotels_email_key" ON "Hotels"("email");
CREATE TABLE "new_Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "authorId" INTEGER NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotels" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("hotelId", "id", "rating", "text") SELECT "hotelId", "id", "rating", "text" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "RoomType_name_key" ON "RoomType"("name");
