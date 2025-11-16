'use client';

/**
 * Enhanced User Dashboard
 * - Project History & Management
 * - New Project Creation
 * - Design Variants Management
 * - Mockup Generation
 * - SEO Content Generation
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'new' | 'projects';
type Step = 'url' | 'designs' | 'mockups' | 'seo';

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

export default function UserAppPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('new');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // New project state
  const [currentStep, setCurrentStep] = useState<Step>('url');
  const [etsyUrl, setEtsyUrl] = useState('');
  const [etsyData, setEtsyData] = useState<any>(null);
  const [designs, setDesigns] = useState<any[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [mockups, setMockups] = useState<any[]>([]);
  const [seoContent, setSeoContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'projects') {
      loadProjects();
    }
  }, [activeTab]);

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('Load projects error:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const analyzeEtsy = async () => {
    if (!etsyUrl) return;
    
    setLoading(true);
    try {
      // Create project
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etsyUrl }),
      });
      const project = await projectRes.json();
      setCurrentProjectId(project.id);

      // Analyze Etsy
      const res = await fetch('/api/mespod/etsy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: etsyUrl }),
      });
      const data = await res.json();
      setEtsyData(data);
      
      // Update project with Etsy data
      await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etsyTitle: data.title,
          etsyDesc: data.description,
          etsyTags: data.tags,
        }),
      });
      
      setCurrentStep('designs');
    } catch (error) {
      alert('Etsy analizi başarısız!');
    } finally {
      setLoading(false);
    }
  };

  const generateDesigns = async () => {
    if (!etsyData?.imageUrls?.[0]) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/mespod/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImageUrl: etsyData.imageUrls[0],
          stylePrompt: etsyData.title,
        }),
      });
      const data = await res.json();
      setDesigns(data.variants || []);
      
      // Save designs to project
      if (currentProjectId) {
        for (const design of data.variants || []) {
          await fetch(`/api/projects/${currentProjectId}/designs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageUrl: design.imageUrl,
              prompt: design.prompt,
            }),
          });
        }
      }
      
      setCurrentStep('mockups');
    } catch (error) {
      alert('Tasarım üretimi başarısız!');
    } finally {
      setLoading(false);
    }
  };

  const generateMockup = async (design: any, template: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/mespod/mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designImageUrl: design.imageUrl,
          mockupTemplateId: template,
        }),
      });
      const data = await res.json();
      
      setMockups([...mockups, { ...data, designId: design.id, template }]);
      setSelectedDesign(design);
      setCurrentStep('seo');
    } catch (error) {
      alert('Mockup oluşturma başarısız!');
    } finally {
      setLoading(false);
    }
  };

  const generateSEO = async () => {
    if (!mockups[0]) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/mespod/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseTitle: etsyData?.title || '',
          baseDescription: etsyData?.description || '',
          baseTags: etsyData?.tags || [],
          mockupImageUrl: mockups[0].mockupImageUrl,
        }),
      });
      const data = await res.json();
      setSeoContent(data);
      
      // Update project status
      if (currentProjectId) {
        await fetch(`/api/projects/${currentProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' }),
        });
      }
    } catch (error) {
      alert('SEO üretimi başarısız!');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Kopyalandı!');
  };

  const resetWorkflow = () => {
    setCurrentStep('url');
    setEtsyUrl('');
    setEtsyData(null);
    setDesigns([]);
    setMockups([]);
    setSeoContent(null);
    setSelectedDesign(null);
    setCurrentProjectId(null);
  };

  const viewProject = async (project: Project) => {
    setSelectedProject(project);
    
    // Load full project details
    const res = await fetch(`/api/projects/${project.id}`);
    const data = await res.json();
    setSelectedProject(data);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      loadProjects();
    } catch (error) {
      alert('Silme hatası!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">MesPOD</h1>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('new')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'new'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Yeni Proje
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Projelerim ({projects.length})
            </button>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* New Project Tab */}
        {activeTab === 'new' && (
          <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[
                  { id: 'url', label: '1. Etsy URL' },
                  { id: 'designs', label: '2. Tasarımlar' },
                  { id: 'mockups', label: '3. Mockup' },
                  { id: 'seo', label: '4. SEO' },
                ].map((step, idx) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          currentStep === step.id
                            ? 'bg-primary-600 text-white'
                            : idx < ['url', 'designs', 'mockups', 'seo'].indexOf(currentStep)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-sm mt-2 text-center">{step.label}</span>
                    </div>
                    {idx < 3 && (
                      <div
                        className={`h-1 flex-1 mx-2 ${
                          idx < ['url', 'designs', 'mockups', 'seo'].indexOf(currentStep)
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Etsy URL */}
            {currentStep === 'url' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-4">Etsy Ürün URL'i</h2>
                <p className="text-gray-600 mb-6">
                  Analiz etmek istediğiniz popüler Etsy ürününün URL'ini girin
                </p>
                <input
                  type="text"
                  value={etsyUrl}
                  onChange={(e) => setEtsyUrl(e.target.value)}
                  placeholder="https://www.etsy.com/listing/..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 mb-4"
                />
                <button
                  onClick={analyzeEtsy}
                  disabled={!etsyUrl || loading}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Analiz Ediliyor...' : 'Analiz Et'}
                </button>
              </div>
            )}

            {/* Step 2: Design Variants */}
            {currentStep === 'designs' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-4">Tasarım Varyantları</h2>
                {etsyData && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">{etsyData.title}</h3>
                    <p className="text-sm text-gray-600">{etsyData.description}</p>
                  </div>
                )}
                
                {designs.length === 0 ? (
                  <button
                    onClick={generateDesigns}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Üretiliyor...' : 'Tasarım Varyantları Üret'}
                  </button>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
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
                    <button
                      onClick={() => setCurrentStep('mockups')}
                      className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Devam Et
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Mockups */}
            {currentStep === 'mockups' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-4">Mockup Şablonu Seç</h2>
                <p className="text-gray-600 mb-6">Tasarımlarınızı hangi ürüne uygulamak istersiniz?</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {designs.slice(0, 1).map((design, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <img
                        src={design.imageUrl}
                        alt="Selected design"
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {['tshirt', 'sweatshirt', 'hoodie'].map((template) => (
                    <button
                      key={template}
                      onClick={() => generateMockup(designs[0], template)}
                      disabled={loading}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 disabled:opacity-50"
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">👕</div>
                        <div className="font-medium capitalize">{template}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {mockups.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {mockups.map((mockup, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <img
                          src={mockup.mockupImageUrl}
                          alt={`Mockup ${idx + 1}`}
                          className="w-full h-64 object-cover rounded"
                        />
                        <p className="text-sm text-center mt-2 capitalize">{mockup.template}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: SEO */}
            {currentStep === 'seo' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-4">SEO İçeriği</h2>
                
                {!seoContent ? (
                  <button
                    onClick={generateSEO}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Üretiliyor...' : 'SEO İçeriği Üret'}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-2">Başlık</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={seoContent.title}
                          readOnly
                          className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
                        />
                        <button
                          onClick={() => copyToClipboard(seoContent.title)}
                          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          Kopyala
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-2">Açıklama</label>
                      <div className="flex gap-2">
                        <textarea
                          value={seoContent.description}
                          readOnly
                          rows={4}
                          className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
                        />
                        <button
                          onClick={() => copyToClipboard(seoContent.description)}
                          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          Kopyala
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-2">Etiketler</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={seoContent.tags?.join(', ')}
                          readOnly
                          className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
                        />
                        <button
                          onClick={() => copyToClipboard(seoContent.tags?.join(', '))}
                          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          Kopyala
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={resetWorkflow}
                        className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Yeni Proje Başlat
                      </button>
                      <button
                        onClick={() => setActiveTab('projects')}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                      >
                        Projelerime Git
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            {selectedProject ? (
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="mb-4 text-primary-600 hover:text-primary-700"
                >
                  ← Geri
                </button>
                
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h2 className="text-2xl font-bold mb-4">{selectedProject.etsyTitle || 'Proje Detayı'}</h2>
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedProject.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedProject.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedProject.status}
                    </span>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Etsy URL</h3>
                      <a
                        href={selectedProject.etsyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {selectedProject.etsyUrl}
                      </a>
                    </div>

                    {selectedProject.designs && selectedProject.designs.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-4">Tasarımlar ({selectedProject.designs.length})</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedProject.designs.map((design) => (
                            <div key={design.id} className="border rounded-lg p-4">
                              <img
                                src={design.imageUrl}
                                alt="Design"
                                className="w-full h-48 object-cover rounded mb-2"
                              />
                              {design.mockupUrl && (
                                <img
                                  src={design.mockupUrl}
                                  alt="Mockup"
                                  className="w-full h-48 object-cover rounded mb-2"
                                />
                              )}
                              {design.seoTitle && (
                                <div className="mt-2 text-sm">
                                  <p className="font-medium">{design.seoTitle}</p>
                                  <p className="text-gray-600 text-xs mt-1">{design.seoDescription}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
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
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {project._count.designs} tasarım
                    </p>
                    
                    <p className="text-xs text-gray-500 mb-4">
                      {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewProject(project)}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                      >
                        Görüntüle
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
                
                {projects.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 mb-4">Henüz proje oluşturmadınız</p>
                    <button
                      onClick={() => setActiveTab('new')}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      İlk Projenizi Oluşturun
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
