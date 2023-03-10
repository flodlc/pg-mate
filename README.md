<h1 align="center">Pg-mate</h1>
<p align="center">First class migrations for Postgresql.</p>

### Pg-mate is a migration management tool for Postgresql databases with the following features:

- Up and down migrations
- Customizable client injection for migrations (native pg driver, zapatos, or any other client you want)
- First-class CLI and programmatic usage
- Fully written in TypeScript
<hr>

## Installation

```sh
npm install pg-mate
# or
yarn add pg-mate
```

Then

```sh
npx pg-mate init
```

## Usage

### Create migration

```sh
pgMateClient.create()
# or
node pg-mate.js --create
# or
ts-node pg-mate.ts --create
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

### Migrate

To run migrations, use the following command:

```sh
pgMateClient.migrate()
# or
node pg-mate.js --migrate
# or
ts-node pg-mate.ts --migrate
```

### Rollback

To rollback a migration, use the following command:

```sh
pgMateClient.rollback()
# or
node pg-mate.js --rollback
# or
ts-node pg-mate.ts --rollback
```

### Refresh Index

The migrations are imported using the index file in the migrations directory. This file is automatically updated after a new migration is created.  
If needed, the refreshIndex command can trigger an update of the index.

> In the index, migrations should be listed in the same order as the migration files (alphabetical-ordered).  
> If the index is corrupted, an exception will be thrown during command execution.

```sh
pgMateClient.refreshIndex()
# or
node pg-mate.js --refreshIndex
# or
ts-node pg-mate.ts --refreshIndex
```

### Basic

...

That's it! You can now use pg-mate to manage your Postgresql database migrations.
