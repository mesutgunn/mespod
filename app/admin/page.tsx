'use client';

/**
 * Enhanced Admin Dashboard
 * - System Settings Management
 * - n8n Webhook Configuration
 * - User Management (CRUD)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'overview' | 'settings' | 'webhooks' | 'users';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    siteName: '',
    siteLogo: '',
    siteDescription: '',
  });
  
  // Webhooks state
  const [webhooks, setWebhooks] = useState({
    N8N_ETSY_SCRAPER_WEBHOOK_URL: '',
    N8N_DESIGN_GENERATE_WEBHOOK_URL: '',
    N8N_MOCKUP_APPLY_WEBHOOK_URL: '',
    N8N_SEO_GENERATE_WEBHOOK_URL: '',
  });
  
  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (activeTab === 'settings' || activeTab === 'webhooks') {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      
      setSettings({
        siteName: data.siteName || 'MesPOD',
        siteLogo: data.siteLogo || '',
        siteDescription: data.siteDescription || '',
      });
      
      setWebhooks({
        N8N_ETSY_SCRAPER_WEBHOOK_URL: data.N8N_ETSY_SCRAPER_WEBHOOK_URL || '',
        N8N_DESIGN_GENERATE_WEBHOOK_URL: data.N8N_DESIGN_GENERATE_WEBHOOK_URL || '',
        N8N_MOCKUP_APPLY_WEBHOOK_URL: data.N8N_MOCKUP_APPLY_WEBHOOK_URL || '',
        N8N_SEO_GENERATE_WEBHOOK_URL: data.N8N_SEO_GENERATE_WEBHOOK_URL || '',
      });
    }
    
    if (activeTab === 'users' || activeTab === 'overview') {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert('Ayarlar kaydedildi!');
    } catch (error) {
      alert('Hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const saveWebhooks = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhooks),
      });
      alert('Webhook ayarları kaydedildi!');
    } catch (error) {
      alert('Hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      loadData();
    } catch (error) {
      alert('Silme hatası!');
    }
  };

  const saveUser = async (userData: any) => {
    setLoading(true);
    try {
      if (editingUser) {
        await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
      } else {
        await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
      }
      setShowUserModal(false);
      setEditingUser(null);
      loadData();
    } catch (error) {
      alert('Kayıt hatası!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">MesPOD Admin</h1>
          <div className="flex gap-3">
            <a href="/app" className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium">
              Uygulamaya Git
            </a>
            <button onClick={handleLogout} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[{ id: 'overview', label: 'Genel Bakış' }, { id: 'settings', label: 'Ayarlar' }, { id: 'webhooks', label: 'Webhooks' }, { id: 'users', label: 'Kullanıcılar' }].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
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
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Sistem Ayarları</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Adı</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input
                  type="text"
                  value={settings.siteLogo}
                  onChange={(e) => setSettings({ ...settings, siteLogo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Açıklaması</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={saveSettings}
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">n8n Webhook Ayarları</h2>
            <div className="space-y-4">
              {Object.entries(webhooks).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {key.replace('N8N_', '').replace(/_/g, ' ')}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setWebhooks({ ...webhooks, [key]: e.target.value })}
                    placeholder="https://your-n8n-instance.com/webhook/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
              <button
                onClick={saveWebhooks}
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Kullanıcı Yönetimi</h2>
              <button
                onClick={() => { setEditingUser(null); setShowUserModal(true); }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                + Yeni Kullanıcı
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İsim</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projeler</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{u.email}</td>
                      <td className="px-6 py-4 text-sm">{u.name || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          u.role === 'ADMIN' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{u._count?.projects || 0}</td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => { setEditingUser(u); setShowUserModal(true); }}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          onClose={() => { setShowUserModal(false); setEditingUser(null); }}
          onSave={saveUser}
        />
      )}
    </div>
  );
}

// User Modal Component
function UserModal({ user, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    role: user?.role || 'USER',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">
          {user ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">İsim</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Şifre {user && '(boş bırakılırsa değişmez)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              {...(!user && { required: true })}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
