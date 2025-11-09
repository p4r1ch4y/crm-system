import { Request, Response } from 'express';
import { slackService } from '../services/slack.service';

export const getIntegrationStatus = (_req: Request, res: Response) => {
  res.json({
    slack: {
      configured: slackService.isConfigured(),
    },
    hubspot: {
      configured: !!process.env.HUBSPOT_API_KEY,
    },
    webhooks: {
      inbound: true,
      outbound: slackService.isConfigured(),
    },
  });
};

export const testSlack = async (req: Request, res: Response) => {
  const { text } = req.body ?? {};
  const message = text || 'Test message from CRM integration endpoint';
  const result = await slackService.sendMessage(message, {
    username: 'CRM Bot',
    icon_emoji: ':robot_face:',
  });
  if (result.ok) return res.json({ success: true });
  return res.status(400).json({ success: false, error: result.error });
};

export const inboundWebhook = async (req: Request, res: Response) => {
  // Echo basic inbound webhook handling
  const { event, source, payload } = req.body ?? {};
  res.json({ received: true, event, source, payload });
};
