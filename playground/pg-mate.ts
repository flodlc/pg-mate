import { migrations } from "./migrations/index";
import { pgMate } from "../dist";
import { PgMateConfig } from "../dist";

export const config: PgMateConfig = {
  connexionUrl: "postgresql://postgres:password@localhost:5432/postgres",
  migrationImports: migrations,
  migrationDir: "playground/migrations",
};

pgMate.initCli(config);
