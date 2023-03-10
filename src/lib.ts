import fs from "fs/promises";
import { CommandArgs, MigrationFiles, PgMateConfig } from "./types";
import {
  ensureMetaTableReady,
  findRows,
  getInternalClient,
  template,
} from "./utils";

export const migrate = async ({
  client,
  internalClient,
  migrationDir,
  migrationImports,
}: CommandArgs) => {
  await ensureMetaTableReady({ client: internalClient });
  const migrations = await getMigrations({
    migrationDir: migrationDir ?? "migrations",
    migrationImports,
  });
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
    console.log(`success: ${done} migrations executed`);
  } catch (e) {
    console.log(`error: ${currentMigrationName} failed`);
  }
};

export const rollback = async ({
  client,
  internalClient,
  migrationDir,
  migrationImports,
}: CommandArgs) => {
  const migrations = await getMigrations({
    migrationDir: migrationDir ?? "migrations",
    migrationImports,
  });
  await ensureMetaTableReady({ client: internalClient });
  const rows = await findRows({ client: internalClient });
  for (const { name } of rows) {
    await migrations[name].down(client);
    await internalClient.query(`DELETE FROM "pg_mate" WHERE name = '${name}'`);
  }
};

const create = async ({ migrationDir, migrationImports }: CommandArgs) => {
  const name = `migration_${Date.now()}`;
  console.log(`create migration ${name} in ${migrationDir}`);
  await fs.mkdir(migrationDir, { recursive: true });
  await fs.writeFile(`${migrationDir}/${name}.ts`, template);
  await refreshIndex({ migrationDir, migrationImports });
};

const refreshIndex = async ({
  migrationDir,
  migrationImports,
}: {
  migrationDir: string;
  migrationImports: MigrationFiles;
}) => {
  const sortedFiles = await getSortedMigrationFiles({ migrationDir });
  const importContent = sortedFiles.reduce(
    (acc, name) => `${acc}
import * as ${name} from "./${name}";
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
  await fs.writeFile(`${migrationDir}/index.ts`, content);
};

export const initCli = async (config: PgMateConfig) => {
  const commands = process.argv.filter((item) =>
    ["--migrate", "--rollback", "--create", "--refreshIndex"].includes(item)
  );

  if (commands.length !== 1) {
    console.log("wrong command");
    return;
  }

  const command = commands[0].replace("--", "") as
    | "migrate"
    | "rollback"
    | "create"
    | "refreshIndex";

  const mate = await init(config);

  (async () => {
    await mate[command]();
    process.exit();
  })();
};

export const init = async (config: PgMateConfig) => {
  const internalClient = await getInternalClient(config.connexionUrl);
  const params = {
    internalClient,
    client: (await config.getClient?.()) ?? internalClient,
    migrationDir: config.migrationDir ?? "migrations",
    migrationImports: config.migrationImports,
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
  const files = await (await fs.readdir(migrationDir))
    .filter((file) => !file.includes("index"))
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
  initCli,
  init,
};
