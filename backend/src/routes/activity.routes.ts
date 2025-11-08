import { Router } from 'express';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createActivitySchema,
  updateActivitySchema,
} from '../utils/validation.schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getActivities);
router.post('/', validate(createActivitySchema), createActivity);
router.patch('/:id', validate(updateActivitySchema), updateActivity);
router.delete('/:id', deleteActivity);

export default router;
