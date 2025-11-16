'use client';

/**
 * Main application page
 * Handles the full MesPOD workflow:
 * 1. Etsy product analysis
 * 2. Design variant generation
 * 3. Mockup creation
 * 4. SEO content generation
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { EtsyResponse, DesignVariant, MockupResponse, SeoResponse } from '@/types/mespod';

export default function AppPage() {
  const router = useRouter();
  
  // State management
  const [etsyUrl, setEtsyUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  
  // Data states
  const [etsyData, setEtsyData] = useState<EtsyResponse | null>(null);
  const [variants, setVariants] = useState<DesignVariant[]>([]);
  const [mockups, setMockups] = useState<Map<string, { mockup: MockupResponse; seo: SeoResponse; templateId: string }>>(new Map());

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleAnalyze = async () => {
    if (!etsyUrl.trim()) {
      setError('Lütfen bir Etsy URL\'i girin');
      return;
    }

    setError('');
    setLoading(true);
    setStep(1);

    try {
      // Step 1: Analyze Etsy product
      const etsyResponse = await fetch('/api/mespod/etsy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: etsyUrl }),
      });

      if (!etsyResponse.ok) throw new Error('Etsy analizi başarısız');
      
      const etsyResult: EtsyResponse = await etsyResponse.json();
      setEtsyData(etsyResult);
      setStep(2);

      // Step 2: Generate design variants
      const designResponse = await fetch('/api/mespod/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImageUrl: etsyResult.imageUrls[0],
          stylePrompt: etsyResult.title,
        }),
      });

      if (!designResponse.ok) throw new Error('Tasarım üretimi başarısız');
      
      const designResult = await designResponse.json();
      setVariants(designResult.variants);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMockup = async (variant: DesignVariant, templateId: string) => {
    const key = `${variant.id}-${templateId}`;
    
    if (mockups.has(key)) return; // Already generated

    try {
      // Generate mockup
      const mockupResponse = await fetch('/api/mespod/mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designImageUrl: variant.imageUrl,
          mockupTemplateId: templateId,
        }),
      });

      if (!mockupResponse.ok) throw new Error('Mockup oluşturulamadı');
      
      const mockupResult: MockupResponse = await mockupResponse.json();

      // Generate SEO content
      const seoResponse = await fetch('/api/mespod/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseTitle: etsyData?.title || '',
          baseDescription: etsyData?.description || '',
          baseTags: etsyData?.tags || [],
          mockupImageUrl: mockupResult.mockupImageUrl,
        }),
      });

      if (!seoResponse.ok) throw new Error('SEO içeriği oluşturulamadı');
      
      const seoResult: SeoResponse = await seoResponse.json();

      // Store results
      setMockups(new Map(mockups.set(key, {
        mockup: mockupResult,
        seo: seoResult,
        templateId,
      })));
    } catch (err: any) {
      alert(err.message || 'Mockup oluşturulurken hata oluştu');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Kopyalandı!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">MesPOD</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Etsy Ürün Analizi</h2>
            <div className="flex gap-3">
              <input
                type="url"
                value={etsyUrl}
                onChange={(e) => setEtsyUrl(e.target.value)}
                placeholder="https://www.etsy.com/listing/..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'İşleniyor...' : 'Analiz Et'}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-red-600 text-sm">{error}</p>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        {step > 0 && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <span className="ml-2 font-medium">Etsy Verisi</span>
                </div>
                <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <span className="ml-2 font-medium">Tasarımlar</span>
                </div>
                <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                    3
                  </div>
                  <span className="ml-2 font-medium">Mockup & SEO</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Design Variants */}
        {variants.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Tasarım Varyasyonları</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {variants.map((variant) => (
                <div key={variant.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={variant.imageUrl}
                    alt={variant.prompt}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3">{variant.prompt}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700">Mockup Şablonu Seç:</p>
                      <div className="flex gap-2">
                        {['tshirt', 'sweatshirt', 'hoodie'].map((template) => (
                          <button
                            key={template}
                            onClick={() => handleGenerateMockup(variant, template)}
                            className="flex-1 px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
                          >
                            {template}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Show generated mockups for this variant */}
                    {['tshirt', 'sweatshirt', 'hoodie'].map((template) => {
                      const key = `${variant.id}-${template}`;
                      const result = mockups.get(key);
                      
                      if (!result) return null;
                      
                      return (
                        <div key={key} className="mt-4 pt-4 border-t">
                          <img
                            src={result.mockup.mockupImageUrl}
                            alt="Mockup"
                            className="w-full h-48 object-cover rounded mb-3"
                          />
                          <div className="space-y-2 text-xs">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold">Başlık:</span>
                                <button
                                  onClick={() => copyToClipboard(result.seo.title)}
                                  className="text-primary-600 hover:text-primary-700"
                                >
                                  Kopyala
                                </button>
                              </div>
                              <p className="text-gray-700">{result.seo.title}</p>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold">Açıklama:</span>
                                <button
                                  onClick={() => copyToClipboard(result.seo.description)}
                                  className="text-primary-600 hover:text-primary-700"
                                >
                                  Kopyala
                                </button>
                              </div>
                              <p className="text-gray-700 line-clamp-3">{result.seo.description}</p>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold">Tags:</span>
                                <button
                                  onClick={() => copyToClipboard(result.seo.tags.join(', '))}
                                  className="text-primary-600 hover:text-primary-700"
                                >
                                  Kopyala
                                </button>
                              </div>
                              <p className="text-gray-700">{result.seo.tags.slice(0, 5).join(', ')}...</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
