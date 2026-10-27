import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { exec } from './pool.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Read and apply the SQL schema (idempotent). */
export const applySchema = async () => {
  const sql = await readFile(join(__dirname, 'schema.sql'), 'utf8');
  await exec(sql);
};
