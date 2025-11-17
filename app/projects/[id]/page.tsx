'use client';

/**
 * Project Detail Page
 * Displays comprehensive Etsy product information
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Project {
  id: string;
  etsyUrl: string;
  etsyTitle?: string;
  status: string;
  createdAt: string;
  designs: Design[];
  
  // Etsy Scraper Data
  productId?: string;
  shopId?: string;
  shopUrl?: string;
  shopSales?: string;
  shopName?: string;
  image?: string;
  images?: string[];
  maxQuantity?: number;
  description?: string[];
  deliveryDaysMin?: number;
  deliveryDaysMax?: number;
  shopReviews?: number;
  reviews?: number;
  star?: string;
  highlightsTags?: string[];
  reviewsTags?: any;
  yearsOnEtsy?: string;
  hasRatingsBadge?: boolean;
  hasConvosBadge?: boolean;
  hasShippingBadge?: boolean;
  reviewsScores?: any;
  category?: string;
  price?: string;
  lowPrice?: string;
  highPrice?: string;
  countryShippingFrom?: string;
  currency?: string;
}

interface Design {
  id: string;
  imageUrl: string;
  prompt?: string;
  mockupTemplate?: string;
  mockupUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoTags?: string[];
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProject();
    }
  }, [params.id]);

  const loadProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      } else {
        alert('Proje bulunamadı!');
        router.push('/app');
      }
    } catch (error) {
      console.error('Load project error:', error);
      alert('Proje yüklenemedi!');
      router.push('/app');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Proje başarıyla silindi!');
        router.push('/app');
      } else {
        throw new Error('Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Delete project error:', error);
      alert('Proje silinemedi!');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5] mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/app')}
                className="text-gray-600 hover:text-gray-900"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Proje Detayları</h1>
                <p className="text-sm text-gray-500">{project.etsyTitle}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={project.etsyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] text-sm font-medium"
              >
                Etsy'de Aç
              </a>
              <button
                onClick={deleteProject}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
              >
                {deleting ? 'Siliniyor...' : 'Projeyi Sil'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Product Images Gallery */}
          {project.images && project.images.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ürün Görselleri</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {project.images.map((img, idx) => (
                  <div key={idx} className="aspect-square">
                    <img
                      src={img}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(img, '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product & Shop Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">inventory_2</span>
                Ürün Bilgileri
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Ürün ID:</span>
                  <span className="font-medium">{project.productId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Kategori:</span>
                  <span className="font-medium text-sm">{project.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Fiyat:</span>
                  <span className="font-medium text-lg text-[#4F46E5]">
                    {project.lowPrice} - {project.highPrice} {project.currency}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Stok:</span>
                  <span className="font-medium">{project.maxQuantity} adet</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Teslimat:</span>
                  <span className="font-medium">
                    {project.deliveryDaysMin}-{project.deliveryDaysMax} gün
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Gönderim:</span>
                  <span className="font-medium">{project.countryShippingFrom}</span>
                </div>
              </div>
            </div>

            {/* Shop Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">store</span>
                Mağaza Bilgileri
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Mağaza Adı:</span>
                  <span className="font-medium">{project.shopName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Mağaza ID:</span>
                  <span className="font-medium">{project.shopId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Toplam Satış:</span>
                  <span className="font-medium text-green-600">{project.shopSales}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Mağaza Yorumları:</span>
                  <span className="font-medium">{project.shopReviews}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Etsy'de:</span>
                  <span className="font-medium">{project.yearsOnEtsy}</span>
                </div>
                <div className="pt-2">
                  <a
                    href={project.shopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4F46E5] hover:underline text-sm font-medium flex items-center gap-1"
                  >
                    Mağazayı Ziyaret Et
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews & Ratings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">star</span>
              Değerlendirmeler
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl font-bold text-[#4F46E5]">{project.star}</div>
                  <div>
                    <div className="flex text-yellow-400 mb-1">
                      {'★'.repeat(Math.floor(parseFloat(project.star || '0')))}
                      {'☆'.repeat(5 - Math.floor(parseFloat(project.star || '0')))}
                    </div>
                    <p className="text-sm text-gray-600">{project.reviews} yorum</p>
                  </div>
                </div>
                {project.reviewsScores && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ürün Kalitesi:</span>
                      <span className="font-medium">{project.reviewsScores.item_quality}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Kargo:</span>
                      <span className="font-medium">{project.reviewsScores.shipping}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Müşteri Hizmeti:</span>
                      <span className="font-medium">{project.reviewsScores.customer_service}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div>
                <h3 className="font-semibold mb-3">Mağaza Rozetleri</h3>
                <div className="flex flex-wrap gap-2">
                  {project.hasRatingsBadge && (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      ⭐ Yüksek Puan
                    </span>
                  )}
                  {project.hasShippingBadge && (
                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      🚚 Hızlı Kargo
                    </span>
                  )}
                  {project.hasConvosBadge && (
                    <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      💬 İyi İletişim
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          {project.highlightsTags && project.highlightsTags.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">local_fire_department</span>
                Öne Çıkan Özellikler
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.highlightsTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Review Tags */}
          {project.reviewsTags && Array.isArray(project.reviewsTags) && project.reviewsTags.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">label</span>
                Yorum Etiketleri
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {project.reviewsTags.map((tag: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="font-semibold text-gray-900">{tag.tag}</p>
                    <p className="text-sm text-gray-600 mt-1">{tag.frequency} yorum</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {project.description && project.description.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">description</span>
                Ürün Açıklaması
              </h2>
              <div className="prose max-w-none">
                {project.description.map((line, idx) => (
                  <p key={idx} className="text-gray-700 mb-2">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Designs Section */}
          {project.designs && project.designs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">palette</span>
                Tasarımlar ({project.designs.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {project.designs.map((design) => (
                  <div key={design.id} className="border border-gray-200 rounded-lg p-3">
                    <img
                      src={design.imageUrl}
                      alt="Design"
                      className="w-full h-48 object-cover rounded mb-2"
                    />
                    {design.prompt && (
                      <p className="text-xs text-gray-600 line-clamp-2">{design.prompt}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
