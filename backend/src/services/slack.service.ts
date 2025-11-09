import axios from 'axios';
import { logger } from '../utils/logger';

interface SlackMessageOptions {
  channel?: string;
  username?: string;
  icon_emoji?: string;
  icon_url?: string;
}

export class SlackService {
  private webhookUrl?: string;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL;
  }

  public isConfigured(): boolean {
    return !!this.webhookUrl;
  }

  public async sendMessage(text: string, options: SlackMessageOptions = {}) {
    if (!this.webhookUrl) {
      logger.warn('Slack webhook URL not configured');
      return { ok: false, error: 'not_configured' } as const;
    }

    try {
      const payload = { text, ...options } as any;
      await axios.post(this.webhookUrl, payload, { timeout: 5000 });
      logger.info('Sent Slack message');
      return { ok: true } as const;
    } catch (err: any) {
      logger.error(`Failed to send Slack message: ${err?.message || err}`);
      return { ok: false, error: 'send_failed' } as const;
    }
  }
}

export const slackService = new SlackService();
