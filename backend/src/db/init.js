import { query } from './pool.js';
import { applySchema } from './applySchema.js';
import { seedDatabase } from './seedData.js';
import logger from '../utils/logger.js';

/**
 * Prepare the embedded database on startup: apply the schema (idempotent)
 * and seed demo content the first time (when the users table is empty).
 * Runs entirely in-process, which suits the single-connection PGlite driver.
 */
export const initEmbeddedDatabase = async () => {
  await applySchema();
  const { rows } = await query('SELECT COUNT(*)::int AS count FROM users');
  if (rows[0].count === 0) {
    logger.info('Embedded database is empty — seeding demo data...');
    await seedDatabase();
  } else {
    logger.info('Embedded database ready.');
  }
};
