import { Client } from "pg";
export type MigrationFiles = Record<
  string,
  {
    up: (client: any) => Promise<void>;
    down: (client: any) => Promise<void>;
  }
>;

export type PgMateConfig = {
  connexionUrl: string;
  getClient?: () => any;
  migrationDir: string;
  migrationImports: MigrationFiles;
  esm?: boolean;
  ts?: boolean;
};

export type CommandArgs = {
  client: Client;
  internalClient: Client;
  migrationDir: string;
  migrationImports: MigrationFiles;
  esm: boolean;
  ts: boolean;
};
