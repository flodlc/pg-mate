import { pgMate, PgMateConfig } from "pg-mate";
import { migrations } from "./migrations/index";

export const config: PgMateConfig = {
  connexionUrl: "postgresql://postgres:password@localhost:5432/postgres",
  migrationImports: migrations,
  migrationDir: "migrations",
  esm: false,
  ts: true,
};

pgMate.initCli(config);
