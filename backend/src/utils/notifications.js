import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from './logger.js';

let transporter = null;
let transporterMode = 'console';

/**
 * Lazily create a nodemailer transport.
 *  1. If SMTP_* is configured → use the real provider.
 *  2. Otherwise, in dev, spin up a free Ethereal test inbox so emails are
 *     actually "sent" and viewable via a preview URL (logged to the console).
 *  3. If neither is available → fall back to console logging only.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  if (config.smtp.host) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: config.smtp.user
        ? { user: config.smtp.user, pass: config.smtp.pass }
        : undefined,
    });
    transporterMode = 'smtp';
    return transporter;
  }

  if (!config.isProd && config.smtp.preview) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      transporterMode = 'ethereal';
      logger.info(
        `[email] No SMTP configured — using an Ethereal test inbox (${testAccount.user}). ` +
          'Each email will log a preview URL you can open in the browser.',
      );
      return transporter;
    } catch (err) {
      logger.warn(`[email] Could not create an Ethereal test inbox (${err.message}); logging to console instead.`);
    }
  }

  return null;
};

/**
 * Send an email. Uses a real SMTP provider if configured, an Ethereal test
 * inbox in dev (with a preview URL), or console logging as a last resort.
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const tx = await getTransporter();
  if (!tx) {
    logger.info(`[email:console] To: ${to} | Subject: ${subject}\n${text || ''}`);
    return { queued: false, mode: 'console' };
  }

  const info = await tx.sendMail({ from: config.smtp.from, to, subject, text, html });

  if (transporterMode === 'ethereal') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    logger.info(`[email:ethereal] Sent to ${to} — preview: ${previewUrl}`);
    return { queued: true, mode: 'ethereal', previewUrl };
  }

  logger.info(`[email:smtp] Sent to ${to} | ${subject}`);
  return { queued: true, mode: 'smtp' };
};

// ─── Twilio (SMS / WhatsApp / Voice) over HTTPS ─────────────────
// Twilio's REST API uses HTTPS (port 443), so it works on networks that
// block outbound SMTP. When credentials are absent we fall back to a
// console/demo log so the app still runs with zero setup.

const TWILIO_BASE = 'https://api.twilio.com/2010-04-01';

const twilioReady = () => Boolean(config.sms.accountSid && config.sms.authToken);

const escapeXml = (s = '') =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const twilioPost = async (resource, params) => {
  const url = `${TWILIO_BASE}/Accounts/${config.sms.accountSid}/${resource}`;
  const auth = Buffer.from(`${config.sms.accountSid}:${config.sms.authToken}`).toString('base64');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Twilio responded ${res.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Send an SMS. Uses Twilio when configured, otherwise logs to the console.
 */
export const sendSms = async ({ to, body }) => {
  if (!(twilioReady() && config.sms.from)) {
    logger.info(`[sms:console] To: ${to} | ${body}`);
    return { queued: false, mode: 'console' };
  }
  const msg = await twilioPost('Messages.json', { To: to, From: config.sms.from, Body: body });
  logger.info(`[sms:twilio] Sent to ${to} (sid ${msg.sid})`);
  return { queued: true, mode: 'twilio', sid: msg.sid };
};

/**
 * Send a WhatsApp message via Twilio's WhatsApp channel. Falls back to a
 * demo console log when no WhatsApp sender is configured.
 */
export const sendWhatsApp = async ({ to, body }) => {
  if (!(twilioReady() && config.sms.whatsappFrom)) {
    logger.info(`[whatsapp:demo] 📲 To: ${to || 'N/A'} | ${body}`);
    return { queued: true, mode: 'demo' };
  }
  const msg = await twilioPost('Messages.json', {
    To: `whatsapp:${to}`,
    From: `whatsapp:${config.sms.whatsappFrom}`,
    Body: body,
  });
  logger.info(`[whatsapp:twilio] Sent to ${to} (sid ${msg.sid})`);
  return { queued: true, mode: 'twilio', sid: msg.sid };
};

/**
 * Place an automated voice call that speaks `message` (Twilio Voice + TwiML).
 * Falls back to a demo console log when no voice sender is configured.
 */
export const sendCall = async ({ to, message }) => {
  const from = config.sms.callFrom || config.sms.from;
  if (!(twilioReady() && from)) {
    logger.info(`[call:demo] ☎️  Calling: ${to || 'N/A'} | Says: "${message}"`);
    return { queued: true, mode: 'demo' };
  }
  const twiml = `<Response><Say voice="alice">${escapeXml(message)}</Say></Response>`;
  const call = await twilioPost('Calls.json', { To: to, From: from, Twiml: twiml });
  logger.info(`[call:twilio] Calling ${to} (sid ${call.sid})`);
  return { queued: true, mode: 'twilio', sid: call.sid };
};

/**
 * Compose + send an appointment confirmation across channels.
 */
export const sendAppointmentConfirmation = async ({ patient, appointment, service }) => {
  const when = new Date(appointment.scheduled_at).toLocaleString('en-AU', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const subject = 'Your physiotherapy appointment is confirmed';
  const text = `Hi ${patient.full_name},\n\nYour appointment for "${service?.name || 'Physiotherapy'}" is confirmed for ${when}.\n\nWe look forward to seeing you.\n\n— The Physiotherapy Clinic`;

  const results = {};
  results.email = await sendEmail({ to: patient.email, subject, text });
  if (patient.phone) {
    results.sms = await sendSms({
      to: patient.phone,
      body: `The Physiotherapy Clinic: appointment confirmed for ${when}. Reply STOP to opt out.`,
    });
  }
  return results;
};
