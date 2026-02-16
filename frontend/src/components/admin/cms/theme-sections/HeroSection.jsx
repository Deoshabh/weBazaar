
import React from 'react';
import ImageUploader from '../ImageUploader';

const ANIMATION_TYPES = [
    { value: 'none', label: 'None' },
    { value: 'fade-up', label: 'Fade Up' },
    { value: 'slide-in', label: 'Slide In' },
    { value: 'typewriter', label: 'Typewriter' },
    { value: 'stagger', label: 'Stagger Reveal' },
];

export default function HeroSection({ theme, sectionData = {}, hasActiveBanners = false, onUpdateSection, onThemeChange }) {

    // Manage section content (headline, image, etc.) through sectionData -> homeSections
    // Manage stylistic things (animation type) through theme if global, or sectionData if specific.
    // The requirement is "Hero Content Editor", so we focus on Section Data.

    // We also support 'theme.hero' for legacy or global overrides if needed, but primary is sectionData.
    const hero = { ...sectionData, ...theme.hero }; // Merge to show both, but write to specific targets

    // Update CONTENT (Section Data)
    const handleContentChange = (key, value) => {
        if (onUpdateSection) {
            onUpdateSection({ [key]: value });
        }
    };

    // Update STYLE (Theme Global) - e.g. Layout might be global? 
    // Actually, Layout 'full-bleed' etc is likely per-section.
    // Let's create a separation:
    // Content -> onUpdateSection
    // Global Theme Styles -> onThemeChange

    // However, for Simplicity in this "Theme Builder", users expect to see changes.
    // We will write 'layout' to sectionData as well.

    const handleAnimationChange = (key, value) => {
        // Animation might be stored in 'heroSettings.animation' in sectionData
        const currentAnim = sectionData.animation || {};
        handleContentChange('animation', { ...currentAnim, [key]: value });
    };

    return (
        <div className="space-y-6">

            {hasActiveBanners && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Active banners are enabled, so homepage hero text comes from banners first. These hero content changes apply only when banners are disabled.
                </div>
            )}

            <div className="space-y-3">
                <label className="text-xs font-medium text-gray-500">Layout Style</label>
                <select
                    value={sectionData.layout || 'full-bleed'}
                    onChange={(e) => handleContentChange('layout', e.target.value)}
                    className="w-full text-sm border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="full-bleed">Full Bleed Image</option>
                    <option value="centered">Centered Content</option>
                    <option value="minimal">Minimal</option>
                </select>
            </div>

            <div className="space-y-3">
                <label className="text-xs font-medium text-gray-500">Background Gradient</label>
                <select
                    value={sectionData.backgroundGradient || 'from-primary-50 via-brand-cream/20 to-primary-100'}
                    onChange={(e) => handleContentChange('backgroundGradient', e.target.value)}
                    className="w-full text-sm border-gray-200 rounded-md shadow-sm"
                >
                    <option value="from-primary-50 via-brand-cream/20 to-primary-100">Soft Cream/Tan</option>
                    <option value="from-white via-gray-50 to-white">Clean White</option>
                    <option value="from-slate-50 via-gray-100 to-slate-200">Cool Greys</option>
                    <option value="from-brand-brown/10 via-transparent to-brand-tan/10">Brand Tint</option>
                </select>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
                <h5 className="text-xs font-bold text-gray-400 uppercase">Content</h5>

                {/* For Image, usually we use Banners if it's a carousel, but if it's a simple hero section: */}
                {/* Our frontend maps 'banners' to Hero if present. */}
                {/* If the user is editing the 'Hero Section' settings, they might be editing the Fallback Hero. */}
                {/* To edit Banners, we need a Banner Editor. */}
                {/* Let's assume this edits the Static Hero Text which appears if no banners or as overlay? */}
                {/* Page.jsx: <HeroAnimate ...> if banners exist. Else <section ... {heroSettings.title} ...> */}

                {/* If the user wants to see their changes, they must NOT have banners active? 
                    Or we need to edit Banners here? 
                    Let's stick to editing the 'heroSettings' (Section Data) which corresponds to the fallback.
                */}

                <div>
                    <label className="block text-xs text-gray-500 mb-1">Headline</label>
                    <input
                        type="text"
                        value={sectionData.title || ''}
                        onChange={(e) => handleContentChange('title', e.target.value)}
                        className="w-full text-sm border-gray-200 rounded"
                        placeholder="Handcrafted Perfection"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Subheadline</label>
                    <textarea
                        value={sectionData.subtitle || ''}
                        onChange={(e) => handleContentChange('subtitle', e.target.value)}
                        className="w-full text-sm border-gray-200 rounded"
                        rows={2}
                        placeholder="Discover our new collection"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <textarea
                        value={sectionData.description || ''}
                        onChange={(e) => handleContentChange('description', e.target.value)}
                        className="w-full text-sm border-gray-200 rounded"
                        rows={2}
                        placeholder="Optional description text..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Primary Button Text</label>
                        <input
                            type="text"
                            value={sectionData.buttonText || sectionData.primaryButtonText || ''}
                            onChange={(e) => handleContentChange('buttonText', e.target.value)}
                            className="w-full text-sm border-gray-200 rounded"
                            placeholder="Shop Collection"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Primary Button Link</label>
                        <input
                            type="text"
                            value={sectionData.buttonLink || sectionData.primaryButtonLink || ''}
                            onChange={(e) => handleContentChange('buttonLink', e.target.value)}
                            className="w-full text-sm border-gray-200 rounded"
                            placeholder="/products"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Secondary Button Text</label>
                        <input
                            type="text"
                            value={sectionData.secondaryButtonText || sectionData.buttonTextSecondary || ''}
                            onChange={(e) => handleContentChange('secondaryButtonText', e.target.value)}
                            className="w-full text-sm border-gray-200 rounded"
                            placeholder="Our Story"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Secondary Button Link</label>
                        <input
                            type="text"
                            value={sectionData.secondaryButtonLink || sectionData.buttonLinkSecondary || ''}
                            onChange={(e) => handleContentChange('secondaryButtonLink', e.target.value)}
                            className="w-full text-sm border-gray-200 rounded"
                            placeholder="/about"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
                <h5 className="text-xs font-bold text-gray-400 uppercase">Entrance Animation</h5>
                <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-500">Type</label>
                    <select
                        value={sectionData.animation?.type || 'none'}
                        onChange={(e) => handleAnimationChange('type', e.target.value)}
                        className="w-full text-sm border-gray-200 rounded-md shadow-sm"
                    >
                        {ANIMATION_TYPES.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
