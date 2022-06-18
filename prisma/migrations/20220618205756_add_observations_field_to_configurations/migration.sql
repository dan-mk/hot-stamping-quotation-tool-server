-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_configuration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quotation_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "next_cliche_id" INTEGER NOT NULL,
    "next_cliche_group_id" INTEGER NOT NULL,
    "next_foil_id" INTEGER NOT NULL,
    "next_quotation_instance_id" INTEGER NOT NULL,
    "observations" TEXT NOT NULL DEFAULT '',
    "arts" TEXT NOT NULL,
    "quotation_instances" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "configuration_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_configuration" ("arts", "created_at", "description", "id", "next_cliche_group_id", "next_cliche_id", "next_foil_id", "next_quotation_instance_id", "quotation_id", "quotation_instances", "updated_at") SELECT "arts", "created_at", "description", "id", "next_cliche_group_id", "next_cliche_id", "next_foil_id", "next_quotation_instance_id", "quotation_id", "quotation_instances", "updated_at" FROM "configuration";
DROP TABLE "configuration";
ALTER TABLE "new_configuration" RENAME TO "configuration";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
