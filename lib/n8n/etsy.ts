/**
 * n8n Etsy scraper integration
 * Calls n8n webhook to scrape and analyze Etsy product
 */

import { postToWebhook } from './client';
import type { EtsyRequest, EtsyResponse } from '@/types/mespod';

/**
 * Scrapes Etsy product data via n8n webhook
 * @param request - Etsy product URL
 * @returns Product title, description, tags, and images
 */
export async function scrapeEtsyProduct(request: EtsyRequest): Promise<EtsyResponse> {
  const webhookUrl = process.env.N8N_ETSY_SCRAPER_WEBHOOK_URL;

  if (!webhookUrl) {
    // Fallback dummy data for development
    console.warn('N8N_ETSY_SCRAPER_WEBHOOK_URL not configured, using dummy data');
    return {
      title: 'Funny Cat T-Shirt - Cute Kitten Design',
      description: 'Adorable cat design perfect for cat lovers. High quality print on comfortable cotton.',
      tags: ['cat', 'funny', 'tshirt', 'cute', 'kitten', 'animal', 'pet', 'gift'],
      imageUrls: ['https://via.placeholder.com/800x800/FF6B6B/FFFFFF?text=Cat+Design'],
    };
  }

  return await postToWebhook(webhookUrl, request);
}
