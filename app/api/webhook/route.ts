/**
 * Webhook endpoint for Etsy Scraper
 * POST /api/webhook - Receive Etsy product data from external scraper
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { direct_urls } = body;

    // Validate webhook URL from environment
    const webhookUrl = process.env.ETSY_SCRAPER_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Webhook URL not configured' },
        { status: 500 }
      );
    }

    if (!direct_urls || !Array.isArray(direct_urls) || direct_urls.length === 0) {
      return NextResponse.json(
        { error: 'direct_urls array is required' },
        { status: 400 }
      );
    }

    // Send request to external scraper webhook
    const scraperResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ direct_urls }),
    });

    if (!scraperResponse.ok) {
      throw new Error(`Scraper webhook failed: ${scraperResponse.statusText}`);
    }

    const scraperData = await scraperResponse.json();

    // Find or create project with this URL
    // For now, we'll create a new project or update existing one
    const etsyUrl = direct_urls[0];
    
    // Try to find existing project with this URL
    let project = await prisma.project.findFirst({
      where: { etsyUrl },
    });

    const projectData = {
      etsyUrl,
      etsyTitle: scraperData.title || null,
      etsyDesc: scraperData.description?.[0] || null,
      etsyTags: [],
      status: 'completed',
      
      // Etsy Scraper Data
      productId: scraperData.product_id || null,
      shopId: scraperData.shop_id || null,
      shopUrl: scraperData.shop_url || null,
      shopSales: scraperData.shop_sales || null,
      shopName: scraperData.shop_name || null,
      searchPosition: scraperData.search_position || null,
      image: scraperData.image || null,
      images: scraperData.images || [],
      maxQuantity: scraperData.max_quantity || null,
      variants: scraperData.variants || null,
      description: scraperData.description || [],
      deliveryDaysMin: scraperData.delivery_days_min || null,
      deliveryDaysMax: scraperData.delivery_days_max || null,
      shopReviews: scraperData.shop_reviews || null,
      reviews: scraperData.reviews || null,
      star: scraperData.star || null,
      highlightsTags: scraperData.highlights_tags || [],
      reviewsTags: scraperData.reviews_tags || null,
      yearsOnEtsy: scraperData.years_on_etsy || null,
      hasRatingsBadge: scraperData.has_ratings_badge || null,
      hasConvosBadge: scraperData.has_convos_badge || null,
      hasShippingBadge: scraperData.has_shipping_badge || null,
      reviewsScores: scraperData.reviews_scores || null,
      category: scraperData.category || null,
      price: scraperData.price || null,
      lowPrice: scraperData.low_price || null,
      highPrice: scraperData.high_price || null,
      countryShippingFrom: scraperData.country_shipping_from || null,
      currency: scraperData.currency || null,
      oldPrice: scraperData.old_price || null,
      moreLikeUrl: scraperData.more_like_url || null,
    };

    if (project) {
      // Update existing project
      project = await prisma.project.update({
        where: { id: project.id },
        data: projectData,
        include: {
          designs: true,
        },
      });
    } else {
      // Create new project - need a userId
      // For webhook, we'll use a system user or the first admin user
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });

      if (!adminUser) {
        return NextResponse.json(
          { error: 'No admin user found to assign project' },
          { status: 500 }
        );
      }

      project = await prisma.project.create({
        data: {
          ...projectData,
          userId: adminUser.id,
        },
        include: {
          designs: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      project,
      scraperData,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
