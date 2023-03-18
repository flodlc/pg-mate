import { create } from "./commands/create";
import { migrate } from "./commands/migrate";
import { refreshIndex } from "./commands/refreshIndex";
import { rollback } from "./commands/rollback";
import { PgMateConfig } from "./types";
import { getInternalClient } from "./utils";

const cli = async (config: PgMateConfig) => {
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

const init = async (config: PgMateConfig) => {
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

export const pgMate = {
  init,
  cli,
};
