import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import pool, { driverKind } from './db/pool.js';
import { initEmbeddedDatabase } from './db/init.js';
import { startReminderJob } from './jobs/reminderJob.js';

let stopReminderJob;

const start = async () => {
  // Embedded PGlite: create schema + seed automatically on first boot.
  if (driverKind === 'pglite') {
    try {
      await initEmbeddedDatabase();
    } catch (err) {
      logger.error('Failed to initialise embedded database:', err.message);
    }
  }

  const server = app.listen(config.port, () => {
    logger.info(
      `The Physiotherapy Clinic API listening on http://localhost:${config.port} (${config.env}, db: ${driverKind})`,
    );
  });

  // For external PostgreSQL, verify connectivity (non-fatal).
  if (driverKind === 'pg') {
    pool
      .query('SELECT 1')
      .then(() => logger.info('Connected to PostgreSQL.'))
      .catch((err) =>
        logger.warn(
          `PostgreSQL not reachable: ${err.message}. Run "npm run db:migrate" / check your .env, or set DB_DRIVER=pglite for a zero-setup local database.`,
        ),
      );
  }

  stopReminderJob = startReminderJob();

  const shutdown = (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    stopReminderJob?.();
    server.close(() => {
      Promise.resolve(pool.end()).finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
});

start();
