import { query } from '../db/pool.js';

export const listServices = async ({ includeInactive = false } = {}) => {
  const where = includeInactive ? '' : 'WHERE is_active = TRUE';
  const { rows } = await query(
    `SELECT * FROM services ${where} ORDER BY name`,
  );
  return rows;
};

export const getServiceBySlug = async (slug) => {
  const { rows } = await query('SELECT * FROM services WHERE slug = $1', [slug]);
  return rows[0] || null;
};

export const getServiceById = async (id) => {
  const { rows } = await query('SELECT * FROM services WHERE id = $1', [id]);
  return rows[0] || null;
};

export const createService = async (data) => {
  const { rows } = await query(
    `INSERT INTO services (slug, name, category, short_description, description, duration_minutes, price, image_url, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8, COALESCE($9, TRUE))
     RETURNING *`,
    [
      data.slug,
      data.name,
      data.category ?? null,
      data.shortDescription ?? null,
      data.description ?? null,
      data.durationMinutes ?? 45,
      data.price ?? 0,
      data.imageUrl ?? null,
      data.isActive,
    ],
  );
  return rows[0];
};

export const updateService = async (id, data) => {
  const { rows } = await query(
    `UPDATE services SET
       name = COALESCE($2, name),
       category = COALESCE($3, category),
       short_description = COALESCE($4, short_description),
       description = COALESCE($5, description),
       duration_minutes = COALESCE($6, duration_minutes),
       price = COALESCE($7, price),
       image_url = COALESCE($8, image_url),
       is_active = COALESCE($9, is_active)
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.name ?? null,
      data.category ?? null,
      data.shortDescription ?? null,
      data.description ?? null,
      data.durationMinutes ?? null,
      data.price ?? null,
      data.imageUrl ?? null,
      data.isActive ?? null,
    ],
  );
  return rows[0] || null;
};

export const deleteService = async (id) => {
  const { rowCount } = await query('DELETE FROM services WHERE id = $1', [id]);
  return rowCount > 0;
};
