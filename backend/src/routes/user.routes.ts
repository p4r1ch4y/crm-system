import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { authenticate, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateUserSchema } from '../utils/validation.schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', restrictTo('ADMIN', 'MANAGER'), getUsers);
router.get('/:id', getUser);
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', restrictTo('ADMIN'), deleteUser);

export default router;
