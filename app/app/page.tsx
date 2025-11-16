'use client';

/**
 * Modern User Dashboard with Sidebar
 * Material Design inspired UI
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'dashboard' | 'new-project' | 'projects' | 'designs' | 'mockups' | 'seo';

interface Project {
  id: string;
  etsyUrl: string;
  etsyTitle?: string;
  status: string;
  createdAt: string;
  designs: Design[];
  _count: { designs: number };
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

interface Stats {
  totalProjects: number;
  totalDesigns: number;
  totalMockups: number;
  totalSEO: number;
}

export default function UserAppPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalDesigns: 0,
    totalMockups: 0,
    totalSEO: 0,
  });
  const [loading, setLoading] = useState(false);

  // New project workflow state
  const [etsyUrl, setEtsyUrl] = useState('');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [designs, setDesigns] = useState<any[]>([]);
  const [mockups, setMockups] = useState<any[]>([]);
  const [seoContent, setSeoContent] = useState<any>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
      
      // Calculate stats
      const totalDesigns = data.reduce((acc: number, p: Project) => acc + (p._count?.designs || 0), 0);
      const totalMockups = data.reduce((acc: number, p: Project) => {
        return acc + p.designs.filter((d: Design) => d.mockupUrl).length;
      }, 0);
      const totalSEO = data.reduce((acc: number, p: Project) => {
        return acc + p.designs.filter((d: Design) => d.seoTitle).length;
      }, 0);
      
      setStats({
        totalProjects: data.length,
        totalDesigns,
        totalMockups,
        totalSEO,
      });
    } catch (error) {
      console.error('Load projects error:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const startNewProject = async () => {
    if (!etsyUrl) return;
    
    setLoading(true);
    try {
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etsyUrl }),
      });
      const project = await projectRes.json();
      setCurrentProject(project);

      const res = await fetch('/api/mespod/etsy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: etsyUrl }),
      });
      const data = await res.json();
      
      await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etsyTitle: data.title,
          etsyDesc: data.description,
          etsyTags: data.tags,
        }),
      });
      
      alert('Etsy analizi tamamlandı! Şimdi tasarımlar sekmesine gidin.');
      setActiveTab('designs');
      loadProjects();
    } catch (error) {
      alert('Etsy analizi başarısız!');
    } finally {
      setLoading(false);
    }
  };

  const generateDesigns = async () => {
    if (!currentProject) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/mespod/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImageUrl: 'https://via.placeholder.com/400',
          stylePrompt: currentProject.etsyTitle || '',
        }),
      });
      const data = await res.json();
      setDesigns(data.variants || []);
      
      for (const design of data.variants || []) {
        await fetch(`/api/projects/${currentProject.id}/designs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: design.imageUrl,
            prompt: design.prompt,
          }),
        });
      }
      
      alert('Tasarımlar oluşturuldu!');
      loadProjects();
    } catch (error) {
      alert('Tasarım üretimi başarısız!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#1F2937] text-white flex flex-col">
        <div className="flex items-center gap-3 p-6 border-b border-gray-700/50">
          <div className="bg-indigo-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-white">
            M
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-bold">MesPOD</h1>
            <p className="text-gray-400 text-sm">Etsy POD Otomasyon</p>
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
              onClick={() => setActiveTab('new-project')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                activeTab === 'new-project'
                  ? 'bg-[#4F46E5]/20 text-white'
                  : 'hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="material-symbols-outlined">add_circle</span>
              <p className="text-sm font-medium">Yeni Proje</p>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                activeTab === 'projects'
                  ? 'bg-[#4F46E5]/20 text-white'
                  : 'hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="material-symbols-outlined">folder</span>
              <p className="text-sm font-medium">Projelerim</p>
            </button>

            <button
              onClick={() => setActiveTab('designs')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                activeTab === 'designs'
                  ? 'bg-[#4F46E5]/20 text-white'
                  : 'hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="material-symbols-outlined">design_services</span>
              <p className="text-sm font-medium">Tasarımlar</p>
            </button>

            <button
              onClick={() => setActiveTab('mockups')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                activeTab === 'mockups'
                  ? 'bg-[#4F46E5]/20 text-white'
                  : 'hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="material-symbols-outlined">palette</span>
              <p className="text-sm font-medium">Mockups</p>
            </button>

            <button
              onClick={() => setActiveTab('seo')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                activeTab === 'seo'
                  ? 'bg-[#4F46E5]/20 text-white'
                  : 'hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="material-symbols-outlined">search</span>
              <p className="text-sm font-medium">SEO</p>
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
                <p className="text-[#6B7281] text-base">Hesabınızla gerçekleştirdiğiniz işlemlerin özetini görüntüleyin.</p>
              </header>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="flex justify-between items-start rounded-xl p-6 bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                  <div className="flex flex-col gap-1">
                    <p className="text-[#6B7281] text-sm font-medium">Toplam Proje</p>
                    <p className="text-[#111827] text-3xl font-bold">{stats.totalProjects}</p>
                  </div>
                  <div className="bg-[#4F46E5]/10 p-2 rounded-full">
                    <span className="material-symbols-outlined text-[#4F46E5]">query_stats</span>
                  </div>
                </div>

                <div className="flex justify-between items-start rounded-xl p-6 bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                  <div className="flex flex-col gap-1">
                    <p className="text-[#6B7281] text-sm font-medium">Üretilen Tasarım</p>
                    <p className="text-[#111827] text-3xl font-bold">{stats.totalDesigns}</p>
                  </div>
                  <div className="bg-[#4F46E5]/10 p-2 rounded-full">
                    <span className="material-symbols-outlined text-[#4F46E5]">auto_awesome</span>
                  </div>
                </div>

                <div className="flex justify-between items-start rounded-xl p-6 bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                  <div className="flex flex-col gap-1">
                    <p className="text-[#6B7281] text-sm font-medium">Oluşturulan Mockup</p>
                    <p className="text-[#111827] text-3xl font-bold">{stats.totalMockups}</p>
                  </div>
                  <div className="bg-[#4F46E5]/10 p-2 rounded-full">
                    <span className="material-symbols-outlined text-[#4F46E5]">view_in_ar</span>
                  </div>
                </div>

                <div className="flex justify-between items-start rounded-xl p-6 bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                  <div className="flex flex-col gap-1">
                    <p className="text-[#6B7281] text-sm font-medium">Üretilen SEO</p>
                    <p className="text-[#111827] text-3xl font-bold">{stats.totalSEO}</p>
                  </div>
                  <div className="bg-[#4F46E5]/10 p-2 rounded-full">
                    <span className="material-symbols-outlined text-[#4F46E5]">sell</span>
                  </div>
                </div>
              </div>

              {/* Recent Projects */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
                  <div className="p-6 border-b border-[#E5E7EB]">
                    <h2 className="text-lg font-semibold text-[#111827]">Son Projeler</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex justify-between items-center">
                        <p className="text-sm font-medium text-[#111827] truncate pr-4">
                          {project.etsyTitle || 'Başlıksız Proje'}
                        </p>
                        <p className="text-sm text-[#6B7281] whitespace-nowrap">
                          {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">Henüz proje yok</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
                  <div className="p-6 border-b border-[#E5E7EB]">
                    <h2 className="text-lg font-semibold text-[#111827]">Hızlı İşlemler</h2>
                  </div>
                  <div className="p-6 space-y-3">
                    <button
                      onClick={() => setActiveTab('new-project')}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition"
                    >
                      <span className="material-symbols-outlined">add_circle</span>
                      <span className="font-medium">Yeni Proje Başlat</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <span className="material-symbols-outlined">folder</span>
                      <span className="font-medium">Projelerime Git</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* New Project Tab */}
          {activeTab === 'new-project' && (
            <>
              <header className="mb-8">
                <h1 className="text-[#111827] text-3xl font-bold tracking-tight mb-2">Yeni Proje</h1>
                <p className="text-[#6B7281] text-base">Etsy ürün URL'i ile yeni bir proje başlatın</p>
              </header>

              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-8">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#111827] mb-2">
                      Etsy Ürün URL'i
                    </label>
                    <input
                      type="text"
                      value={etsyUrl}
                      onChange={(e) => setEtsyUrl(e.target.value)}
                      placeholder="https://www.etsy.com/listing/..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={startNewProject}
                    disabled={!etsyUrl || loading}
                    className="w-full px-6 py-3 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                  >
                    {loading ? 'Analiz Ediliyor...' : 'Projeyi Başlat'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <>
              <header className="mb-8">
                <h1 className="text-[#111827] text-3xl font-bold tracking-tight mb-2">Projelerim</h1>
                <p className="text-[#6B7281] text-base">Tüm projelerinizi görüntüleyin ve yönetin</p>
              </header>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {project.etsyTitle || 'Başlıksız Proje'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        project.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : project.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{project._count.designs} tasarım</p>
                    <p className="text-xs text-gray-500 mb-4">
                      {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] text-sm">
                        Görüntüle
                      </button>
                      <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm">
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
                
                {projects.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">folder_off</span>
                    <p className="text-gray-500 mb-4">Henüz proje oluşturmadınız</p>
                    <button
                      onClick={() => setActiveTab('new-project')}
                      className="px-6 py-3 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA]"
                    >
                      İlk Projenizi Oluşturun
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Designs Tab */}
          {activeTab === 'designs' && (
            <>
              <header className="mb-8">
                <h1 className="text-[#111827] text-3xl font-bold tracking-tight mb-2">Tasarımlar</h1>
                <p className="text-[#6B7281] text-base">AI ile tasarım varyantları oluşturun</p>
              </header>

              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-8">
                  {currentProject ? (
                    <>
                      <h3 className="text-lg font-semibold mb-4">{currentProject.etsyTitle}</h3>
                      <button
                        onClick={generateDesigns}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] disabled:opacity-50 font-medium"
                      >
                        {loading ? 'Üretiliyor...' : 'Tasarım Varyantları Üret'}
                      </button>
                      
                      {designs.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          {designs.map((design, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                              <img
                                src={design.imageUrl}
                                alt={`Design ${idx + 1}`}
                                className="w-full h-48 object-cover rounded mb-2"
                              />
                              <p className="text-sm text-gray-600">{design.prompt}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">Önce bir proje başlatın</p>
                      <button
                        onClick={() => setActiveTab('new-project')}
                        className="px-6 py-3 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA]"
                      >
                        Yeni Proje Başlat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Mockups & SEO Tabs - Similar structure */}
          {(activeTab === 'mockups' || activeTab === 'seo') && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">
                {activeTab === 'mockups' ? 'palette' : 'search'}
              </span>
              <p className="text-gray-500 mb-4">Bu özellik yakında eklenecek</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
