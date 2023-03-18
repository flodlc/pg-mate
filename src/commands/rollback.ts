import { greenText, redText } from "../colors";
import { getMigrations } from "../getMigrations";
import { CommandArgs } from "../types";
import { ensureMetaTableReady, findRows } from "../utils";
export const rollback = async ({
  client,
  internalClient,
  migrationDir,
  migrationImports,
}: CommandArgs) => {
  const migrations = await getMigrations({ migrationDir, migrationImports });
  await ensureMetaTableReady({ client: internalClient });
  const rows = await findRows({ client: internalClient });

  let currentMigrationName = "";
  let done = 0;
  try {
    for (const { name } of rows) {
      currentMigrationName = name;
      await migrations[name].down(client);
      await internalClient.query(
        `DELETE FROM "pg_mate" WHERE name = '${name}'`
      );
      done++;
    }
    console.log(greenText, `success: ${done} migrations rollback executed`);
  } catch (e) {
    console.log(greenText, `${done} migrations rollback executed`);
    console.log(redText, `error: ${currentMigrationName} rollback failed`);
  }
};
