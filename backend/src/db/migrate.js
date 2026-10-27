import pool, { driverKind } from './pool.js';
import { applySchema } from './applySchema.js';
import logger from '../utils/logger.js';

const run = async () => {
  logger.info(`Applying database schema (driver: ${driverKind})...`);
  await applySchema();
  logger.info('Schema applied successfully.');
};

run()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Migration failed:', err.message);
    process.exit(1);
  });
