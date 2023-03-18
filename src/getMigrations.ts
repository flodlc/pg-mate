import { getSortedMigrationFiles } from "./getSortedMigrationFiles";
import { MigrationFiles } from "./types";
export const getMigrations = async ({
  migrationDir,
  migrationImports,
}: {
  migrationDir: string;
  migrationImports: MigrationFiles;
}): Promise<MigrationFiles> => {
  const sortedFiles = await getSortedMigrationFiles({ migrationDir });

  const isCorrupted = Object.entries(migrationImports).some(
    ([name], i) => name !== sortedFiles[i]?.replace(/(\.ts|\.js)/, "")
  );

  if (isCorrupted) {
    throw "migrations index is corrupted";
  }

  return migrationImports;
};
