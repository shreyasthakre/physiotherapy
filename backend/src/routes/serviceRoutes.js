import { Router } from 'express';
import * as serviceController from '../controllers/serviceController.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import {
  serviceSchema,
  serviceUpdateSchema,
  slugParam,
  idParam,
} from '../validators/schemas.js';

const router = Router();

router.get('/', optionalAuth, serviceController.listServices);
router.get('/:slug', validate({ params: slugParam }), serviceController.getService);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: serviceSchema }),
  serviceController.createService,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: idParam, body: serviceUpdateSchema }),
  serviceController.updateService,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: idParam }),
  serviceController.deleteService,
);

export default router;
