import knex from 'knex';
import type { Knex } from 'knex';
import { ENV } from '../config/env';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: ENV.DATABASE_URL,
    pool: { min: 2, max: 10 },
  },
  production: {
    client: 'postgresql',
    connection: ENV.DATABASE_URL,
    pool: { min: 2, max: 20 },
  },
};

const environment = ENV.NODE_ENV || 'development';
export const dbKnex = knex(config[environment]);
