import { Router } from 'express';
import authRoutes from './authRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import patientRoutes from './patientRoutes.js';
import recordRoutes from './recordRoutes.js';
import blogRoutes from './blogRoutes.js';
import testimonialRoutes from './testimonialRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import miscRoutes from './miscRoutes.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

router.use('/auth', authLimiter, authRoutes);
router.use('/services', serviceRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/patients', patientRoutes);
router.use('/records', recordRoutes);
router.use('/blog', blogRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', miscRoutes);

export default router;
