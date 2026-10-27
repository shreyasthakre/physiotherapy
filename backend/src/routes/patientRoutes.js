import { Router } from 'express';
import * as recordController from '../controllers/recordController.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { recordSchema, idParam } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

// Patient — own records
router.get('/me/records', recordController.listMyRecords);

// Staff — manage patients + records
router.get('/', authorize('admin', 'physiotherapist'), recordController.listPatients);
router.get(
  '/:id/records',
  authorize('admin', 'physiotherapist'),
  validate({ params: idParam }),
  recordController.listPatientRecords,
);
router.post(
  '/:id/records',
  authorize('admin', 'physiotherapist'),
  validate({ params: idParam, body: recordSchema.omit({ patientId: true }) }),
  recordController.createRecord,
);

export default router;
