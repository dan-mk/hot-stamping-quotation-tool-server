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
