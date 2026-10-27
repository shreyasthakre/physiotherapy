import { Router } from 'express';
import * as miscController from '../controllers/miscController.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  contactSchema,
  newsletterSchema,
  roleUpdateSchema,
  adminCreatePatientSchema,
  idParam,
} from '../validators/schemas.js';
import { publicLimiter } from '../middleware/rateLimit.js';

const router = Router();

// ─── Contact ───
router.post('/contact', publicLimiter, validate({ body: contactSchema }), miscController.submitContact);
router.get(
  '/contact',
  authenticate,
  authorize('admin'),
  miscController.listContactMessages,
);

// ─── Newsletter ───
router.post('/newsletter', publicLimiter, validate({ body: newsletterSchema }), miscController.subscribe);

// ─── Admin: users ───
router.get('/admin/users', authenticate, authorize('admin'), miscController.listUsers);
router.post(
  '/admin/patients',
  authenticate,
  authorize('admin', 'physiotherapist'),
  validate({ body: adminCreatePatientSchema }),
  miscController.createPatient,
);
router.patch(
  '/admin/users/:id/role',
  authenticate,
  authorize('admin'),
  validate({ params: idParam, body: roleUpdateSchema }),
  miscController.updateUserRole,
);

export default router;
