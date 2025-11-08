import { Router } from 'express';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  getLeadStats,
} from '../controllers/lead.controller';
import { authenticate, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createLeadSchema,
  updateLeadSchema,
} from '../utils/validation.schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', getLeadStats);
router.get('/', getLeads);
router.post('/', validate(createLeadSchema), createLead);
router.get('/:id', getLead);
router.patch('/:id', validate(updateLeadSchema), updateLead);
router.delete('/:id', restrictTo('ADMIN', 'MANAGER'), deleteLead);

export default router;
