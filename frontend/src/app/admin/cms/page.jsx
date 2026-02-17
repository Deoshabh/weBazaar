'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { adminAPI } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import {
  FiHome, FiImage, FiLayout, FiTrash2, FiPlus, FiArrowUp, FiArrowDown,
  FiFileText, FiPhone, FiSettings, FiSave, FiInfo, FiStar,
} from 'react-icons/fi';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import {
  Card, SectionToggle, Field, TextInput, TextArea, ColorPicker,
  CollapsibleSection, SaveButton, TabButton,
} from '@/components/admin/cms/CmsUiKit';

/* ================================================================
   ADMIN CMS PAGE — 9-Tab Dashboard
================================================================ */
export default function AdminCMSPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { refreshSettings } = useSiteSettings();

  const [activeTab, setActiveTab] = useState('homepage');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ── State ── */
  const [branding, setBranding] = useState({ logo: { url: '', alt: 'Logo' }, favicon: { url: '' }, siteName: 'RADEO' });
  const [banners, setBanners] = useState([]);
  const [announcementBar, setAnnouncementBar] = useState({
    enabled: true, text: '', link: '', backgroundColor: '#10b981', textColor: '#ffffff', dismissible: true,
  });
  const [homeSections, setHomeSections] = useState({
    heroSection: {}, marquee: {}, featuredProducts: {}, craftProcess: {},
    heritage: {}, story: {}, testimonials: {}, ctaBanner: {},
    madeToOrder: {}, newsletter: {},
  });
  const [advancedSettings, setAdvancedSettings] = useState({});
  const [selectedPolicy, setSelectedPolicy] = useState('shippingPolicy');

  /* ── Auth guard ── */
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) router.push('/');
  }, [user, isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') fetchSettings();
  }, [isAuthenticated, user]);

  /* ── Fetch ── */
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [mainRes, advRes] = await Promise.all([
        adminAPI.getAllSettings(),
        adminAPI.getAdvancedSettings(),
      ]);
      const s = mainRes.data.settings;

      // Normalize advanced settings — the endpoint may return an array
      let advObj = advRes.data.settings || {};
      if (Array.isArray(advObj)) {
        advObj = advObj.reduce((acc, item) => {
          if (item?.key) acc[item.key] = item.value;
          return acc;
        }, {});
      }

      setAdvancedSettings({
        ...advObj,
        theme: { ...(s.theme || {}), ...(advObj.theme || {}) },
      });
      setBranding(s.branding || { logo: {}, favicon: {}, siteName: '' });
      setBanners(s.banners || s.bannerSystem?.banners || []);
      setAnnouncementBar(s.announcementBar || {
        enabled: true, text: '', link: '', backgroundColor: '#10b981', textColor: '#ffffff', dismissible: true,
      });
      setHomeSections(s.homeSections || {});
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      if (error.response?.status === 401) { toast.error('Session expired'); router.push('/auth/login'); }
      else toast.error('Failed to load settings');
    } finally { setLoading(false); }
  };

  /* ── Upload helper ── */
  const uploadImage = async (file) => {
    if (!file) return null;
    const { data: rd } = await adminAPI.getUploadUrl({ fileName: file.name, fileType: file.type, folder: 'cms' });
    const u = rd?.data || rd;
    await fetch(u.signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    return u.publicUrl;
  };

  /* ── Generic save wrappers ── */
  const saveMain = async (payload, successMsg) => {
    try {
      setSaving(true);
      await adminAPI.updateSettings(payload);
      toast.success(successMsg);
      refreshSettings();
    } catch (err) {
      console.error('Save failed:', err);
      if (err.response?.status === 401) { toast.error('Session expired'); router.push('/auth/login'); }
      else toast.error('Failed to save');
    } finally { setSaving(false); }
  };

  const saveAdvanced = async (key, value) => {
    try {
      setSaving(true);
      await adminAPI.updateSetting(key, value);
      toast.success('Setting saved');
      setAdvancedSettings(prev => ({ ...prev, [key]: value }));
      refreshSettings();
    } catch (err) {
      console.error(`Failed to save ${key}:`, err);
      if (err.response?.status === 401) { toast.error('Session expired'); router.push('/auth/login'); }
      else toast.error(`Failed to save ${key}`);
    } finally { setSaving(false); }
  };

  /* ── Section helpers ── */
  const sec = (section, field) => homeSections[section]?.[field] ?? '';
  const setSec = (section, field, value) => setHomeSections(prev => ({
    ...prev, [section]: { ...prev[section], [field]: value },
  }));
  const setSecArr = (section, field, index, subField, value) => {
    setHomeSections(prev => {
      const arr = [...(prev[section]?.[field] || [])];
      arr[index] = { ...arr[index], [subField]: value };
      return { ...prev, [section]: { ...prev[section], [field]: arr } };
    });
  };
  const addArrItem = (section, field, template) => {
    setHomeSections(prev => {
      const arr = [...(prev[section]?.[field] || [])];
      arr.push({ ...template, id: `item-${Date.now()}` });
      return { ...prev, [section]: { ...prev[section], [field]: arr } };
    });
  };
  const removeArrItem = (section, field, index) => {
    setHomeSections(prev => {
      const arr = [...(prev[section]?.[field] || [])];
      arr.splice(index, 1);
      return { ...prev, [section]: { ...prev[section], [field]: arr } };
    });
  };

  /* ── Theme helpers ── */
  const themeVal = (key) => advancedSettings.theme?.[key] || '';
  const setTheme = (key, val) => setAdvancedSettings(prev => ({
    ...prev, theme: { ...(prev.theme || {}), [key]: val },
  }));

  /* ── Banner helpers ── */
  const handleAddBanner = () => setBanners(prev => [...prev, {
    id: Date.now().toString(), imageUrl: '', title: 'New Banner', subtitle: '',
    link: '/products', buttonText: 'Shop Now', isActive: true, order: prev.length,
    _file: null, _preview: null,
  }]);
  const handleRemoveBanner = (i) => setBanners(prev => prev.filter((_, idx) => idx !== i));
  const handleMoveBanner = (i, dir) => {
    const nb = [...banners]; const ti = i + dir;
    if (ti >= 0 && ti < nb.length) { [nb[i], nb[ti]] = [nb[ti], nb[i]]; nb.forEach((b, idx) => b.order = idx); setBanners(nb); }
  };
  const bannerSet = (i, f, v) => { const nb = [...banners]; nb[i] = { ...nb[i], [f]: v }; setBanners(nb); };

  const handleSaveBanners = async () => {
    try {
      setSaving(true);
      const updated = [...banners];
      for (let i = 0; i < updated.length; i++) {
        if (updated[i]._file) {
          updated[i].imageUrl = await uploadImage(updated[i]._file);
          delete updated[i]._file; delete updated[i]._preview;
        }
      }
      await adminAPI.updateSettings({ banners: updated });
      toast.success('Banners saved!'); setBanners(updated); refreshSettings();
    } catch (err) {
      toast.error('Failed to save banners');
    } finally { setSaving(false); }
  };

  /* ── Loading ── */
  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-primary-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900" />
        </div>
      </AdminLayout>
    );
  }

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <AdminLayout>
      <div className="min-h-screen bg-primary-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-900">CMS & Site Settings</h1>
            <p className="text-primary-600 mt-1">Manage your website&apos;s look and feel</p>
          </div>

          {/* ── Tabs ── */}
          <div className="bg-white rounded-lg shadow-sm mb-6 flex overflow-x-auto scrollbar-hide">
            <TabButton active={activeTab === 'homepage'} onClick={() => setActiveTab('homepage')} icon={<FiHome className="w-4 h-4" />} label="Homepage" />
            <TabButton active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} icon={<FiImage className="w-4 h-4" />} label="Branding" />
            <TabButton active={activeTab === 'banners'} onClick={() => setActiveTab('banners')} icon={<FiLayout className="w-4 h-4" />} label="Banners" />
            <TabButton active={activeTab === 'announcement'} onClick={() => setActiveTab('announcement')} icon={<span>📢</span>} label="Announcement" />
            <TabButton active={activeTab === 'theme'} onClick={() => setActiveTab('theme')} icon={<span>🎨</span>} label="Theme" />
            <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={<FiInfo className="w-4 h-4" />} label="About" />
            <TabButton active={activeTab === 'policies'} onClick={() => setActiveTab('policies')} icon={<FiFileText className="w-4 h-4" />} label="Policies" />
            <TabButton active={activeTab === 'contact'} onClick={() => setActiveTab('contact')} icon={<FiPhone className="w-4 h-4" />} label="Contact" />
            <TabButton active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<FiSettings className="w-4 h-4" />} label="System" />
          </div>

          {/* ============================================================
              1. HOMEPAGE TAB
          ============================================================ */}
          {activeTab === 'homepage' && (
            <div className="space-y-4">
              {/* ── Hero Section ── */}
              <CollapsibleSection title="Hero Section" icon={<FiStar className="w-4 h-4" />} badge={sec('heroSection', 'enabled') !== false ? 'ON' : 'OFF'} defaultOpen>
                <SectionToggle label="Enable Hero Section" enabled={sec('heroSection', 'enabled') !== false} onChange={v => setSec('heroSection', 'enabled', v)} />
                <Field label="Eyebrow Text"><TextInput value={sec('heroSection', 'eyebrow')} onChange={v => setSec('heroSection', 'eyebrow', v)} placeholder="NEW COLLECTION" /></Field>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Field label="Title Line 1"><TextInput value={sec('heroSection', 'title')} onChange={v => setSec('heroSection', 'title', v)} placeholder="Step Into" /></Field>
                  <Field label="Title Line 2"><TextInput value={sec('heroSection', 'subtitle')} onChange={v => setSec('heroSection', 'subtitle', v)} placeholder="Conscious Style" /></Field>
                  <Field label="Title Line 3"><TextInput value={sec('heroSection', 'titleLine3')} onChange={v => setSec('heroSection', 'titleLine3', v)} placeholder="(optional)" /></Field>
                </div>
                <Field label="Description"><TextArea value={sec('heroSection', 'description')} onChange={v => setSec('heroSection', 'description', v)} placeholder="Hero description..." /></Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Primary Button Text"><TextInput value={sec('heroSection', 'primaryButtonText')} onChange={v => setSec('heroSection', 'primaryButtonText', v)} /></Field>
                  <Field label="Primary Button Link"><TextInput value={sec('heroSection', 'primaryButtonLink')} onChange={v => setSec('heroSection', 'primaryButtonLink', v)} /></Field>
                  <Field label="Secondary Button Text"><TextInput value={sec('heroSection', 'secondaryButtonText')} onChange={v => setSec('heroSection', 'secondaryButtonText', v)} /></Field>
                  <Field label="Secondary Button Link"><TextInput value={sec('heroSection', 'secondaryButtonLink')} onChange={v => setSec('heroSection', 'secondaryButtonLink', v)} /></Field>
                </div>
                <Field label="Hero Image URL" hint="Paste URL or upload via Banners tab">
                  <TextInput value={sec('heroSection', 'imageUrl')} onChange={v => setSec('heroSection', 'imageUrl', v)} placeholder="https://..." />
                  {sec('heroSection', 'imageUrl') && (
                    <div className="mt-2 relative w-full h-40 rounded overflow-hidden bg-gray-100">
                      <Image src={sec('heroSection', 'imageUrl')} alt="Hero preview" fill className="object-cover" />
                    </div>
                  )}
                </Field>
                {/* Stats array */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-900">Stats</span>
                    <button type="button" onClick={() => addArrItem('heroSection', 'stats', { number: '0', label: 'Label' })} className="text-xs text-primary-700 hover:text-primary-900 flex items-center gap-1"><FiPlus className="w-3 h-3" /> Add Stat</button>
                  </div>
                  {(homeSections.heroSection?.stats || []).map((stat, i) => (
                    <div key={stat.id || i} className="flex items-center gap-2 mb-2">
                      <TextInput value={stat.number} onChange={v => setSecArr('heroSection', 'stats', i, 'number', v)} placeholder="100+" className="w-24" />
                      <TextInput value={stat.label} onChange={v => setSecArr('heroSection', 'stats', i, 'label', v)} placeholder="Label" className="flex-1" />
                      <button type="button" onClick={() => removeArrItem('heroSection', 'stats', i)} className="text-red-400 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* ── Marquee ── */}
              <CollapsibleSection title="Marquee / Scrolling Text" badge={sec('marquee', 'enabled') !== false ? 'ON' : 'OFF'}>
                <SectionToggle label="Enable Marquee" enabled={sec('marquee', 'enabled') !== false} onChange={v => setSec('marquee', 'enabled', v)} />
                <Field label="Scrolling Text"><TextInput value={sec('marquee', 'text')} onChange={v => setSec('marquee', 'text', v)} placeholder="HANDCRAFTED LUXURY • VEGAN LEATHER •" /></Field>
              </CollapsibleSection>

              {/* ── Collection / Featured Products ── */}
              <CollapsibleSection title="Collection / Featured Products" badge={sec('featuredProducts', 'enabled') !== false ? 'ON' : 'OFF'}>
                <SectionToggle label="Enable Collection" enabled={sec('featuredProducts', 'enabled') !== false} onChange={v => setSec('featuredProducts', 'enabled', v)} />
                <Field label="Section Title"><TextInput value={sec('featuredProducts', 'title')} onChange={v => setSec('featuredProducts', 'title', v)} placeholder="Featured Collection" /></Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Product Source">
                    <select className="input w-full" value={sec('featuredProducts', 'productSelection') || 'latest'} onChange={e => setSec('featuredProducts', 'productSelection', e.target.value)}>
                      <option value="latest">Latest</option>
                      <option value="top-rated">Top Rated</option>
                      <option value="featured">Featured</option>
                    </select>
                  </Field>
                  <Field label="Product Limit">
                    <TextInput type="number" value={sec('featuredProducts', 'productLimit') || 8} onChange={v => setSec('featuredProducts', 'productLimit', Number(v))} />
                  </Field>
                </div>
              </CollapsibleSection>

              {/* ── Craft / Process ── */}
              <CollapsibleSection title="Craft / Process Section" badge={sec('craftProcess', 'enabled') !== false ? 'ON' : 'OFF'}>
                <SectionToggle label="Enable Craft Section" enabled={sec('craftProcess', 'enabled') !== false} onChange={v => setSec('craftProcess', 'enabled', v)} />
                <Field label="Section Title"><TextInput value={sec('craftProcess', 'title')} onChange={v => setSec('craftProcess', 'title', v)} placeholder="Our Craft" /></Field>
                {/* Process Images */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map(i => (
                    <Field key={i} label={`Image ${i + 1}`}>
                      <TextInput value={(homeSections.craftProcess?.images || [])[i] || ''} onChange={v => {
                        const imgs = [...(homeSections.craftProcess?.images || ['', '', '', ''])];
                        imgs[i] = v;
                        setSec('craftProcess', 'images', imgs);
                      }} placeholder="Image URL" />
                    </Field>
                  ))}
                </div>
                {/* Features */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-900">Features</span>
                    <button type="button" onClick={() => addArrItem('craftProcess', 'features', { number: '01', name: 'Feature', description: '' })} className="text-xs text-primary-700 hover:text-primary-900 flex items-center gap-1"><FiPlus className="w-3 h-3" /> Add</button>
                  </div>
                  {(homeSections.craftProcess?.features || []).map((feat, i) => (
                    <div key={feat.id || i} className="flex items-start gap-2 mb-2 bg-gray-50 p-2 rounded">
                      <TextInput value={feat.number} onChange={v => setSecArr('craftProcess', 'features', i, 'number', v)} placeholder="01" className="w-16" />
                      <TextInput value={feat.name} onChange={v => setSecArr('craftProcess', 'features', i, 'name', v)} placeholder="Name" className="flex-1" />
                      <TextInput value={feat.description} onChange={v => setSecArr('craftProcess', 'features', i, 'description', v)} placeholder="Description" className="flex-1" />
                      <button type="button" onClick={() => removeArrItem('craftProcess', 'features', i)} className="text-red-400 hover:text-red-600 mt-2"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* ── Heritage / Agra ── */}
              <CollapsibleSection title="Heritage / Agra Section" badge={sec('heritage', 'enabled') !== false ? 'ON' : 'OFF'}>
                <SectionToggle label="Enable Heritage" enabled={sec('heritage', 'enabled') !== false} onChange={v => setSec('heritage', 'enabled', v)} />
                <Field label="Title"><TextInput value={sec('heritage', 'title')} onChange={v => setSec('heritage', 'title', v)} placeholder="Agra's Heritage" /></Field>
                <Field label="Description"><TextArea value={sec('heritage', 'description')} onChange={v => setSec('heritage', 'description', v)} /></Field>
                <Field label="Image URL"><TextInput value={sec('heritage', 'imageUrl')} onChange={v => setSec('heritage', 'imageUrl', v)} placeholder="https://..." /></Field>
                {/* Heritage points */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-900">Heritage Points</span>
                    <button type="button" onClick={() => addArrItem('heritage', 'points', { icon: '🏛️', title: 'Point', description: '' })} className="text-xs text-primary-700 hover:text-primary-900 flex items-center gap-1"><FiPlus className="w-3 h-3" /> Add</button>
                  </div>
                  {(homeSections.heritage?.points || []).map((pt, i) => (
                    <div key={pt.id || i} className="flex items-start gap-2 mb-2 bg-gray-50 p-2 rounded">
                      <TextInput value={pt.icon} onChange={v => setSecArr('heritage', 'points', i, 'icon', v)} placeholder="🏛️" className="w-16" />
                      <TextInput value={pt.title} onChange={v => setSecArr('heritage', 'points', i, 'title', v)} placeholder="Title" className="flex-1" />
                      <TextInput value={pt.description} onChange={v => setSecArr('heritage', 'points', i, 'description', v)} placeholder="Description" className="flex-1" />
                      <button type="button" onClick={() => removeArrItem('heritage', 'points', i)} className="text-red-400 hover:text-red-600 mt-2"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* ── Story ── */}
              <CollapsibleSection title="Story Section" badge={sec('story', 'enabled') !== false ? 'ON' : 'OFF'}>
                <SectionToggle label="Enable Story" enabled={sec('story', 'enabled') !== false} onChange={v => setSec('story', 'enabled', v)} />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-900">Paragraphs</span>
                    <button type="button" onClick={() => {
                      const paras = [...(homeSections.story?.paragraphs || [])]; paras.push('');
                      setSec('story', 'paragraphs', paras);
                    }} className="text-xs text-primary-700 hover:text-primary-900 flex items-center gap-1"><FiPlus className="w-3 h-3" /> Add</button>
                  </div>
                  {(homeSections.story?.paragraphs || []).map((p, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <TextArea value={p} onChange={v => {
                        const paras = [...(homeSections.story?.paragraphs || [])]; paras[i] = v;
                        setSec('story', 'paragraphs', paras);
                      }} rows={2} className="flex-1" />
                      <button type="button" onClick={() => {
                        const paras = [...(homeSections.story?.paragraphs || [])]; paras.splice(i, 1);
                        setSec('story', 'paragraphs', paras);
                      }} className="text-red-400 hover:text-red-600 mt-2"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* ── Testimonials ── */}
              <CollapsibleSection title="Testimonials" badge={sec('testimonials', 'enabled') !== false ? 'ON' : 'OFF'}>
                <SectionToggle label="Enable Testimonials" enabled={sec('testimonials', 'enabled') !== false} onChange={v => setSec('testimonials', 'enabled', v)} />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-900">Items</span>
                    <button type="button" onClick={() => addArrItem('testimonials', 'items', { quote: '', name: '', role: '' })} className="text-xs text-primary-700 hover:text-primary-900 flex items-center gap-1"><FiPlus className="w-3 h-3" /> Add</button>
                  </div>
                  {(homeSections.testimonials?.items || []).map((t, i) => (
                    <div key={t.id || i} className="bg-gray-50 p-3 rounded mb-2 space-y-2">
                      <TextArea value={t.quote} onChange={v => setSecArr('testimonials', 'items', i, 'quote', v)} placeholder="Testimonial quote..." rows={2} />
                      <div className="flex gap-2">
                        <TextInput value={t.name} onChange={v => setSecArr('testimonials', 'items', i, 'name', v)} placeholder="Name" className="flex-1" />
                        <TextInput value={t.role} onChange={v => setSecArr('testimonials', 'items', i, 'role', v)} placeholder="Role" className="flex-1" />
                        <button type="button" onClick={() => removeArrItem('testimonials', 'items', i)} className="text-red-400 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* ── CTA Banner ── */}
              <CollapsibleSection title="CTA Banner" badge={sec('ctaBanner', 'enabled') !== false ? 'ON' : 'OFF'}>
                <SectionToggle label="Enable CTA Banner" enabled={sec('ctaBanner', 'enabled') !== false} onChange={v => setSec('ctaBanner', 'enabled', v)} />
                <Field label="Title"><TextInput value={sec('ctaBanner', 'title')} onChange={v => setSec('ctaBanner', 'title', v)} placeholder="Ready to Step In?" /></Field>
                <Field label="Description"><TextArea value={sec('ctaBanner', 'description')} onChange={v => setSec('ctaBanner', 'description', v)} /></Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Button Text"><TextInput value={sec('ctaBanner', 'buttonText')} onChange={v => setSec('ctaBanner', 'buttonText', v)} /></Field>
                  <Field label="Button Link"><TextInput value={sec('ctaBanner', 'buttonLink')} onChange={v => setSec('ctaBanner', 'buttonLink', v)} /></Field>
                </div>
              </CollapsibleSection>

              <SaveButton onClick={() => saveMain({ homeSections }, 'Homepage sections saved!')} saving={saving} label="Save Homepage" />
            </div>
          )}

          {/* ============================================================
              2. BRANDING TAB
          ============================================================ */}
          {activeTab === 'branding' && (
            <Card>
              <h3 className="text-lg font-semibold text-primary-900">Branding Essentials</h3>
              <Field label="Site Name"><TextInput value={branding.siteName} onChange={v => setBranding(p => ({ ...p, siteName: v }))} /></Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Logo URL" hint="Paste a URL or upload via your media manager">
                  <TextInput value={branding.logo?.url} onChange={v => setBranding(p => ({ ...p, logo: { ...p.logo, url: v } }))} placeholder="https://..." />
                  {branding.logo?.url && (
                    <div className="mt-2 h-16 flex items-center justify-center bg-gray-50 rounded">
                      <Image src={branding.logo.url} alt="Logo" width={120} height={40} className="object-contain" />
                    </div>
                  )}
                </Field>
                <Field label="Favicon URL">
                  <TextInput value={branding.favicon?.url} onChange={v => setBranding(p => ({ ...p, favicon: { ...p.favicon, url: v } }))} placeholder="https://..." />
                </Field>
              </div>
              <SaveButton onClick={() => saveMain({ branding }, 'Branding saved!')} saving={saving} label="Save Branding" />
            </Card>
          )}

          {/* ============================================================
              3. BANNERS TAB
          ============================================================ */}
          {activeTab === 'banners' && (
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary-900">Homepage Banners</h3>
                <button onClick={handleAddBanner} className="btn btn-secondary flex items-center gap-2 text-sm"><FiPlus className="w-4 h-4" /> Add Banner</button>
              </div>

              {banners.map((banner, i) => (
                <div key={banner.id || i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0 group cursor-pointer">
                      {(banner._preview || banner.imageUrl) ? (
                        <Image src={banner._preview || banner.imageUrl} alt={banner.title || 'Banner'} fill className="object-cover group-hover:opacity-70 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><FiImage className="w-6 h-6" /></div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <label className="text-white text-xs cursor-pointer">
                          Change
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const nb = [...banners]; nb[i]._file = file; nb[i]._preview = URL.createObjectURL(file);
                              setBanners(nb);
                            }
                          }} />
                        </label>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <TextInput value={banner.title} onChange={v => bannerSet(i, 'title', v)} placeholder="Title" />
                      <TextInput value={banner.subtitle} onChange={v => bannerSet(i, 'subtitle', v)} placeholder="Subtitle" />
                      <TextInput value={banner.imageUrl} onChange={v => bannerSet(i, 'imageUrl', v)} placeholder="Image URL" />
                      <TextInput value={banner.link} onChange={v => bannerSet(i, 'link', v)} placeholder="Link" />
                      <TextInput value={banner.buttonText} onChange={v => bannerSet(i, 'buttonText', v)} placeholder="Button text" />
                      <label className="flex items-center gap-2 text-sm text-primary-900">
                        <input type="checkbox" checked={banner.isActive !== false} onChange={e => bannerSet(i, 'isActive', e.target.checked)} className="accent-primary-900" />
                        Active
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-secondary text-xs" onClick={() => handleMoveBanner(i, -1)} disabled={i === 0}><FiArrowUp className="w-3 h-3" /></button>
                    <button className="btn btn-secondary text-xs" onClick={() => handleMoveBanner(i, 1)} disabled={i === banners.length - 1}><FiArrowDown className="w-3 h-3" /></button>
                    <button className="btn btn-secondary text-xs text-red-500" onClick={() => handleRemoveBanner(i)}><FiTrash2 className="w-3 h-3" /> Remove</button>
                  </div>
                </div>
              ))}

              <SaveButton onClick={handleSaveBanners} saving={saving} label="Save Banners" />
            </Card>
          )}

          {/* ============================================================
              4. ANNOUNCEMENT TAB
          ============================================================ */}
          {activeTab === 'announcement' && (
            <Card>
              <div>
                <h3 className="text-lg font-semibold text-primary-900">Announcement Bar</h3>
                <p className="text-sm text-gray-500">Edit top-site announcement text and visibility.</p>
              </div>
              <div className="space-y-4 border rounded-lg p-4 bg-primary-50/40">
                <SectionToggle label="Enable Announcement Bar" enabled={announcementBar.enabled !== false} onChange={v => setAnnouncementBar(p => ({ ...p, enabled: v }))} />
                <Field label="Announcement Text"><TextInput value={announcementBar.text} onChange={v => setAnnouncementBar(p => ({ ...p, text: v }))} placeholder="Free shipping on all orders above ₹999" /></Field>
                <Field label="Optional Link"><TextInput value={announcementBar.link} onChange={v => setAnnouncementBar(p => ({ ...p, link: v }))} placeholder="/products" /></Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Background Color"><ColorPicker value={announcementBar.backgroundColor || '#10b981'} onChange={v => setAnnouncementBar(p => ({ ...p, backgroundColor: v }))} /></Field>
                  <Field label="Text Color"><ColorPicker value={announcementBar.textColor || '#ffffff'} onChange={v => setAnnouncementBar(p => ({ ...p, textColor: v }))} /></Field>
                </div>
                <SectionToggle label="Allow users to dismiss" enabled={announcementBar.dismissible !== false} onChange={v => setAnnouncementBar(p => ({ ...p, dismissible: v }))} />
              </div>
              <SaveButton onClick={() => saveMain({ announcementBar }, 'Announcement bar saved!')} saving={saving} label="Save Announcement" />
            </Card>
          )}

          {/* ============================================================
              5. THEME TAB (10 color pickers + live preview)
          ============================================================ */}
          {activeTab === 'theme' && (
            <Card>
              <h3 className="text-lg font-semibold text-primary-900">Theme Colors</h3>
              <p className="text-sm text-gray-500">Customize your brand colors. Changes apply site-wide via CSS variables.</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Color Pickers */}
                <div className="space-y-6">
                  {/* Brand Colors */}
                  <div>
                    <h4 className="text-sm font-semibold text-primary-800 mb-3 uppercase tracking-wider">Brand</h4>
                    <div className="space-y-3">
                      <ColorPicker label="Primary" value={themeVal('primaryColor') || '#3B2F2F'} onChange={v => setTheme('primaryColor', v)} />
                      <ColorPicker label="Secondary" value={themeVal('secondaryColor') || '#E5D3B3'} onChange={v => setTheme('secondaryColor', v)} />
                      <ColorPicker label="Accent / Gold" value={themeVal('accentColor') || '#C9A96E'} onChange={v => setTheme('accentColor', v)} />
                      <ColorPicker label="Accent Hover" value={themeVal('accentHoverColor') || '#B8943D'} onChange={v => setTheme('accentHoverColor', v)} />
                    </div>
                  </div>
                  {/* Text Colors */}
                  <div>
                    <h4 className="text-sm font-semibold text-primary-800 mb-3 uppercase tracking-wider">Text</h4>
                    <div className="space-y-3">
                      <ColorPicker label="Headings" value={themeVal('headingColor') || '#1c1917'} onChange={v => setTheme('headingColor', v)} />
                      <ColorPicker label="Body Text" value={themeVal('textColor') || '#44403c'} onChange={v => setTheme('textColor', v)} />
                      <ColorPicker label="Muted Text" value={themeVal('mutedTextColor') || '#78716c'} onChange={v => setTheme('mutedTextColor', v)} />
                    </div>
                  </div>
                  {/* Background & Borders */}
                  <div>
                    <h4 className="text-sm font-semibold text-primary-800 mb-3 uppercase tracking-wider">Backgrounds & Borders</h4>
                    <div className="space-y-3">
                      <ColorPicker label="Page Background" value={themeVal('backgroundColor') || '#fafaf9'} onChange={v => setTheme('backgroundColor', v)} />
                      <ColorPicker label="Subtle Background" value={themeVal('subtleBgColor') || '#f5f5f4'} onChange={v => setTheme('subtleBgColor', v)} />
                      <ColorPicker label="Border / Divider" value={themeVal('borderColor') || '#e7e5e4'} onChange={v => setTheme('borderColor', v)} />
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="border rounded-lg p-5 space-y-4" style={{ backgroundColor: themeVal('backgroundColor') || '#fafaf9' }}>
                  <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: themeVal('headingColor') || '#1c1917' }}>Live Preview</h4>
                  <div className="rounded-lg p-4" style={{ backgroundColor: themeVal('primaryColor') || '#3B2F2F', color: '#fff' }}>
                    <span className="text-sm font-medium">Primary Button</span>
                  </div>
                  <div className="rounded-lg p-4 border" style={{ backgroundColor: themeVal('secondaryColor') || '#E5D3B3', color: themeVal('headingColor') || '#1c1917' }}>
                    <span className="text-sm font-medium">Secondary Accent</span>
                  </div>
                  <div className="rounded-lg p-4" style={{ backgroundColor: themeVal('accentColor') || '#C9A96E', color: '#fff' }}>
                    <span className="text-sm font-medium">Accent / Gold</span>
                  </div>
                  <div className="rounded-lg p-3" style={{ backgroundColor: themeVal('subtleBgColor') || '#f5f5f4', border: `1px solid ${themeVal('borderColor') || '#e7e5e4'}` }}>
                    <p style={{ color: themeVal('headingColor') || '#1c1917' }} className="font-semibold text-sm">Card Heading</p>
                    <p style={{ color: themeVal('textColor') || '#44403c' }} className="text-sm">Body text example with regular weight.</p>
                    <p style={{ color: themeVal('mutedTextColor') || '#78716c' }} className="text-xs mt-1">Muted helper text</p>
                  </div>
                </div>
              </div>

              <SaveButton onClick={() => saveAdvanced('theme', advancedSettings.theme || {})} saving={saving} label="Save Theme Colors" />
            </Card>
          )}

          {/* ============================================================
              6. ABOUT TAB
          ============================================================ */}
          {activeTab === 'about' && (
            <Card>
              <h3 className="text-lg font-semibold text-primary-900">About Page</h3>
              <p className="text-sm text-gray-500">Control the hero banner and story images shown on the About page.</p>

              <CollapsibleSection title="Hero Banner Image" defaultOpen>
                <Field label="Hero Image URL">
                  <TextInput value={advancedSettings.aboutPage?.heroImageUrl || ''} onChange={v => setAdvancedSettings(prev => ({
                    ...prev, aboutPage: { ...prev.aboutPage, heroImageUrl: v },
                  }))} placeholder="https://..." />
                </Field>
                {advancedSettings.aboutPage?.heroImageUrl && (
                  <div className="relative w-full h-48 rounded overflow-hidden bg-gray-100">
                    <Image src={advancedSettings.aboutPage.heroImageUrl} alt="About hero" fill className="object-cover" />
                  </div>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Story Section Image" defaultOpen>
                <Field label="Story Image URL">
                  <TextInput value={advancedSettings.aboutPage?.storyImageUrl || ''} onChange={v => setAdvancedSettings(prev => ({
                    ...prev, aboutPage: { ...prev.aboutPage, storyImageUrl: v },
                  }))} placeholder="https://..." />
                </Field>
                {advancedSettings.aboutPage?.storyImageUrl && (
                  <div className="relative w-full h-48 rounded overflow-hidden bg-gray-100">
                    <Image src={advancedSettings.aboutPage.storyImageUrl} alt="Story" fill className="object-cover" />
                  </div>
                )}
              </CollapsibleSection>

              <SaveButton onClick={() => saveAdvanced('aboutPage', advancedSettings.aboutPage || {})} saving={saving} label="Save About Page" />
            </Card>
          )}

          {/* ============================================================
              7. POLICIES TAB
          ============================================================ */}
          {activeTab === 'policies' && (
            <Card>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900">Policy & Page Content</h3>
                  <p className="text-sm text-gray-500">Edit detailed content for various site sections.</p>
                </div>
                <select value={selectedPolicy} onChange={e => setSelectedPolicy(e.target.value)} className="input py-2 text-sm">
                  <option value="shippingPolicy">Shipping Policy</option>
                  <option value="returnsPolicy">Returns Policy</option>
                  <option value="aboutPage">About Page</option>
                  <option value="faqPage">FAQ Page</option>
                  <option value="footerContent">Footer Content</option>
                </select>
              </div>
              <div className="relative">
                <textarea
                  id="policy-editor"
                  className="w-full h-[500px] font-mono text-sm p-4 border rounded-lg bg-gray-50 focus:bg-white transition-colors custom-scrollbar"
                  defaultValue={JSON.stringify(advancedSettings[selectedPolicy] || {}, null, 2)}
                  key={selectedPolicy}
                  spellCheck={false}
                />
                <div className="absolute top-2 right-4 text-xs text-gray-400 pointer-events-none">JSON Editor</div>
              </div>
              <p className="text-xs text-gray-500"><span className="font-semibold text-yellow-600">Note:</span> Be careful when editing JSON. Ensure all quotes and commas are correct.</p>
              <SaveButton onClick={() => {
                try {
                  const value = JSON.parse(document.getElementById('policy-editor').value);
                  saveAdvanced(selectedPolicy, value);
                } catch { toast.error('Invalid JSON format'); }
              }} saving={saving} label="Save Changes" />
            </Card>
          )}

          {/* ============================================================
              8. CONTACT TAB
          ============================================================ */}
          {activeTab === 'contact' && (
            <Card>
              <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Business Address" className="md:col-span-2">
                  <TextArea value={advancedSettings.contactInfo?.address || ''} onChange={v => setAdvancedSettings(p => ({ ...p, contactInfo: { ...p.contactInfo, address: v } }))} />
                </Field>
                <Field label="Phone Number">
                  <TextInput value={advancedSettings.contactInfo?.phone || ''} onChange={v => setAdvancedSettings(p => ({ ...p, contactInfo: { ...p.contactInfo, phone: v } }))} />
                </Field>
                <Field label="Email Address">
                  <TextInput type="email" value={advancedSettings.contactInfo?.email || ''} onChange={v => setAdvancedSettings(p => ({ ...p, contactInfo: { ...p.contactInfo, email: v } }))} />
                </Field>
                <div className="md:col-span-2 grid grid-cols-3 gap-4 pt-4">
                  {[['showAddress', 'Show Address'], ['showPhone', 'Show Phone'], ['showEmail', 'Show Email']].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={advancedSettings.contactInfo?.[key] ?? true} onChange={e => setAdvancedSettings(p => ({ ...p, contactInfo: { ...p.contactInfo, [key]: e.target.checked } }))} className="accent-primary-900" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <SaveButton onClick={() => saveAdvanced('contactInfo', advancedSettings.contactInfo)} saving={saving} label="Save Contact Info" />
            </Card>
          )}

          {/* ============================================================
              9. SYSTEM TAB
          ============================================================ */}
          {activeTab === 'system' && (
            <Card>
              <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">System Settings</h3>
              <SectionToggle label="Maintenance Mode" hint="Temporarily disable the storefront for visitors." enabled={advancedSettings.maintenanceMode?.enabled ?? false} onChange={v => setAdvancedSettings(p => ({ ...p, maintenanceMode: { ...p.maintenanceMode, enabled: v } }))} />
              {advancedSettings.maintenanceMode?.enabled && (
                <div className="p-4 border rounded-lg animate-fade-in">
                  <Field label="Maintenance Message">
                    <TextArea value={advancedSettings.maintenanceMode?.message || ''} onChange={v => setAdvancedSettings(p => ({ ...p, maintenanceMode: { ...p.maintenanceMode, message: v } }))} rows={2} />
                  </Field>
                </div>
              )}
              <SaveButton onClick={() => saveAdvanced('maintenanceMode', advancedSettings.maintenanceMode)} saving={saving} label="Save System Settings" />
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
