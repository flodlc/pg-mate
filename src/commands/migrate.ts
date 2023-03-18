import { greenText, redText } from "../colors";
import { getMigrations } from "../getMigrations";
import { CommandArgs } from "../types";
import { ensureMetaTableReady, findRows } from "../utils";
export const migrate = async ({
  client,
  internalClient,
  migrationDir,
  migrationImports,
}: CommandArgs) => {
  await ensureMetaTableReady({ client: internalClient });
  const migrations = await getMigrations({ migrationDir, migrationImports });
  const rows = await findRows({ client: internalClient });
  const migrationEntries = Object.entries(migrations);
  let currentMigrationName = "";
  let done = 0;

  try {
    for (const [name, { up }] of migrationEntries) {
      currentMigrationName = name;
      const exist = rows.some((row) => row.name === name);
      if (exist) continue;
      await up(client);
      await internalClient.query(
        `INSERT INTO "pg_mate"(name, date) VALUES('${name}', NOW())`
      );
      done++;
    }
    console.log(greenText, `success: ${done} migrations executed`);
  } catch (e) {
    console.log(greenText, `${done} migrations executed`);
    console.log(redText, `error: ${currentMigrationName} failed`);
  }
};
