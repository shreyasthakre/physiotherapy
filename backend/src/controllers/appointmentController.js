import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as appointmentModel from '../models/appointmentModel.js';
import * as serviceModel from '../models/serviceModel.js';
import * as userModel from '../models/userModel.js';
import * as notificationModel from '../models/notificationModel.js';
import { notifyAppointmentEvent } from '../utils/appointmentNotifier.js';
import logger from '../utils/logger.js';

const isStaff = (role) => role === 'admin' || role === 'physiotherapist';

/** Map a status value to the notification event it should trigger. */
const eventForStatus = {
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  completed: 'completed',
  no_show: 'no_show',
  booked: 'scheduled',
};

/**
 * POST /api/appointments
 * - Patients book for themselves (status: booked → shows as a new consultation).
 * - Staff (admin/physio) schedule on behalf of a patient (status: confirmed)
 *   and the patient is notified automatically.
 */
export const createAppointment = asyncHandler(async (req, res) => {
  const { role, id: userId } = req.user;
  const { serviceId, physiotherapistId, scheduledAt, durationMinutes, reason } = req.body;

  // Who is the appointment for?
  let patientId = userId;
  if (isStaff(role)) {
    if (!req.body.patientId) {
      throw ApiError.badRequest('patientId is required when scheduling on behalf of a patient');
    }
    const patient = await userModel.findById(req.body.patientId);
    if (!patient || patient.role !== 'patient') {
      throw ApiError.badRequest('Selected patient does not exist');
    }
    patientId = req.body.patientId;
  }

  // Physiotherapists scheduling for a patient default to assigning themselves.
  let assignedPhysio = physiotherapistId ?? null;
  if (role === 'physiotherapist' && !assignedPhysio) assignedPhysio = userId;

  if (new Date(scheduledAt).getTime() < Date.now()) {
    throw ApiError.badRequest('Appointment time must be in the future');
  }

  let duration = durationMinutes;
  if (serviceId) {
    const service = await serviceModel.getServiceById(serviceId);
    if (!service) throw ApiError.badRequest('Selected service does not exist');
    duration = duration || service.duration_minutes;
  }

  if (assignedPhysio) {
    const conflicts = await appointmentModel.findConflicts({
      physiotherapistId: assignedPhysio,
      scheduledAt,
      durationMinutes: duration || 45,
    });
    if (conflicts.length > 0) {
      throw ApiError.conflict('The selected physiotherapist is not available at that time');
    }
  }

  const created = await appointmentModel.createAppointment({
    patientId,
    physiotherapistId: assignedPhysio,
    serviceId,
    scheduledAt,
    durationMinutes: duration,
    reason,
  });

  // Staff-scheduled sessions are confirmed immediately.
  if (isStaff(role)) {
    await appointmentModel.updateStatus(created.id, 'confirmed');
  }

  const appointment = await appointmentModel.getAppointmentById(created.id);

  // Notify the patient (WhatsApp + SMS + email). Never fail the request on this.
  let notified = null;
  try {
    notified = await notifyAppointmentEvent({
      event: 'scheduled',
      appointment,
      sentBy: userId,
    });
  } catch (err) {
    logger.warn('Failed to send booking notification:', err.message);
  }

  res.status(201).json({ appointment, notified });
});

/** GET /api/appointments — scoped to the caller's role. */
export const listAppointments = asyncHandler(async (req, res) => {
  const { id, role } = req.user;
  let appointments;
  if (role === 'admin') {
    appointments = await appointmentModel.listAll();
  } else if (role === 'physiotherapist') {
    appointments = await appointmentModel.listForPhysio(id);
  } else {
    appointments = await appointmentModel.listForPatient(id);
  }
  res.json({ appointments });
});

/** GET /api/appointments/:id */
export const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentModel.getAppointmentById(req.params.id);
  if (!appointment) throw ApiError.notFound('Appointment not found');

  const { id, role } = req.user;
  const owns = appointment.patient_id === id || appointment.physiotherapist_id === id;
  if (role !== 'admin' && !owns) throw ApiError.forbidden();

  res.json({ appointment });
});

/**
 * PATCH /api/appointments/:id
 * Patients may cancel/reschedule their own appointment. Staff may change
 * status (incl. no_show), assign a physiotherapist, and reschedule. Any
 * change automatically notifies the patient.
 */
export const updateAppointment = asyncHandler(async (req, res) => {
  const existing = await appointmentModel.getAppointmentById(req.params.id);
  if (!existing) throw ApiError.notFound('Appointment not found');

  const { id: userId, role } = req.user;
  const isOwnerPatient = existing.patient_id === userId;
  const isAssignedPhysio = existing.physiotherapist_id === userId;

  let changes;
  let event = null;

  if (role === 'patient') {
    if (!isOwnerPatient) throw ApiError.forbidden();
    if (req.body.status && req.body.status !== 'cancelled') {
      throw ApiError.forbidden('Patients can only cancel appointments');
    }
    changes = {};
    if (req.body.status) {
      changes.status = req.body.status;
      event = 'cancelled';
    }
    if (req.body.scheduledAt) {
      changes.scheduledAt = req.body.scheduledAt;
      event = event || 'rescheduled';
    }
    if (req.body.reason) changes.reason = req.body.reason;
  } else {
    // Admins have full access; physios only for their own assignments unless
    // they are (self-)assigning an unassigned appointment.
    const assigningSelf =
      role === 'physiotherapist' && req.body.physiotherapistId === userId;
    if (role === 'physiotherapist' && !isAssignedPhysio && !assigningSelf && existing.physiotherapist_id) {
      throw ApiError.forbidden();
    }
    changes = req.body;
    if (req.body.status) event = eventForStatus[req.body.status] || null;
    else if (req.body.scheduledAt) event = 'rescheduled';
  }

  await appointmentModel.updateAppointment(existing.id, changes);
  const appointment = await appointmentModel.getAppointmentById(existing.id);

  // Auto-notify the patient about the change.
  let notified = null;
  if (event) {
    try {
      notified = await notifyAppointmentEvent({
        event,
        appointment,
        sentBy: userId,
      });
    } catch (err) {
      logger.warn('Failed to send update notification:', err.message);
    }
  }

  res.json({ appointment, notified });
});

/**
 * POST /api/appointments/:id/notify — staff sends a custom update to the
 * patient over a chosen channel (WhatsApp by default).
 */
export const notifyAppointment = asyncHandler(async (req, res) => {
  const { id: userId, role } = req.user;
  if (!isStaff(role)) throw ApiError.forbidden();

  const appointment = await appointmentModel.getAppointmentById(req.params.id);
  if (!appointment) throw ApiError.notFound('Appointment not found');

  if (role === 'physiotherapist' && appointment.physiotherapist_id !== userId) {
    throw ApiError.forbidden('You can only message your own patients');
  }

  const channel = req.body.channel || 'whatsapp';
  const result = await notifyAppointmentEvent({
    event: 'custom',
    appointment,
    channels: [channel],
    customMessage: req.body.message,
    sentBy: userId,
  });

  res.status(201).json({ notified: result });
});

/** GET /api/appointments/:id/notifications — history for one appointment. */
export const listAppointmentNotifications = asyncHandler(async (req, res) => {
  const { id: userId, role } = req.user;
  const appointment = await appointmentModel.getAppointmentById(req.params.id);
  if (!appointment) throw ApiError.notFound('Appointment not found');

  const owns = appointment.patient_id === userId || appointment.physiotherapist_id === userId;
  if (role !== 'admin' && !owns) throw ApiError.forbidden();

  const notifications = await notificationModel.listForAppointment(req.params.id);
  res.json({ notifications });
});
