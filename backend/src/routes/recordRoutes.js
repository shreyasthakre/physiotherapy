import { Router } from 'express';
import * as recordController from '../controllers/recordController.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { idParam } from '../validators/schemas.js';

const router = Router();

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'physiotherapist'),
  validate({ params: idParam }),
  recordController.deleteRecord,
);

export default router;
