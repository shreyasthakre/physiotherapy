import { sendEmail, sendSms, sendWhatsApp, sendCall } from './notifications.js';
import * as notificationModel from '../models/notificationModel.js';
import config from '../config/index.js';
import logger from './logger.js';

const CLINIC = 'The Physiotherapy Clinic';

const formatWhen = (iso) =>
  new Date(iso).toLocaleString('en-AU', { dateStyle: 'full', timeStyle: 'short' });

/**
 * Build a patient-friendly message for a given appointment lifecycle event.
 * `appointment` is the enriched row (with patient_name, service_name, ...).
 */
export const buildMessage = (event, appointment) => {
  const name = appointment.patient_name?.split(' ')[0] || 'there';
  const service = appointment.service_name || 'physiotherapy';
  const when = formatWhen(appointment.scheduled_at);

  switch (event) {
    case 'scheduled':
      return `Hi ${name}, your ${service} session at ${CLINIC} is scheduled for ${when}. See you then!`;
    case 'confirmed':
      return `Hi ${name}, your ${service} appointment on ${when} is confirmed. We look forward to seeing you.`;
    case 'rescheduled':
      return `Hi ${name}, your ${service} appointment has been rescheduled to ${when}. Reply to confirm.`;
    case 'cancelled':
      return `Hi ${name}, your ${service} appointment on ${when} has been cancelled. Please contact ${CLINIC} to rebook.`;
    case 'completed':
      return `Hi ${name}, thank you for visiting ${CLINIC} today. Your exercise plan and notes are available in your patient portal.`;
    case 'no_show':
      return `Hi ${name}, we missed you at your ${when} session. Please reschedule with ${CLINIC} at your convenience.`;
    case 'reminder':
      return `Reminder from ${CLINIC}: your ${service} session is on ${when}.`;
    default:
      return `Update from ${CLINIC} regarding your appointment on ${when}.`;
  }
};

const CHANNEL_SENDERS = {
  whatsapp: (appt, message) => sendWhatsApp({ to: appt.patient_phone, body: message }),
  sms: (appt, message) => sendSms({ to: appt.patient_phone, body: message }),
  call: (appt, message) => sendCall({ to: appt.patient_phone, message }),
  email: (appt, message) =>
    sendEmail({ to: appt.patient_email, subject: `${CLINIC} — appointment update`, text: message }),
};

/**
 * Channels we attempt by default, based on what's actually configured:
 *  - SMS is always attempted (real Twilio send when credentials are set,
 *    otherwise a console demo log).
 *  - WhatsApp only when a WhatsApp sender is configured (avoids logging a
 *    misleading "WhatsApp sent" when it isn't really wired up).
 *  - Email only when SMTP (or the dev preview) is enabled.
 */
const defaultChannels = () => {
  const list = ['sms'];
  if (config.sms.whatsappFrom) list.unshift('whatsapp');
  if (config.smtp.enabled) list.push('email');
  return list;
};

/**
 * Send an appointment notification across one or more channels and persist
 * each to the notifications log. Never throws — failures are logged and
 * recorded with status 'failed'.
 *
 * @returns {Promise<{message:string, sent:Array}>}
 */
export const notifyAppointmentEvent = async ({
  event,
  appointment,
  channels,
  customMessage,
  sentBy,
}) => {
  const activeChannels = channels || defaultChannels();
  const message = customMessage || buildMessage(event, appointment);
  const sent = [];

  const hasRealEmail =
    appointment.patient_email && !/@no-login\./i.test(appointment.patient_email);

  for (const channel of activeChannels) {
    const sender = CHANNEL_SENDERS[channel];
    if (!sender) continue;

    // Skip channels we can't actually deliver to, so the log stays truthful.
    if (channel === 'email' && !hasRealEmail) {
      logger.info(`[notify] Skipping email for ${appointment.patient_name}: no email on file.`);
      continue;
    }
    if (channel !== 'email' && !appointment.patient_phone) {
      logger.info(`[notify] Skipping ${channel} for ${appointment.patient_name}: no phone on file.`);
      continue;
    }

    let status = 'sent';
    try {
      await sender(appointment, message);
    } catch (err) {
      status = 'failed';
      logger.warn(`Notification via ${channel} failed:`, err.message);
    }
    try {
      const record = await notificationModel.logNotification({
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        sentBy,
        channel,
        event,
        message,
        status,
      });
      // Only report channels that actually went out, so the UI is truthful.
      if (status === 'sent') sent.push(record);
    } catch (err) {
      logger.warn('Failed to log notification:', err.message);
    }
  }

  return { message, sent };
};
