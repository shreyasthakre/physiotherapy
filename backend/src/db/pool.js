import { fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute, resolve } from 'node:path';
import pg from 'pg';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Driver-agnostic database layer.
 *
 * Two drivers are supported and expose the same surface used across the
 * app (`query`, `exec`, `end`, `withTransaction`):
 *   - 'pg'     → a real external PostgreSQL server (via node-postgres Pool)
 *   - 'pglite' → an embedded, in-process Postgres (WASM) that persists to a
 *                local folder. Great for zero-setup local development.
 *
 * Both return query results shaped as `{ rows, rowCount }`.
 */

const isPglite = config.db.driver === 'pglite';

let driver;

if (isPglite) {
  // Lazily import so the (native-free) WASM package is only loaded when used.
  const { PGlite } = await import('@electric-sql/pglite');

  const dataDir = config.db.pgliteDir
    ? isAbsolute(config.db.pgliteDir)
      ? config.db.pgliteDir
      : resolve(process.cwd(), config.db.pgliteDir)
    : join(__dirname, '..', '..', '.pgdata');

  const db = new PGlite(dataDir);
  await db.waitReady;
  logger.info(`Using embedded PGlite database at ${dataDir}`);

  driver = {
    kind: 'pglite',
    query: async (text, params = []) => {
      const res = await db.query(text, params);
      return { rows: res.rows, rowCount: res.affectedRows ?? res.rows.length };
    },
    exec: async (sql) => {
      await db.exec(sql);
    },
    withTransaction: async (callback) => {
      return db.transaction(async (tx) => {
        const client = {
          query: async (text, params = []) => {
            const res = await tx.query(text, params);
            return { rows: res.rows, rowCount: res.affectedRows ?? res.rows.length };
          },
        };
        return callback(client);
      });
    },
    end: async () => db.close(),
  };
} else {
  const { Pool } = pg;

  const poolConfig = config.db.connectionString
    ? {
        connectionString: config.db.connectionString,
        ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
      }
    : {
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
      };

  const pool = new Pool(poolConfig);
  pool.on('error', (err) => {
    logger.error('Unexpected PostgreSQL pool error:', err.message);
  });

  driver = {
    kind: 'pg',
    query: (text, params) => pool.query(text, params),
    exec: (sql) => pool.query(sql),
    withTransaction: async (callback) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },
    end: () => pool.end(),
  };
}

/** Run a parameterised query. Returns `{ rows, rowCount }`. */
export const query = (text, params) => driver.query(text, params);

/** Execute one or more raw SQL statements (used by migrations). */
export const exec = (sql) => driver.exec(sql);

/** Run a callback inside a transaction with automatic commit/rollback. */
export const withTransaction = (callback) => driver.withTransaction(callback);

/** Which driver is active ('pg' | 'pglite'). */
export const driverKind = driver.kind;

const api = { query, exec, withTransaction, end: () => driver.end() };

export default api;
