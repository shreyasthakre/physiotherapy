import { query } from '../db/pool.js';

const PUBLIC_FIELDS = 'id, role, full_name, email, phone, is_active, created_at';

export const findByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

export const findById = async (id) => {
  const { rows } = await query(
    `SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
};

export const createUser = async ({ role = 'patient', fullName, email, passwordHash, phone }) => {
  const { rows } = await query(
    `INSERT INTO users (role, full_name, email, password_hash, phone)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING ${PUBLIC_FIELDS}`,
    [role, fullName, email, passwordHash, phone || null],
  );
  return rows[0];
};

export const listByRole = async (role) => {
  const { rows } = await query(
    `SELECT ${PUBLIC_FIELDS} FROM users WHERE role = $1 ORDER BY full_name`,
    [role],
  );
  return rows;
};

export const listUsers = async () => {
  const { rows } = await query(
    `SELECT ${PUBLIC_FIELDS} FROM users ORDER BY created_at DESC`,
  );
  return rows;
};

export const updateRole = async (id, role) => {
  const { rows } = await query(
    `UPDATE users SET role = $2 WHERE id = $1 RETURNING ${PUBLIC_FIELDS}`,
    [id, role],
  );
  return rows[0] || null;
};
