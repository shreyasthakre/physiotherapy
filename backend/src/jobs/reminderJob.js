import * as appointmentModel from '../models/appointmentModel.js';
import { sendEmail, sendSms } from '../utils/notifications.js';
import logger from '../utils/logger.js';

const ONE_HOUR = 60 * 60 * 1000;

/**
 * Periodically scans for appointments happening within the next 24h that
 * have not yet had a reminder sent, and dispatches email/SMS reminders.
 *
 * Uses a simple setInterval — for production you'd swap this for a proper
 * scheduler (node-cron, BullMQ, or a cloud cron trigger).
 */
export const runReminderSweep = async () => {
  const due = await appointmentModel.findDueReminders(24);
  for (const appt of due) {
    const when = new Date(appt.scheduled_at).toLocaleString('en-AU', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
    try {
      await sendEmail({
        to: appt.patient_email,
        subject: 'Reminder: your physiotherapy appointment is tomorrow',
        text: `Hi ${appt.patient_name},\n\nThis is a friendly reminder of your appointment (${appt.service_name || 'Physiotherapy'}) on ${when}.\n\nSee you soon!\n\n— The Physiotherapy Clinic`,
      });
      if (appt.patient_phone) {
        await sendSms({
          to: appt.patient_phone,
          body: `The Physiotherapy Clinic reminder: appointment on ${when}.`,
        });
      }
      await appointmentModel.markReminderSent(appt.id);
    } catch (err) {
      logger.warn(`Reminder for appointment ${appt.id} failed:`, err.message);
    }
  }
  if (due.length) logger.info(`Processed ${due.length} appointment reminder(s).`);
};

export const startReminderJob = () => {
  // Run shortly after boot, then hourly.
  const timeout = setTimeout(() => {
    runReminderSweep().catch((err) => logger.warn('Reminder sweep error:', err.message));
  }, 30_000);

  const interval = setInterval(() => {
    runReminderSweep().catch((err) => logger.warn('Reminder sweep error:', err.message));
  }, ONE_HOUR);

  return () => {
    clearTimeout(timeout);
    clearInterval(interval);
  };
};
