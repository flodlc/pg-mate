import { pgMate, PgMateConfig } from "pg-mate";
import { migrations } from "./index";

export const config: PgMateConfig = {
  connexionUrl: "postgresql://postgres:password@localhost:5432/postgres",
  migrationImports: migrations,
  migrationDir: __dirname,
  esm: false,
  ts: true,
};

pgMate.cli(config);
