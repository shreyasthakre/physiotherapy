import { query } from '../db/pool.js';

export const listForPatient = async (patientId, type) => {
  const params = [patientId];
  let sql = `SELECT r.*, ph.full_name AS physiotherapist_name
             FROM patient_records r
             LEFT JOIN users ph ON ph.id = r.physiotherapist_id
             WHERE r.patient_id = $1`;
  if (type) {
    params.push(type);
    sql += ` AND r.type = $2`;
  }
  sql += ' ORDER BY r.created_at DESC';
  const { rows } = await query(sql, params);
  return rows;
};

export const getById = async (id) => {
  const { rows } = await query('SELECT * FROM patient_records WHERE id = $1', [id]);
  return rows[0] || null;
};

export const createRecord = async (data) => {
  const { rows } = await query(
    `INSERT INTO patient_records (patient_id, physiotherapist_id, type, title, body, data)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      data.patientId,
      data.physiotherapistId ?? null,
      data.type,
      data.title,
      data.body ?? null,
      JSON.stringify(data.data ?? {}),
    ],
  );
  return rows[0];
};

export const deleteRecord = async (id) => {
  const { rowCount } = await query('DELETE FROM patient_records WHERE id = $1', [id]);
  return rowCount > 0;
};
