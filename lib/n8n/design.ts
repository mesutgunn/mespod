/**
 * n8n Design generation integration
 * Calls n8n webhook to generate design variants using AI
 */

import { postToWebhook } from './client';
import type { DesignRequest, DesignResponse } from '@/types/mespod';

/**
 * Generates design variants via n8n webhook
 * @param request - Base image URL and optional style prompt
 * @returns Array of design variants with images and prompts
 */
export async function generateDesignVariants(request: DesignRequest): Promise<DesignResponse> {
  const webhookUrl = process.env.N8N_DESIGN_GENERATE_WEBHOOK_URL;

  if (!webhookUrl) {
    // Fallback dummy data for development
    console.warn('N8N_DESIGN_GENERATE_WEBHOOK_URL not configured, using dummy data');
    return {
      variants: [
        {
          id: 'var-1',
          imageUrl: 'https://via.placeholder.com/800x800/4ECDC4/FFFFFF?text=Variant+1',
          prompt: 'Minimalist cat silhouette with geometric shapes',
        },
        {
          id: 'var-2',
          imageUrl: 'https://via.placeholder.com/800x800/FF6B6B/FFFFFF?text=Variant+2',
          prompt: 'Watercolor style cat with floral elements',
        },
        {
          id: 'var-3',
          imageUrl: 'https://via.placeholder.com/800x800/95E1D3/FFFFFF?text=Variant+3',
          prompt: 'Retro vintage cat poster design',
        },
        {
          id: 'var-4',
          imageUrl: 'https://via.placeholder.com/800x800/F38181/FFFFFF?text=Variant+4',
          prompt: 'Modern abstract cat with bold colors',
        },
      ],
    };
  }

  return await postToWebhook(webhookUrl, request);
}
