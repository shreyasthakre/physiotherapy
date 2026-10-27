import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import validate from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  appointmentSchema,
  appointmentUpdateSchema,
  notifySchema,
  idParam,
} from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', appointmentController.listAppointments);
router.post('/', validate({ body: appointmentSchema }), appointmentController.createAppointment);
router.get('/:id', validate({ params: idParam }), appointmentController.getAppointment);
router.patch(
  '/:id',
  validate({ params: idParam, body: appointmentUpdateSchema }),
  appointmentController.updateAppointment,
);
router.post(
  '/:id/notify',
  validate({ params: idParam, body: notifySchema }),
  appointmentController.notifyAppointment,
);
router.get(
  '/:id/notifications',
  validate({ params: idParam }),
  appointmentController.listAppointmentNotifications,
);

export default router;
