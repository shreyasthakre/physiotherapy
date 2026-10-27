import { Router } from 'express';
import * as blogController from '../controllers/blogController.js';
import validate from '../middleware/validate.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { blogSchema, blogUpdateSchema, slugParam, idParam } from '../validators/schemas.js';

const router = Router();

router.get('/', blogController.listPosts);
router.get('/:slug', optionalAuth, validate({ params: slugParam }), blogController.getPost);

router.post(
  '/',
  authenticate,
  authorize('admin', 'physiotherapist'),
  validate({ body: blogSchema }),
  blogController.createPost,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'physiotherapist'),
  validate({ params: idParam, body: blogUpdateSchema }),
  blogController.updatePost,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'physiotherapist'),
  validate({ params: idParam }),
  blogController.deletePost,
);

export default router;
