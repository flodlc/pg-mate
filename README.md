<h1 align="center">Pg-mate</h1>
<p align="center"><a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&duration=2000&pause=2000&center=true&width=450&height=80&lines=First+class+migrations+for+PostgreSQL." alt="Typing SVG" /></a></p>

### Pg-mate is a migration management tool for PostgreSQL databases with the following features:

- Up and down migrations
- Customizable client injection for migrations (native pg driver, zapatos, or any other client you want)
- First-class CLI and programmatic usage
- Fully written in TypeScript

---

Table of Contents:

- [Installation](#installation)
- [Setup](#setup)
- [Programmatic Usage](#programmatic-usage)
- [Using the CLI with ts-node](#using-the-cli-with-ts-node)
- [Using the CLI with node](#using-the-cli-with-node)
- [Configuration](#configuration)
- [Commands](#commands)
  - [Creating a Migration](#creating-a-migration)
  - [Running Migrations](#running-migrations)
  - [Rolling Back Migrations](#rolling-back-migrations)
  - [Refreshing the Index](#refreshing-the-index)

---

## Installation

To get started, install Pg-mate using npm or yarn:

```sh
npm install pg-mate
# or
yarn add pg-mate
```

## Setup

Next, create a migrations directory with the following structure:

```
migrations
  ├── index.ts
  └── pg-mate.ts
```

In migrations/index.ts, add the following code:

```typescript
// migrations/index.ts:
export const migrations = {};
```

In migrations/pg-mate.ts, add the following code:

```typescript
// migrations/pg-mate.ts:
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
```

> Note that `pgMate.cli(config);` enables the use of this file as a CLI

## Programmatic Usage

To use pg-mate programmatically:

```typescript
import { pgMate } from "pg-mate";
import { config } from "./migrations/pg-mate";

(async () => {
  const pgMateClient = await pgMate.init(config);
  await pgMateClient.migrate();
})();
```

## Using the CLI with ts-node

You can use ts-node to execute `pg-mate.ts` directly:

```sh
ts-node pg-mate.js <command>
```

If your `package.json` is configured for `commonjs`, it should work easily.  
If it's configured for `modules`, you will need to add the `--esm` flag:

```sh
ts-node --esm pg-mate.js <command>
```

## Using the CLI with node

You can compile the `pg-mate.ts` file as you would with your app. Then, invoke the CLI as follows:

```sh
node dist/pg-mate.js <command>
```

---

## Configuration

Below is the `PgMateConfig` definition with default values:

```typescript
type PgMateConfig = {
  /**
   * Exemple: "postgresql://postgres:password@localhost:5432/postgres"
   */
  connexionUrl: string;
  /**
   * Allows injecting a custom db client in migration functions.
   * Default: native pg driver
   * Exemple: () => knexClient
   */
  getClient?: () => Promise<any>;
  /**
   * Should not be modified except for very specific reasons.
   * Default: __dirname
   */
  migrationDir: string;
  /**
   * Must be the migrations import (required)
   */
  migrationImports: MigrationFiles;
  /**
   * If type: "module" in package.json => true
   * Default: false
   */
  esm?: boolean;
  /**
   * Used to use the correction extension in migrations directory.
   * Default: false
   */
  ts?: boolean;
};
```

## Commands

### Creating a Migration

```sh
pgMateClient.create({ name: 'hello' })
# or
node pg-mate.js create <name>
# or
ts-node pg-mate.ts create <name>
```

```typescript
import { Client } from "pg";

export const up = async (pg: Client) => {
  pg.query(`
        CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            name varchar NOT NULL
        );
    `);
};

export const down = async (pg: Client) => {
  pg.query(`DROP TABLE users;`);
};
```

### Running Migrations

To run migrations, use the following command:

```sh
pgMateClient.migrate()
# or
node pg-mate.js migrate
# or
ts-node pg-mate.ts migrate
```

### Rolling Back Migrations

To rollback a migration, use the following command:

```sh
pgMateClient.rollback()
# or
node pg-mate.js rollback
# or
ts-node pg-mate.ts rollback
```

### Refreshing the Index

The migrations are imported using the index file in the migrations directory. This file is automatically updated after a new migration is created.  
If needed, the refreshIndex command can trigger an update of the index.

> In the index, migrations should be listed in the same order as the migration files (alphabetical-ordered).  
> If the index is corrupted, an exception will be thrown during command execution.

```sh
pgMateClient.refreshIndex()
# or
node pg-mate.js refreshIndex
# or
ts-node pg-mate.ts refreshIndex
```

---

That's it! You can now use pg-mate to manage your Postgresql database migrations.
