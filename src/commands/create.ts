import fs from "fs/promises";
import { CommandArgs } from "../types";
import { template } from "../utils";
import { refreshIndex } from "./refreshIndex";

export const create = async ({ migrationDir, esm, ts }: CommandArgs) => {
  const name = `migration_${Date.now()}`;
  console.log(`create migration ${name} in ${migrationDir}`);
  await fs.mkdir(migrationDir, { recursive: true });
  await fs.writeFile(`${migrationDir}/${name}.${ts ? "ts" : "js"}`, template);
  await refreshIndex({ migrationDir, esm, ts });
};
