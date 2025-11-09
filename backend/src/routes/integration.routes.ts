import { Router } from 'express';
import { getIntegrationStatus, testSlack, inboundWebhook } from '../controllers/integration.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public inbound webhook endpoint (can add signature verification later)
router.post('/webhook/inbound', inboundWebhook);

// Authenticated integration management endpoints
router.get('/status', authenticate, getIntegrationStatus);
router.post('/slack/test', authenticate, testSlack);

export default router;
