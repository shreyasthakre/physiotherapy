import { Router } from 'express';
import * as testimonialController from '../controllers/testimonialController.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { testimonialSchema, idParam } from '../validators/schemas.js';

const router = Router();

router.get('/', optionalAuth, testimonialController.listTestimonials);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: testimonialSchema }),
  testimonialController.createTestimonial,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: idParam }),
  testimonialController.deleteTestimonial,
);

export default router;
