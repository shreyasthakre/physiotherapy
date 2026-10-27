import { query } from '../db/pool.js';

export const listTestimonials = async ({ featuredOnly = true } = {}) => {
  const where = featuredOnly ? 'WHERE is_featured = TRUE' : '';
  const { rows } = await query(
    `SELECT * FROM testimonials ${where} ORDER BY created_at DESC`,
  );
  return rows;
};

export const createTestimonial = async (data) => {
  const { rows } = await query(
    `INSERT INTO testimonials (patient_name, avatar_url, rating, quote, location, is_featured)
     VALUES ($1,$2,$3,$4,$5, COALESCE($6, TRUE))
     RETURNING *`,
    [
      data.patientName,
      data.avatarUrl ?? null,
      data.rating ?? 5,
      data.quote,
      data.location ?? null,
      data.isFeatured,
    ],
  );
  return rows[0];
};

export const deleteTestimonial = async (id) => {
  const { rowCount } = await query('DELETE FROM testimonials WHERE id = $1', [id]);
  return rowCount > 0;
};
