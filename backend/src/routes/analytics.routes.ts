import { Router } from 'express';
import {
  getDashboardAnalytics,
  getPerformanceMetrics,
  getConversionFunnel,
} from '../controllers/analytics.controller';
import { authenticate, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/dashboard', getDashboardAnalytics);
router.get('/performance', restrictTo('ADMIN', 'MANAGER'), getPerformanceMetrics);
router.get('/funnel', getConversionFunnel);

export default router;
