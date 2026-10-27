import { query } from '../db/pool.js';

export const createContactMessage = async (data) => {
  const { rows } = await query(
    `INSERT INTO contact_messages (name, email, phone, subject, message)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [data.name, data.email, data.phone ?? null, data.subject ?? null, data.message],
  );
  return rows[0];
};

export const listContactMessages = async () => {
  const { rows } = await query(
    'SELECT * FROM contact_messages ORDER BY created_at DESC',
  );
  return rows;
};

export const addSubscriber = async ({ email, firstName }) => {
  const { rows } = await query(
    `INSERT INTO newsletter_subscribers (email, first_name)
     VALUES ($1,$2)
     ON CONFLICT (email) DO UPDATE SET first_name = COALESCE(EXCLUDED.first_name, newsletter_subscribers.first_name)
     RETURNING *`,
    [email, firstName ?? null],
  );
  return rows[0];
};
