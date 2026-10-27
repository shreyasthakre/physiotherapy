import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize('admin'), notificationController.listRecentNotifications);

export default router;
