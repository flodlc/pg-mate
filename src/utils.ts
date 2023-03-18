import type { Client as ClientType } from "pg";
import pg from "pg";
const { Client: Client } = pg;

export const template = `export const up = async () => {};

export const down = async () => {};
`;

export const ensureMetaTableReady = async ({
  client,
}: {
  client: ClientType;
}) => {
  await client.query(`CREATE TABLE IF NOT EXISTS "pg_mate" (
                        "id" SERIAL PRIMARY KEY,
                        "name" varchar NOT NULL,
                        "date" timestamp NOT NULL,
                        "batch_id" varchar(20) NOT NULL
                        )
                    `);
};

export const findRows = async ({ client }: { client: ClientType }) => {
  const { rows } = await client.query(`SELECT * FROM "pg_mate" ORDER BY id`);
  return rows;
};

export const getInternalClient = async (connexionUrl: string) => {
  const client = new Client(connexionUrl);
  await client.connect();
  return client;
};
