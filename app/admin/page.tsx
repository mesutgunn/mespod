'use client';

/**
 * Modern Admin Dashboard with Sidebar
 * Material Design inspired UI
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'dashboard' | 'settings' | 'webhooks' | 'users';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  _count: { projects: number };
}

interface Settings {
  siteName: string;
  logoUrl: string;
  description: string;
  n8nEtsyWebhook: string;
  n8nDesignWebhook: string;
  n8nMockupWebhook: string;
  n8nSeoWebhook: string;
}

interface Stats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  totalProjects: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings>({
    siteName: 'MesPOD',
    logoUrl: '',
    description: '',
    n8nEtsyWebhook: '',
    n8nDesignWebhook: '',
    n8nMockupWebhook: '',
    n8nSeoWebhook: '',
  });
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    totalProjects: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user',
  });

  useEffect(() => {
    loadSettings();
    loadUsers();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data) setSettings(data);
    } catch (error) {
      console.error('Load settings error:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
      
      const adminCount = data.filter((u: User) => u.role === 'admin').length;
      const totalProjects = data.reduce((acc: number, u: User) => acc + (u._count?.projects || 0), 0);
      
      setStats({
        totalUsers: data.length,
        adminUsers: adminCount,
        regularUsers: data.length - adminCount,
        totalProjects,
      });
    } catch (error) {
      console.error('Load users error:', error);
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
      alert('Kaydetme hatası!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const openUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        email: user.email,
        name: user.name,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setUserForm({ email: '', name: '', password: '', role: 'user' });
    }
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({ email: '', name: '', password: '', role: 'user' });
  };

  const saveUser = async () => {
    setLoading(true);
    try {
      if (editingUser) {
        await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userForm),
        });
      } else {
        await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userForm),
        });
      }
      closeUserModal();
      loadUsers();
      alert('Kullanıcı kaydedildi!');
    } catch (error) {
      alert('Kaydetme hatası!');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      loadUsers();
      alert('Kullanıcı silindi!');
    } catch (error) {
      alert('Silme hatası!');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#1F2937] text-white flex flex-col">
        <div className="flex items-center gap-3 p-6 border-b border-gray-700/50">
          <div className="bg-indigo-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-white">
            A
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-bold">MesPOD Admin</h1>
            <p className="text-gray-400 text-sm">Yönetim Paneli</p>
          </div>
        </div>

        <nav className="flex-grow p-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                activeTab === 'dashboard'
                  ? 'bg-[#4F46E5]/20 text-white'
                  : 'hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium">Genel Bakış</p>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                activeTab === 'settings'
                  ? 'bg-[#4F46E5]/20 text-white'
                  : 'hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="material-symbols-outlined">settings</span>
              <p className="text-sm font-medium">Sistem Ayarları</p>
            </button>

            <button
              onClick={() => setActiveTab('webhooks')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                activeTab === 'webhooks'
                  ? 'bg-[#4F46E5]/20 text-white'
                  : 'hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="material-symbols-outlined">webhook</span>
              <p className="text-sm font-medium">n8n Webhooks</p>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                activeTab === 'users'
                  ? 'bg-[#4F46E5]/20 text-white'
                  : 'hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="material-symbols-outlined">group</span>
              <p className="text-sm font-medium">Kullanıcılar</p>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-gray-300 w-full"
          >
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium">Çıkış Yap</p>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              <header className="mb-8">
                <h1 className="text-[#111827] text-3xl font-bold tracking-tight mb-2">Genel Bakış</h1>
                <p className="text-[#6B7281] text-base">Sistem istatistiklerini ve kullanıcı aktivitelerini görüntüleyin.</p>
              </header>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="flex justify-between items-start rounded-xl p-6 bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                  <div className="flex flex-col gap-1">
                    <p className="text-[#6B7281] text-sm font-medium">Toplam Kullanıcı</p>
                    <p className="text-[#111827] text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-[#4F46E5]/10 p-2 rounded-full">
                    <span className="material-symbols-outlined text-[#4F46E5]">group</span>
                  </div>
                </div>

                <div className="flex justify-between items-start rounded-xl p-6 bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                  <div className="flex flex-col gap-1">
                    <p className="text-[#6B7281] text-sm font-medium">Admin Kullanıcı</p>
                    <p className="text-[#111827] text-3xl font-bold">{stats.adminUsers}</p>
                  </div>
                  <div className="bg-[#4F46E5]/10 p-2 rounded-full">
                    <span className="material-symbols-outlined text-[#4F46E5]">admin_panel_settings</span>
                  </div>
                </div>

                <div className="flex justify-between items-start rounded-xl p-6 bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                  <div className="flex flex-col gap-1">
                    <p className="text-[#6B7281] text-sm font-medium">Normal Kullanıcı</p>
                    <p className="text-[#111827] text-3xl font-bold">{stats.regularUsers}</p>
                  </div>
                  <div className="bg-[#4F46E5]/10 p-2 rounded-full">
                    <span className="material-symbols-outlined text-[#4F46E5]">person</span>
                  </div>
                </div>

                <div className="flex justify-between items-start rounded-xl p-6 bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                  <div className="flex flex-col gap-1">
                    <p className="text-[#6B7281] text-sm font-medium">Toplam Proje</p>
                    <p className="text-[#111827] text-3xl font-bold">{stats.totalProjects}</p>
                  </div>
                  <div className="bg-[#4F46E5]/10 p-2 rounded-full">
                    <span className="material-symbols-outlined text-[#4F46E5]">folder</span>
                  </div>
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
                <div className="p-6 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-semibold text-[#111827]">Son Kullanıcılar</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-[#111827]">{user.name}</p>
                          <p className="text-xs text-[#6B7281]">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                          <p className="text-xs text-[#6B7281]">
                            {user._count.projects} proje
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <>
              <header className="mb-8">
                <h1 className="text-[#111827] text-3xl font-bold tracking-tight mb-2">Sistem Ayarları</h1>
                <p className="text-[#6B7281] text-base">Site bilgilerini ve genel ayarları yönetin.</p>
              </header>

              <div className="max-w-2xl">
                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-2">
                        Site Adı
                      </label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-2">
                        Logo URL
                      </label>
                      <input
                        type="text"
                        value={settings.logoUrl}
                        onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-2">
                        Site Açıklaması
                      </label>
                      <textarea
                        value={settings.description}
                        onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={saveSettings}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] disabled:opacity-50 font-medium transition"
                    >
                      {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <>
              <header className="mb-8">
                <h1 className="text-[#111827] text-3xl font-bold tracking-tight mb-2">n8n Webhooks</h1>
                <p className="text-[#6B7281] text-base">n8n webhook URL'lerini yapılandırın.</p>
              </header>

              <div className="max-w-2xl">
                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-2">
                        <span className="material-symbols-outlined text-sm align-middle mr-1">link</span>
                        Etsy Scraper Webhook
                      </label>
                      <input
                        type="text"
                        value={settings.n8nEtsyWebhook}
                        onChange={(e) => setSettings({ ...settings, n8nEtsyWebhook: e.target.value })}
                        placeholder="https://your-n8n-instance.com/webhook/etsy"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-2">
                        <span className="material-symbols-outlined text-sm align-middle mr-1">link</span>
                        Design Generate Webhook
                      </label>
                      <input
                        type="text"
                        value={settings.n8nDesignWebhook}
                        onChange={(e) => setSettings({ ...settings, n8nDesignWebhook: e.target.value })}
                        placeholder="https://your-n8n-instance.com/webhook/design"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-2">
                        <span className="material-symbols-outlined text-sm align-middle mr-1">link</span>
                        Mockup Apply Webhook
                      </label>
                      <input
                        type="text"
                        value={settings.n8nMockupWebhook}
                        onChange={(e) => setSettings({ ...settings, n8nMockupWebhook: e.target.value })}
                        placeholder="https://your-n8n-instance.com/webhook/mockup"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-2">
                        <span className="material-symbols-outlined text-sm align-middle mr-1">link</span>
                        SEO Generate Webhook
                      </label>
                      <input
                        type="text"
                        value={settings.n8nSeoWebhook}
                        onChange={(e) => setSettings({ ...settings, n8nSeoWebhook: e.target.value })}
                        placeholder="https://your-n8n-instance.com/webhook/seo"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={saveSettings}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] disabled:opacity-50 font-medium transition"
                    >
                      {loading ? 'Kaydediliyor...' : 'Webhook\'ları Kaydet'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <>
              <header className="mb-8 flex justify-between items-center">
                <div>
                  <h1 className="text-[#111827] text-3xl font-bold tracking-tight mb-2">Kullanıcı Yönetimi</h1>
                  <p className="text-[#6B7281] text-base">Tüm kullanıcıları görüntüleyin ve yönetin.</p>
                </div>
                <button
                  onClick={() => openUserModal()}
                  className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] font-medium transition"
                >
                  <span className="material-symbols-outlined">add</span>
                  Yeni Kullanıcı
                </button>
              </header>

              <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Projeler
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kayıt Tarihi
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-[#111827]">{user.name}</p>
                            <p className="text-sm text-[#6B7281]">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B7281]">
                          {user._count.projects}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B7281]">
                          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openUserModal(user)}
                              className="p-2 text-[#4F46E5] hover:bg-indigo-50 rounded-lg transition"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-[#111827] mb-6">
              {editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">İsim</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Şifre {editingUser && '(Boş bırakın değiştirmemek için)'}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">Rol</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeUserModal}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
              >
                İptal
              </button>
              <button
                onClick={saveUser}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] disabled:opacity-50 font-medium transition"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
