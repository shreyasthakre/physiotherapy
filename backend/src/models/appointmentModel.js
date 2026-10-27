import { query } from '../db/pool.js';

const BASE_SELECT = `
  SELECT a.*,
         p.full_name  AS patient_name,
         p.email      AS patient_email,
         p.phone      AS patient_phone,
         ph.full_name AS physiotherapist_name,
         s.name       AS service_name,
         s.slug       AS service_slug
  FROM appointments a
  JOIN users p      ON p.id = a.patient_id
  LEFT JOIN users ph ON ph.id = a.physiotherapist_id
  LEFT JOIN services s ON s.id = a.service_id
`;

export const createAppointment = async (data) => {
  const { rows } = await query(
    `INSERT INTO appointments (patient_id, physiotherapist_id, service_id, scheduled_at, duration_minutes, reason)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      data.patientId,
      data.physiotherapistId ?? null,
      data.serviceId ?? null,
      data.scheduledAt,
      data.durationMinutes ?? 45,
      data.reason ?? null,
    ],
  );
  return rows[0];
};

export const getAppointmentById = async (id) => {
  const { rows } = await query(`${BASE_SELECT} WHERE a.id = $1`, [id]);
  return rows[0] || null;
};

export const listForPatient = async (patientId) => {
  const { rows } = await query(
    `${BASE_SELECT} WHERE a.patient_id = $1 ORDER BY a.scheduled_at DESC`,
    [patientId],
  );
  return rows;
};

export const listForPhysio = async (physioId) => {
  const { rows } = await query(
    `${BASE_SELECT} WHERE a.physiotherapist_id = $1 ORDER BY a.scheduled_at DESC`,
    [physioId],
  );
  return rows;
};

export const listAll = async () => {
  const { rows } = await query(`${BASE_SELECT} ORDER BY a.scheduled_at DESC`);
  return rows;
};

/** Find appointments overlapping a time window for a physiotherapist. */
export const findConflicts = async ({ physiotherapistId, scheduledAt, durationMinutes = 45 }) => {
  if (!physiotherapistId) return [];
  const { rows } = await query(
    `SELECT id FROM appointments
     WHERE physiotherapist_id = $1
       AND status <> 'cancelled'
       AND tstzrange(scheduled_at, scheduled_at + (duration_minutes || ' minutes')::interval)
           && tstzrange($2::timestamptz, $2::timestamptz + ($3 || ' minutes')::interval)`,
    [physiotherapistId, scheduledAt, durationMinutes],
  );
  return rows;
};

export const updateStatus = async (id, status) => {
  const { rows } = await query(
    `UPDATE appointments SET status = $2 WHERE id = $1 RETURNING *`,
    [id, status],
  );
  return rows[0] || null;
};

export const updateAppointment = async (id, data) => {
  const { rows } = await query(
    `UPDATE appointments SET
       physiotherapist_id = COALESCE($2, physiotherapist_id),
       service_id = COALESCE($3, service_id),
       scheduled_at = COALESCE($4, scheduled_at),
       duration_minutes = COALESCE($5, duration_minutes),
       status = COALESCE($6, status),
       reason = COALESCE($7, reason),
       notes = COALESCE($8, notes)
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.physiotherapistId ?? null,
      data.serviceId ?? null,
      data.scheduledAt ?? null,
      data.durationMinutes ?? null,
      data.status ?? null,
      data.reason ?? null,
      data.notes ?? null,
    ],
  );
  return rows[0] || null;
};

/** Appointments in the next N hours that have not had a reminder sent. */
export const findDueReminders = async (hoursAhead = 24) => {
  const { rows } = await query(
    `${BASE_SELECT}
     WHERE a.reminder_sent_at IS NULL
       AND a.status IN ('booked','confirmed')
       AND a.scheduled_at BETWEEN now() AND now() + ($1 || ' hours')::interval`,
    [hoursAhead],
  );
  return rows;
};

export const markReminderSent = async (id) => {
  await query('UPDATE appointments SET reminder_sent_at = now() WHERE id = $1', [id]);
};
