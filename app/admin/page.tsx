/**
 * Admin dashboard page
 * Shows user list and system information
 * Only accessible to ADMIN role users
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  const user = await getCurrentUser();

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    redirect('/app');
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary-600">MesPOD Admin</h1>
            <p className="text-sm text-gray-600">Hoş geldin, {user.name || user.email}</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/app"
              className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              Uygulamaya Git
            </a>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Toplam Kullanıcı</h3>
            <p className="text-3xl font-bold text-primary-600">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Admin Kullanıcılar</h3>
            <p className="text-3xl font-bold text-primary-600">
              {users.filter(u => u.role === 'ADMIN').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Normal Kullanıcılar</h3>
            <p className="text-3xl font-bold text-primary-600">
              {users.filter(u => u.role === 'USER').length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Kullanıcı Listesi</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İsim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {u.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.role === 'ADMIN'
                            ? 'bg-primary-100 text-primary-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sistem Durumu</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Database</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                Aktif
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">n8n Webhook Entegrasyonu</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                Yapılandırma Gerekli
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Uygulama Versiyonu</span>
              <span className="text-gray-800 font-medium">v0.1.0</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            n8n Webhook Yapılandırması
          </h3>
          <p className="text-blue-800 mb-3">
            MesPOD'un tam olarak çalışması için n8n webhook URL'lerini .env dosyasına eklemelisiniz:
          </p>
          <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
            <li>N8N_ETSY_SCRAPER_WEBHOOK_URL</li>
            <li>N8N_DESIGN_GENERATE_WEBHOOK_URL</li>
            <li>N8N_MOCKUP_APPLY_WEBHOOK_URL</li>
            <li>N8N_SEO_GENERATE_WEBHOOK_URL</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
