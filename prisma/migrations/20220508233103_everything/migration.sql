-- CreateTable
CREATE TABLE "client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "quotation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "client_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "quotation_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "art" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "index" INTEGER NOT NULL,
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

-- CreateTable
CREATE TABLE "configuration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quotation_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "next_cliche_id" INTEGER NOT NULL,
    "next_cliche_group_id" INTEGER NOT NULL,
    "next_foil_id" INTEGER NOT NULL,
    "arts" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "configuration_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
