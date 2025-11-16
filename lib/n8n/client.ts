/**
 * n8n webhook client
 * Generic helper for making POST requests to n8n webhooks
 */

/**
 * Posts data to an n8n webhook URL
 * @param url - The n8n webhook URL
 * @param payload - Data to send to the webhook
 * @returns Response data from n8n
 */
export async function postToWebhook(url: string, payload: any): Promise<any> {
  try {
    if (!url) {
      throw new Error('Webhook URL is not configured');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    throw error;
  }
}
