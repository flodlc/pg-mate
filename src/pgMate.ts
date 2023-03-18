import { create } from "./commands/create";
import { migrate } from "./commands/migrate";
import { refreshIndex } from "./commands/refreshIndex";
import { rollback } from "./commands/rollback";
import { PgMateConfig } from "./types";
import { getInternalClient } from "./utils";

const isValidCommand = (
  command: string
): command is keyof Awaited<ReturnType<typeof init>> => {
  return !!(
    command &&
    ["migrate", "rollback", "create", "refreshIndex"].includes(command)
  );
};

const cli = async (config: PgMateConfig) => {
  const command = process.argv[2];
  const cliparam = process.argv[3];

  if (!isValidCommand(command)) return;

  const mate = await init(config);

  (async () => {
    switch (command) {
      case "create":
        await mate.create({ name: cliparam });
        break;
      default:
        await mate[command]();
        break;
    }

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
    create: (args: { name?: string }) => create({ ...params, ...args }),
    refreshIndex: () => refreshIndex(params),
  };
};

export const pgMate = {
  init,
  cli,
};
