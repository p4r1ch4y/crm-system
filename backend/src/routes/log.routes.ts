import { Router } from 'express';
import { authenticate, restrictTo } from '../middleware/auth.middleware';
import { listLogs, downloadLog } from '../controllers/log.controller';

const router = Router();

// Protect logs - only admin or manager roles
router.use(authenticate, restrictTo('ADMIN', 'MANAGER'));

router.get('/', listLogs);
router.get('/download', downloadLog);

export default router;
