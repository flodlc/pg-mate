import { pgMate, PgMateConfig } from "@flodlc/pg-mate";
import { migrations } from "./migrations/index.js";

export const config: PgMateConfig = {
  connexionUrl: "postgresql://postgres:password@localhost:5432/postgres",
  migrationImports: migrations,
  migrationDir: "migrations",
};

pgMate.initCli(config);
