/**
 * n8n Mockup generation integration
 * Calls n8n webhook to apply design to mockup template
 */

import { postToWebhook } from './client';
import type { MockupRequest, MockupResponse } from '@/types/mespod';

/**
 * Applies design to mockup template via n8n webhook
 * @param request - Design image URL and mockup template ID
 * @returns Mockup image URL
 */
export async function generateMockup(request: MockupRequest): Promise<MockupResponse> {
  const webhookUrl = process.env.N8N_MOCKUP_APPLY_WEBHOOK_URL;

  if (!webhookUrl) {
    // Fallback dummy data for development
    console.warn('N8N_MOCKUP_APPLY_WEBHOOK_URL not configured, using dummy data');
    return {
      mockupImageUrl: `https://via.placeholder.com/1200x1400/667eea/FFFFFF?text=Mockup+${request.mockupTemplateId}`,
    };
  }

  return await postToWebhook(webhookUrl, request);
}
