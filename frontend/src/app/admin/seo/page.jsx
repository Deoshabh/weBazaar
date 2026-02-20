'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { seoAPI } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import {
  FiSearch, FiSave, FiRefreshCw, FiCopy, FiTrash2,
  FiChevronRight, FiGlobe, FiTwitter, FiSettings,
  FiClock, FiCheckCircle, FiAlertCircle, FiInfo,
  FiEye, FiX
} from 'react-icons/fi';

// ───────────── SEO Score Calculator ─────────────
function calcSeoScore(data) {
  let score = 0;
  const issues = [];
  // Title
  if (data.meta_title) {
    const len = data.meta_title.length;
    if (len >= 30 && len <= 60) { score += 25; }
    else if (len > 0 && len < 30) { score += 10; issues.push('Title too short (aim 30-60 chars)'); }
    else if (len > 60) { score += 10; issues.push('Title too long (aim 30-60 chars)'); }
  } else { issues.push('Missing meta title'); }
  // Description
  if (data.meta_description) {
    const len = data.meta_description.length;
    if (len >= 80 && len <= 160) { score += 25; }
    else if (len > 0 && len < 80) { score += 10; issues.push('Description too short (aim 80-160 chars)'); }
    else if (len > 160) { score += 10; issues.push('Description too long (aim 80-160 chars)'); }
  } else { issues.push('Missing meta description'); }
  // Keywords
  if (data.meta_keywords && data.meta_keywords.length > 0) { score += 15; }
  else { issues.push('No keywords set'); }
  // OG data
  if (data.og_title || data.meta_title) score += 10;
  if (data.og_description || data.meta_description) score += 10;
  if (data.og_image) { score += 10; } else { issues.push('No OG image set'); }
  // Robots
  if (data.robots && data.robots.includes('index')) score += 5;
  return { score: Math.min(score, 100), issues };
}

function ScoreBadge({ score }) {
  let color = 'bg-red-100 text-red-700';
  let label = 'Poor';
  if (score >= 80) { color = 'bg-green-100 text-green-700'; label = 'Great'; }
  else if (score >= 60) { color = 'bg-yellow-100 text-yellow-700'; label = 'Good'; }
  else if (score >= 40) { color = 'bg-orange-100 text-orange-700'; label = 'Fair'; }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {score}/100 — {label}
    </span>
  );
}

// ───────────── Char Counter ─────────────
function CharCounter({ value, min, max }) {
  const len = (value || '').length;
  let color = 'text-gray-400';
  if (len > 0 && len < min) color = 'text-orange-500';
  else if (len >= min && len <= max) color = 'text-green-600';
  else if (len > max) color = 'text-red-500';
  return <span className={`text-xs ${color}`}>{len}/{max}</span>;
}

// ───────────── SERP Preview ─────────────
function SerpPreview({ data }) {
  const title = data.meta_title || 'Page Title';
  const desc = data.meta_description || 'Page description will appear here...';
  const url = data.canonical_url || 'https://weBazaar.in';
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-2 font-medium">Google SERP Preview</p>
      <div className="max-w-xl">
        <p className="text-blue-700 text-lg leading-snug hover:underline cursor-pointer truncate">
          {title.length > 60 ? title.substring(0, 60) + '...' : title}
        </p>
        <p className="text-green-700 text-sm truncate">{url}</p>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
          {desc.length > 160 ? desc.substring(0, 160) + '...' : desc}
        </p>
      </div>
    </div>
  );
}

// ───────────── OG Preview ─────────────
function OgPreview({ data }) {
  const title = data.og_title || data.meta_title || 'Page Title';
  const desc = data.og_description || data.meta_description || 'Description';
  const image = data.og_image;
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-2 font-medium">Open Graph Preview (Facebook/LinkedIn)</p>
      <div className="border rounded-lg overflow-hidden max-w-md">
        {image ? (
          <div className="h-40 bg-gray-100 flex items-center justify-center">
            <img src={image} alt="OG" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        ) : (
          <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            No OG image set
          </div>
        )}
        <div className="p-3 bg-gray-50">
          <p className="text-xs text-gray-500 uppercase">weBazaar.in</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-600 line-clamp-2">{desc}</p>
        </div>
      </div>
    </div>
  );
}

// ───────────── Twitter Preview ─────────────
function TwitterPreview({ data }) {
  const title = data.twitter_title || data.og_title || data.meta_title || 'Page Title';
  const desc = data.twitter_description || data.og_description || data.meta_description || 'Description';
  const image = data.twitter_image || data.og_image;
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-2 font-medium">Twitter Card Preview</p>
      <div className="border rounded-2xl overflow-hidden max-w-md">
        {image ? (
          <div className="h-40 bg-gray-100">
            <img src={image} alt="Twitter" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        ) : (
          <div className="h-28 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            No image set
          </div>
        )}
        <div className="p-3">
          <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-600 line-clamp-2">{desc}</p>
          <p className="text-xs text-gray-400 mt-1">weBazaar.in</p>
        </div>
      </div>
    </div>
  );
}

// ───────────── History Modal ─────────────
function HistoryModal({ history, onClose, onRestore }) {
  if (!history || history.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-xl p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Change History</h3>
            <button onClick={onClose}><FiX className="w-5 h-5" /></button>
          </div>
          <p className="text-gray-500 text-sm">No history available yet.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Change History</h3>
          <button onClick={onClose}><FiX className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          {history.map((entry, i) => (
            <div key={entry._id || i} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-500">
                  {new Date(entry.changed_at).toLocaleString()}
                  {entry.changed_by && ` by ${entry.changed_by.name || entry.changed_by.email || 'Admin'}`}
                </div>
                <button
                  onClick={() => onRestore(entry)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Restore
                </button>
              </div>
              <div className="text-sm space-y-1">
                {entry.meta_title && <p><span className="text-gray-500">Title:</span> {entry.meta_title}</p>}
                {entry.meta_description && <p className="line-clamp-1"><span className="text-gray-500">Desc:</span> {entry.meta_description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function AdminSeoPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('general');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [showBulkCopy, setShowBulkCopy] = useState(false);
  const [bulkTargets, setBulkTargets] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');

  // ── Auth guard ──
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  // ── Fetch all pages ──
  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await seoAPI.getAll();
      setPages(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch SEO settings:', err);
      toast.error('Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchPages();
  }, [user]);

  // ── Select page ──
  const selectPage = (page) => {
    setSelectedKey(page.page_key);
    setFormData({
      page_label: page.page_label || '',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      meta_keywords: Array.isArray(page.meta_keywords) ? page.meta_keywords.join(', ') : '',
      og_title: page.og_title || '',
      og_description: page.og_description || '',
      og_image: page.og_image || '',
      og_type: page.og_type || 'website',
      twitter_title: page.twitter_title || '',
      twitter_description: page.twitter_description || '',
      twitter_image: page.twitter_image || '',
      canonical_url: page.canonical_url || '',
      robots: page.robots || 'index, follow',
      schema_json: page.schema_json ? JSON.stringify(page.schema_json, null, 2) : '',
      is_active: page.is_active !== false,
    });
    setActiveTab('general');
  };

  // ── Compute score for selected form data ──
  const seoScore = useMemo(() => {
    if (!selectedKey) return { score: 0, issues: [] };
    return calcSeoScore({
      ...formData,
      meta_keywords: formData.meta_keywords ? formData.meta_keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
    });
  }, [formData, selectedKey]);

  // ── Save ──
  const handleSave = async () => {
    if (!selectedKey) return;
    setSaving(true);
    try {
      const keywords = formData.meta_keywords
        ? formData.meta_keywords.split(',').map(k => k.trim()).filter(Boolean)
        : [];
      let schema_json = null;
      if (formData.schema_json) {
        try { schema_json = JSON.parse(formData.schema_json); }
        catch { toast.error('Invalid JSON-LD schema'); setSaving(false); return; }
      }

      await seoAPI.upsert(selectedKey, {
        ...formData,
        meta_keywords: keywords,
        schema_json,
      });
      toast.success('SEO settings saved!');
      fetchPages();
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save SEO settings');
    } finally {
      setSaving(false);
    }
  };

  // ── Reset to default ──
  const handleReset = async () => {
    if (!selectedKey) return;
    if (!window.confirm('Reset this page\'s SEO to defaults? Current settings will be saved in history.')) return;
    try {
      await seoAPI.resetToDefault(selectedKey);
      toast.success('Reset to defaults');
      fetchPages();
      setSelectedKey(null);
    } catch (err) {
      toast.error('Failed to reset');
    }
  };

  // ── Delete custom SEO ──
  const handleDelete = async () => {
    if (!selectedKey) return;
    if (!window.confirm('Remove custom SEO for this page? Defaults will be used.')) return;
    try {
      await seoAPI.remove(selectedKey);
      toast.success('Custom SEO removed');
      fetchPages();
      setSelectedKey(null);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  // ── History ──
  const openHistory = async () => {
    if (!selectedKey) return;
    try {
      const res = await seoAPI.getHistory(selectedKey);
      setHistory(res.data.data || []);
      setShowHistory(true);
    } catch {
      toast.error('Failed to load history');
    }
  };

  const restoreFromHistory = (entry) => {
    setFormData(prev => ({
      ...prev,
      meta_title: entry.meta_title || prev.meta_title,
      meta_description: entry.meta_description || prev.meta_description,
      meta_keywords: (entry.meta_keywords || []).join(', '),
      og_title: entry.og_title || '',
      og_description: entry.og_description || '',
      og_image: entry.og_image || '',
      twitter_title: entry.twitter_title || '',
      twitter_description: entry.twitter_description || '',
      twitter_image: entry.twitter_image || '',
      canonical_url: entry.canonical_url || '',
      robots: entry.robots || 'index, follow',
      schema_json: entry.schema_json ? JSON.stringify(entry.schema_json, null, 2) : '',
    }));
    setShowHistory(false);
    toast.success('Restored from history — save to apply');
  };

  // ── Bulk copy ──
  const handleBulkCopy = async () => {
    if (!selectedKey || bulkTargets.length === 0) return;
    try {
      await seoAPI.bulkCopy({ sourcePageKey: selectedKey, targetPageKeys: bulkTargets });
      toast.success(`Copied shared fields to ${bulkTargets.length} page(s)`);
      setShowBulkCopy(false);
      setBulkTargets([]);
      fetchPages();
    } catch {
      toast.error('Bulk copy failed');
    }
  };

  // ── Filtered pages ──
  const filteredPages = useMemo(() => {
    if (!searchFilter) return pages;
    const q = searchFilter.toLowerCase();
    return pages.filter(p => p.page_key.includes(q) || (p.page_label || '').toLowerCase().includes(q));
  }, [pages, searchFilter]);

  const selectedPage = pages.find(p => p.page_key === selectedKey);

  if (!user || user.role !== 'admin') return null;

  return (
    <AdminLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
              <FiSearch className="w-6 h-6" />
              SEO Manager
            </h1>
            <p className="text-sm text-gray-500 mt-1">Control meta tags, Open Graph, Twitter cards, and JSON-LD for every page</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Page Sidebar ── */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="relative mb-3">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter pages..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                />
              </div>
              {loading ? (
                <div className="text-sm text-gray-400 text-center py-4">Loading...</div>
              ) : (
                <ul className="space-y-1 max-h-[60vh] overflow-y-auto">
                  {filteredPages.map(page => {
                    const { score } = calcSeoScore({
                      ...page,
                      meta_keywords: page.meta_keywords || [],
                    });
                    const active = selectedKey === page.page_key;
                    return (
                      <li key={page.page_key}>
                        <button
                          onClick={() => selectPage(page)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                            active
                              ? 'bg-primary-900 text-white'
                              : 'text-gray-700 hover:bg-zinc-50'
                          }`}
                        >
                          <span className="truncate">{page.page_label || page.page_key}</span>
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              score >= 80 ? 'bg-green-400' : score >= 60 ? 'bg-yellow-400' : score >= 40 ? 'bg-orange-400' : 'bg-red-400'
                            }`} />
                            <FiChevronRight className="w-3 h-3 flex-shrink-0" />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* ── Main Form Panel ── */}
          <div className="flex-1 min-w-0">
            {!selectedKey ? (
              <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">Select a page to edit SEO</h3>
                <p className="text-gray-400 text-sm mt-2">Choose a page from the sidebar to manage its meta tags, social sharing, and structured data.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Score + actions bar */}
                <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-zinc-900">{formData.page_label || selectedKey}</h2>
                    <ScoreBadge score={seoScore.score} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={openHistory} className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50" title="View History">
                      <FiClock className="w-4 h-4" /> History
                    </button>
                    <button onClick={() => setShowBulkCopy(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50" title="Bulk Copy">
                      <FiCopy className="w-4 h-4" /> Copy
                    </button>
                    <button onClick={handleReset} className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 text-orange-600" title="Reset to Default">
                      <FiRefreshCw className="w-4 h-4" /> Reset
                    </button>
                    <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 text-red-600" title="Delete Custom">
                      <FiTrash2 className="w-4 h-4" /> Delete
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1 px-4 py-1.5 text-sm bg-primary-900 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50"
                    >
                      <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* SEO Issues */}
                {seoScore.issues.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-yellow-800 mb-1 flex items-center gap-1">
                      <FiAlertCircle className="w-4 h-4" /> SEO Issues
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-0.5">
                      {seoScore.issues.map((issue, i) => <li key={i}>• {issue}</li>)}
                    </ul>
                  </div>
                )}

                {/* Tab Buttons */}
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="border-b flex overflow-x-auto">
                    {[
                      { key: 'general', label: 'General', icon: FiGlobe },
                      { key: 'og', label: 'Open Graph', icon: FiEye },
                      { key: 'twitter', label: 'Twitter', icon: FiTwitter },
                      { key: 'advanced', label: 'Advanced', icon: FiSettings },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === tab.key
                            ? 'border-primary-900 text-zinc-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    {/* GENERAL TAB */}
                    {activeTab === 'general' && (
                      <div className="space-y-5">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium text-gray-700">Meta Title</label>
                            <CharCounter value={formData.meta_title} min={30} max={60} />
                          </div>
                          <input
                            type="text"
                            value={formData.meta_title}
                            onChange={e => setFormData(p => ({ ...p, meta_title: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                            placeholder="Page title for search engines..."
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium text-gray-700">Meta Description</label>
                            <CharCounter value={formData.meta_description} min={80} max={160} />
                          </div>
                          <textarea
                            value={formData.meta_description}
                            onChange={e => setFormData(p => ({ ...p, meta_description: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                            rows={3}
                            placeholder="Brief description for search results..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Keywords (comma-separated)</label>
                          <input
                            type="text"
                            value={formData.meta_keywords}
                            onChange={e => setFormData(p => ({ ...p, meta_keywords: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                            placeholder="vegan shoes, cruelty-free, sustainable footwear..."
                          />
                        </div>
                        {/* SERP Preview */}
                        <SerpPreview data={formData} />
                      </div>
                    )}

                    {/* OG TAB */}
                    {activeTab === 'og' && (
                      <div className="space-y-5">
                        <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
                          <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>Open Graph tags control how your page appears when shared on Facebook, LinkedIn, and other social platforms. If left empty, meta title/description will be used as fallback.</span>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">OG Title</label>
                          <input
                            type="text"
                            value={formData.og_title}
                            onChange={e => setFormData(p => ({ ...p, og_title: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                            placeholder={formData.meta_title || 'Falls back to meta title...'}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">OG Description</label>
                          <textarea
                            value={formData.og_description}
                            onChange={e => setFormData(p => ({ ...p, og_description: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                            rows={2}
                            placeholder={formData.meta_description || 'Falls back to meta description...'}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">OG Image URL</label>
                          <input
                            type="url"
                            value={formData.og_image}
                            onChange={e => setFormData(p => ({ ...p, og_image: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                            placeholder="https://webazaar.in/og/webazaar-og-banner.jpg"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">OG Type</label>
                          <select
                            value={formData.og_type}
                            onChange={e => setFormData(p => ({ ...p, og_type: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                          >
                            <option value="website">website</option>
                            <option value="article">article</option>
                            <option value="product">product</option>
                          </select>
                        </div>
                        <OgPreview data={formData} />
                      </div>
                    )}

                    {/* TWITTER TAB */}
                    {activeTab === 'twitter' && (
                      <div className="space-y-5">
                        <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
                          <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>Twitter Card tags control how your page is shown when shared on X/Twitter. Falls back to OG tags, then meta tags.</span>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Twitter Title</label>
                          <input
                            type="text"
                            value={formData.twitter_title}
                            onChange={e => setFormData(p => ({ ...p, twitter_title: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                            placeholder={formData.og_title || formData.meta_title || 'Falls back to OG/meta title...'}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Twitter Description</label>
                          <textarea
                            value={formData.twitter_description}
                            onChange={e => setFormData(p => ({ ...p, twitter_description: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                            rows={2}
                            placeholder={formData.og_description || formData.meta_description || 'Falls back to OG/meta description...'}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Twitter Image URL</label>
                          <input
                            type="url"
                            value={formData.twitter_image}
                            onChange={e => setFormData(p => ({ ...p, twitter_image: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                            placeholder={formData.og_image || 'Falls back to OG image...'}
                          />
                        </div>
                        <TwitterPreview data={formData} />
                      </div>
                    )}

                    {/* ADVANCED TAB */}
                    {activeTab === 'advanced' && (
                      <div className="space-y-5">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Canonical URL</label>
                          <input
                            type="url"
                            value={formData.canonical_url}
                            onChange={e => setFormData(p => ({ ...p, canonical_url: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                            placeholder="https://weBazaar.in/your-page"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Robots Directive</label>
                          <select
                            value={formData.robots}
                            onChange={e => setFormData(p => ({ ...p, robots: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                          >
                            <option value="index, follow">index, follow (Recommended)</option>
                            <option value="noindex, follow">noindex, follow</option>
                            <option value="index, nofollow">index, nofollow</option>
                            <option value="noindex, nofollow">noindex, nofollow</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">JSON-LD Schema (optional)</label>
                          <textarea
                            value={formData.schema_json}
                            onChange={e => setFormData(p => ({ ...p, schema_json: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-zinc-500 focus:border-primary-500"
                            rows={8}
                            placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  ...\n}'}
                          />
                          <p className="text-xs text-gray-400 mt-1">Must be valid JSON. Leave empty to use auto-generated schema.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium text-gray-700">Active</label>
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              formData.is_active ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        {/* India-specific tips */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-800 mb-1">🇮🇳 India SEO Tips</p>
                          <ul className="text-xs text-green-700 space-y-0.5">
                            <li>• Use locale <code>en_IN</code> for Indian English content</li>
                            <li>• Set currency to <code>INR</code> in product schema</li>
                            <li>• Target <code>.in</code> domain for local rankings</li>
                            <li>• Add Hindi keywords if your audience is bilingual</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <HistoryModal
          history={history}
          onClose={() => setShowHistory(false)}
          onRestore={restoreFromHistory}
        />
      )}

      {/* Bulk Copy Modal */}
      {showBulkCopy && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowBulkCopy(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Bulk Copy from &quot;{selectedKey}&quot;</h3>
              <button onClick={() => setShowBulkCopy(false)}><FiX className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-3">Copy shared fields (OG image, Twitter image, robots, OG type) to selected pages:</p>
            <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
              {pages.filter(p => p.page_key !== selectedKey).map(p => (
                <label key={p.page_key} className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkTargets.includes(p.page_key)}
                    onChange={e => {
                      if (e.target.checked) setBulkTargets(prev => [...prev, p.page_key]);
                      else setBulkTargets(prev => prev.filter(k => k !== p.page_key));
                    }}
                    className="rounded"
                  />
                  {p.page_label || p.page_key}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowBulkCopy(false)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                onClick={handleBulkCopy}
                disabled={bulkTargets.length === 0}
                className="px-4 py-1.5 text-sm bg-primary-900 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50"
              >
                Copy to {bulkTargets.length} page(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
