import fs from "fs/promises";
import fsSync from "fs";
import { CommandArgs, MigrationFiles, PgMateConfig } from "./types";
import {
  ensureMetaTableReady,
  findRows,
  getInternalClient,
  template,
} from "./utils";

const greenText = "\x1b[32m%s\x1b[0m";
const redText = "\x1b[31m%s\x1b[0m";

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

const create = async ({ migrationDir, esm, ts }: CommandArgs) => {
  const name = `migration_${Date.now()}`;
  console.log(`create migration ${name} in ${migrationDir}`);
  await fs.mkdir(migrationDir, { recursive: true });
  await fs.writeFile(`${migrationDir}/${name}.${ts ? "ts" : "js"}`, template);
  await refreshIndex({ migrationDir, esm, ts });
};

const refreshIndex = async ({
  migrationDir,
  esm,
  ts,
}: {
  migrationDir: string;
  esm: boolean;
  ts: boolean;
}) => {
  console.log("refreshIndexrefreshIndexrefreshIndex");
  const sortedFiles = await getSortedMigrationFiles({ migrationDir });
  const importContent = sortedFiles.reduce(
    (acc, name) => `${acc}
import * as ${name} from "./${name}${esm ? ".js" : ""}";
`,
    ""
  );
  const exportList = sortedFiles.reduce(
    (acc, name) => `${acc},
  ${name}`,
    ""
  );
  const content = `${importContent}

export const migrations = {
${exportList.slice(2)}
};
  `;
  await fs.writeFile(`${migrationDir}/index.${ts ? "ts" : "js"}`, content);
};

export const cli = async (config: PgMateConfig) => {
  const lastParam = process.argv[process.argv.length - 1];
  if (
    !lastParam ||
    !["migrate", "rollback", "create", "refreshIndex"].includes(lastParam)
  ) {
    return;
  }

  const mate = await init(config);
  const command = lastParam as keyof typeof mate;

  (async () => {
    await mate[command]();
    process.exit();
  })();

  return mate;
};

export const init = async (config: PgMateConfig) => {
  const internalClient = await getInternalClient(config.connexionUrl);
  const params = {
    internalClient,
    client: (await config.getClient?.()) ?? internalClient,
    migrationDir: config.migrationDir ?? "",
    migrationImports: config.migrationImports,
    esm: config.esm ?? false,
    ts: config.ts ?? false,
  };

  return {
    migrate: () => migrate(params),
    rollback: () => rollback(params),
    create: () => create(params),
    refreshIndex: () => refreshIndex(params),
  };
};

const getSortedMigrationFiles = async ({
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

const getMigrations = async ({
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

export const pgMate = {
  init,
  cli,
};
