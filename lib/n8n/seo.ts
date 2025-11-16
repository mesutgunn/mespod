/**
 * n8n SEO generation integration
 * Calls n8n webhook to generate Etsy-optimized title, description, and tags
 */

import { postToWebhook } from './client';
import type { SeoRequest, SeoResponse } from '@/types/mespod';

/**
 * Generates SEO content via n8n webhook
 * @param request - Base title, description, tags, and mockup image
 * @returns Optimized title, description, and tags for Etsy
 */
export async function generateSeoContent(request: SeoRequest): Promise<SeoResponse> {
  const webhookUrl = process.env.N8N_SEO_GENERATE_WEBHOOK_URL;

  if (!webhookUrl) {
    // Fallback dummy data for development
    console.warn('N8N_SEO_GENERATE_WEBHOOK_URL not configured, using dummy data');
    return {
      title: 'Funny Cat T-Shirt | Cute Kitten Tee | Cat Lover Gift | Unisex Cotton Shirt',
      description:
        'Perfect gift for cat lovers! This adorable cat design t-shirt features a unique, eye-catching print on premium quality cotton. Comfortable, durable, and stylish - ideal for everyday wear. Available in multiple sizes. Fast shipping. Great for birthdays, holidays, or just because!',
      tags: [
        'cat tshirt',
        'funny cat',
        'cat lover gift',
        'kitten shirt',
        'cute cat',
        'animal tee',
        'pet lover',
        'cat mom',
        'cat dad',
        'unisex shirt',
        'cotton tshirt',
        'graphic tee',
        'cat design',
      ],
    };
  }

  return await postToWebhook(webhookUrl, request);
}
