-- CreateTable
CREATE TABLE "art" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quotation_id" INTEGER NOT NULL,
    "dpi" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "art_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "art_fragment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "art_id" INTEGER NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "art_fragment_art_id_fkey" FOREIGN KEY ("art_id") REFERENCES "art" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
