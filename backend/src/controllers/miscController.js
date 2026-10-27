import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as miscModel from '../models/miscModel.js';
import * as userModel from '../models/userModel.js';
import { sendEmail } from '../utils/notifications.js';
import { subscribeToNewsletter } from '../utils/mailchimp.js';
import { hashPassword } from '../utils/password.js';
import logger from '../utils/logger.js';

/** POST /api/contact (public) */
export const submitContact = asyncHandler(async (req, res) => {
  const message = await miscModel.createContactMessage(req.body);

  try {
    await sendEmail({
      to: req.body.email,
      subject: 'We received your message — The Physiotherapy Clinic',
      text: `Hi ${req.body.name},\n\nThanks for reaching out. Our team will get back to you within one business day.\n\n— The Physiotherapy Clinic`,
    });
  } catch (err) {
    logger.warn('Contact auto-reply failed:', err.message);
  }

  res.status(201).json({ message: 'Thanks! We will be in touch shortly.', id: message.id });
});

/** GET /api/contact (admin) */
export const listContactMessages = asyncHandler(async (_req, res) => {
  const messages = await miscModel.listContactMessages();
  res.json({ messages });
});

/** POST /api/newsletter (public) */
export const subscribe = asyncHandler(async (req, res) => {
  const { email, firstName } = req.body;
  await miscModel.addSubscriber({ email, firstName });

  let mode = 'stored';
  try {
    const result = await subscribeToNewsletter({ email, firstName });
    mode = result.mode;
  } catch (err) {
    logger.warn('Mailchimp subscribe failed:', err.message);
  }

  res.status(201).json({ message: 'You are subscribed!', provider: mode });
});

/** GET /api/admin/users (admin) */
export const listUsers = asyncHandler(async (_req, res) => {
  const users = await userModel.listUsers();
  res.json({ users });
});

const randomPassword = () =>
  `Tpc${Math.random().toString(36).slice(2, 8)}${Math.floor(1000 + Math.random() * 9000)}!`;

/**
 * POST /api/admin/patients (admin/physio) — register a new (walk-in / phone)
 * patient. Only name + mobile are required. If an email is supplied the
 * patient can also log in with the generated temporary password.
 */
export const createPatient = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  let email = req.body.email;

  if (email) {
    const existing = await userModel.findByEmail(email);
    if (existing) throw ApiError.conflict('A patient with this email already exists');
  } else {
    // No email given — synthesise a non-login placeholder so the record is valid.
    email = `walkin.${Date.now()}.${Math.floor(Math.random() * 1000)}@no-login.thephysiotherapyclinic.local`;
  }

  const tempPassword = randomPassword();
  const passwordHash = await hashPassword(tempPassword);
  const patient = await userModel.createUser({
    role: 'patient',
    fullName,
    email,
    passwordHash,
    phone,
  });

  res.status(201).json({
    patient,
    // Only expose credentials when a real email was provided.
    tempPassword: req.body.email ? tempPassword : null,
  });
});

/** PATCH /api/admin/users/:id/role (admin) */
export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await userModel.updateRole(req.params.id, req.body.role);
  res.json({ user });
});
