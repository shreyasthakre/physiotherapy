import pool from './pool.js';
import logger from '../utils/logger.js';
import { seedDatabase } from './seedData.js';

seedDatabase()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Seed failed:', err.message);
    process.exit(1);
  });
