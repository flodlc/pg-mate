import fs from "fs/promises";
import { greenText } from "src/colors";
import { CommandArgs } from "../types";
import { template } from "../utils";
import { refreshIndex } from "./refreshIndex";

export const create = async ({
  name,
  migrationDir,
  esm,
  ts,
}: CommandArgs & { name?: string }) => {
  const migrationName = `migration_${Date.now()}` + (name ? `_${name}` : "");
  console.log(greenText, `1 migration created: ${migrationName}`);
  await fs.mkdir(migrationDir, { recursive: true });
  await fs.writeFile(
    `${migrationDir}/${migrationName}.${ts ? "ts" : "js"}`,
    template
  );
  await refreshIndex({ migrationDir, esm, ts });
};
