import { Client } from "pg";

export const up = async (pg: Client) => {
  pg.query(`
        CREATE TABLE users(
            id int PRIMARY KEY,
            name varchar NOT NULL
        );
    `);
};

export const down = async (pg: Client) => {
  pg.query(`
        DROP TABLE users;
    `);
};
