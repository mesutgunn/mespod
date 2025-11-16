/**
 * Landing page
 * Shows MesPOD features and login/register buttons
 */

import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary-900 mb-4">
            MesPOD
          </h1>
          <p className="text-xl text-primary-700">
            Etsy POD Tasarım Otomasyonu
          </p>
        </header>

        {/* Features */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Özellikler
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Etsy Ürün Analizi</h3>
                <p className="text-gray-600">
                  Popüler Etsy ürünlerini analiz edin ve tasarım özelliklerini çıkarın
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">AI Tasarım Üretimi</h3>
                <p className="text-gray-600">
                  Yapay zeka ile benzer tasarımların 4+ varyasyonunu otomatik oluşturun
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Mockup Oluşturma</h3>
                <p className="text-gray-600">
                  Tasarımlarınızı profesyonel mockup şablonlarına otomatik uygulayın
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">SEO Optimizasyonu</h3>
                <p className="text-gray-600">
                  Etsy için optimize edilmiş başlık, açıklama ve tag'ler üretin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4">
          {user ? (
            <Link
              href={user.role === 'ADMIN' ? '/admin' : '/app'}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Panoya Git
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
