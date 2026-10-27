import { query } from '../db/pool.js';

export const logNotification = async ({
  appointmentId,
  patientId,
  sentBy,
  channel,
  event,
  message,
  status = 'sent',
}) => {
  const { rows } = await query(
    `INSERT INTO notifications (appointment_id, patient_id, sent_by, channel, event, message, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [appointmentId ?? null, patientId ?? null, sentBy ?? null, channel, event ?? null, message, status],
  );
  return rows[0];
};

const BASE_SELECT = `
  SELECT n.*, p.full_name AS patient_name
  FROM notifications n
  LEFT JOIN users p ON p.id = n.patient_id
`;

export const listRecent = async (limit = 25) => {
  const { rows } = await query(
    `${BASE_SELECT} WHERE n.status = 'sent' ORDER BY n.created_at DESC LIMIT $1`,
    [limit],
  );
  return rows;
};

export const listForAppointment = async (appointmentId) => {
  const { rows } = await query(
    `${BASE_SELECT} WHERE n.appointment_id = $1 AND n.status = 'sent' ORDER BY n.created_at DESC`,
    [appointmentId],
  );
  return rows;
};
