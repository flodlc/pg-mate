import fs from "fs/promises";
import fsSync from "fs";
import { redText } from "./colors";
export const getSortedMigrationFiles = async ({
  migrationDir,
}: {
  migrationDir: string;
}) => {
  const migrationDirExists = fsSync.existsSync(migrationDir);
  if (!migrationDirExists) {
    console.log(
      redText,
      `
  Migration directory "${migrationDir}" does not exist.
  Check the "migrationDir" value in your config
  `
    );
  }
  const files = await (await fs.readdir(migrationDir))
    .filter((file) => file.startsWith("migration_"))
    .map((file) => file.replace(/(\.ts|\.js)/, ""));
  return files.slice().sort();
};
