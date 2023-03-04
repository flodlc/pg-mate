import { Client } from "pg";
export type MigrationFiles = Record<
  string,
  {
    up: (client: Client) => Promise<void>;
    down: (client: Client) => Promise<void>;
  }
>;

export type PgMateConfig = {
  connexionUrl: string;
  getClient?: () => Promise<any>;
  migrationDir?: string;
  migrationImports: MigrationFiles;
};

export type CommandArgs = {
  client: Client;
  internalClient: Client;
  migrationDir: string;
  migrationImports: MigrationFiles;
};
