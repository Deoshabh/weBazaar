'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';
import ProductCard from '@/components/ProductCard';
import HeroAnimate from '@/components/ui/HeroAnimate';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { getIconComponent } from '@/utils/iconMapper';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
    analyzeBlockPerformance,
    compileGlobalClassCss,
    compileScopedCss,
    evaluateVisibilityRules,
    parseMaybeJson,
    resolveDynamicObject,
    resolveExperimentVariant,
    resolveResponsiveProps,
} from '@/utils/visualBuilder';
import {
    CURRENT_LAYOUT_SCHEMA_VERSION,
    deriveHomeSectionsFromLayout,
    getLayoutSectionData,
    normalizeLayoutSchema,
    normalizeSettingsLayout,
} from '@/utils/layoutSchema';
import { adminAPI } from '@/utils/api';
import BlockTreeEditor from '@/components/admin/cms/BlockTreeEditor';
import { useAuth } from '@/context/AuthContext';

const resolveAnimationClass = (animationType = 'none') => {
    if (animationType === 'fade-up') return 'animate-fade-up';
    if (animationType === 'slide-in') return 'animate-slide-in';
    if (animationType === 'zoom-in') return 'animate-zoom-in';
    return '';
};

function DynamicFormBlock({ id, props = {}, className = '' }) {
    const [status, setStatus] = useState('idle');
    const fields = Array.isArray(props.fields) ? props.fields : [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true },
    ];

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const payload = Object.fromEntries(formData.entries());

        try {
            setStatus('submitting');
            const targetUrl = props.webhookUrl || `${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/contact`;
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Form request failed');
            }

            setStatus('success');
            event.currentTarget.reset();
        } catch {
            setStatus('error');
        }
    };

    return (
        <form key={id} onSubmit={handleSubmit} className={className || 'space-y-3 rounded-lg border border-primary-200 p-4'}>
            {fields.map((field) => (
                <div key={field.name} className="space-y-1">
                    <label className="text-xs font-medium text-primary-700">{field.label || field.name}</label>
                    {field.type === 'textarea' ? (
                        <textarea
                            name={field.name}
                            required={Boolean(field.required)}
                            className="w-full border border-primary-200 rounded px-3 py-2 text-sm"
                            rows={Number(field.rows) || 4}
                            placeholder={field.placeholder || ''}
                        />
                    ) : (
                        <input
                            type={field.type || 'text'}
                            name={field.name}
                            required={Boolean(field.required)}
                            className="w-full border border-primary-200 rounded px-3 py-2 text-sm"
                            placeholder={field.placeholder || ''}
                        />
                    )}
                </div>
            ))}
            <button type="submit" className="btn btn-primary text-sm" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Submitting...' : props.submitText || 'Submit'}
            </button>
            {status === 'success' && <p className="text-xs text-emerald-700">Submitted successfully.</p>}
            {status === 'error' && <p className="text-xs text-red-700">Submission failed.</p>}
        </form>
    );
}

function PopupBuilder({ popupConfig = {} }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!popupConfig?.enabled) return;

        const delayMs = Number(popupConfig.delayMs || 0);
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, Math.max(0, delayMs));

        return () => clearTimeout(timer);
    }, [popupConfig]);

    if (!popupConfig?.enabled || !isVisible) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl relative">
                <button
                    type="button"
                    onClick={() => setIsVisible(false)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">{popupConfig.title || 'Announcement'}</h3>
                <p className="text-primary-700 mb-4">{popupConfig.description || ''}</p>
                {popupConfig.buttonLink && (
                    <Link href={popupConfig.buttonLink} className="btn btn-primary" onClick={() => setIsVisible(false)}>
                        {popupConfig.buttonText || 'Learn More'}
                    </Link>
                )}
            </div>
        </div>
    );
}

// --- Sub-components ---

const mergeHeroSettings = (globalHeroSettings = {}, layoutHeroSettings = {}) => {
    const primaryButtonText =
        layoutHeroSettings.primaryButtonText ??
        layoutHeroSettings.buttonText ??
        globalHeroSettings.primaryButtonText ??
        globalHeroSettings.buttonText;
    const primaryButtonLink =
        layoutHeroSettings.primaryButtonLink ??
        layoutHeroSettings.buttonLink ??
        globalHeroSettings.primaryButtonLink ??
        globalHeroSettings.buttonLink;
    const secondaryButtonText =
        layoutHeroSettings.secondaryButtonText ??
        layoutHeroSettings.buttonTextSecondary ??
        globalHeroSettings.secondaryButtonText ??
        globalHeroSettings.buttonTextSecondary;
    const secondaryButtonLink =
        layoutHeroSettings.secondaryButtonLink ??
        layoutHeroSettings.buttonLinkSecondary ??
        globalHeroSettings.secondaryButtonLink ??
        globalHeroSettings.buttonLinkSecondary;

    return {
        ...globalHeroSettings,
        ...layoutHeroSettings,
        primaryButtonText,
        primaryButtonLink,
        secondaryButtonText,
        secondaryButtonLink,
        buttonText: layoutHeroSettings.buttonText ?? primaryButtonText,
        buttonLink: layoutHeroSettings.buttonLink ?? primaryButtonLink,
        buttonTextSecondary: layoutHeroSettings.buttonTextSecondary ?? secondaryButtonText,
        buttonLinkSecondary: layoutHeroSettings.buttonLinkSecondary ?? secondaryButtonLink,
    };
};

const mergeSectionSettings = (globalSectionSettings = {}, layoutSectionSettings = {}) => ({
    ...globalSectionSettings,
    ...layoutSectionSettings,
});

const normalizeFeatureList = (features) => {
    if (Array.isArray(features)) return features.filter(Boolean);
    if (typeof features === 'string') {
        return features
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return [];
};

const resolveHeroTextAlignment = (alignment = 'center') => {
    if (alignment === 'left') return 'text-left items-start';
    if (alignment === 'right') return 'text-right items-end';
    return 'text-center items-center';
};

const resolveHeroContentPosition = (alignment = 'center') => {
    if (alignment === 'left') return 'mr-auto';
    if (alignment === 'right') return 'ml-auto';
    return 'mx-auto';
};

const renderDynamicBlocks = (blocksInput, context, zone = 'after') => {
    const parsed = parseMaybeJson(blocksInput, blocksInput);
    const blocks = Array.isArray(parsed) ? parsed : [];

    const visibleBlocks = blocks.filter((block) => {
        if (!block || (block.zone || 'after') !== zone) return false;
        return evaluateVisibilityRules(block.visibilityRules, context.runtime);
    });

    if (visibleBlocks.length === 0) return null;

    const renderBlockNode = (block, keyPrefix) => {
        const globalWidgetId = block?.props?.globalWidgetId || block?.globalWidgetId;
        const globalWidgetMap = context?.binding?.settings?.theme?.globalWidgets || {};
        const globalWidgetNode = globalWidgetId ? globalWidgetMap?.[globalWidgetId] : null;

        const effectiveBlock = globalWidgetNode
            ? {
                ...globalWidgetNode,
                ...block,
                props: {
                    ...(globalWidgetNode.props || {}),
                    ...(block.props || {}),
                },
                children:
                    Array.isArray(block.children) && block.children.length > 0
                        ? block.children
                        : (globalWidgetNode.children || []),
            }
            : block;

        const dynamicProps = resolveDynamicObject(effectiveBlock.props || {}, context.binding);
        const resolvedProps = resolveResponsiveProps(dynamicProps, context.runtime.device);
        const blockType = effectiveBlock.type || 'text';
        const globalClassName = resolvedProps.globalClassName || '';
        const animationClass = resolveAnimationClass(resolvedProps.animationType || resolvedProps.animation || 'none');
        const stickyClass = resolvedProps.sticky ? 'sticky top-4 z-10' : '';
        const className = [resolvedProps.className || '', globalClassName, animationClass, stickyClass, resolvedProps.hoverClassName || ''].filter(Boolean).join(' ').trim();
        const childNodes = Array.isArray(effectiveBlock.children) ? effectiveBlock.children : [];
        const visibleChildren = childNodes.filter((child) =>
            evaluateVisibilityRules(child.visibilityRules, context.runtime),
        );
        const id = effectiveBlock.id || keyPrefix;

        if (resolvedProps.hidden === true) return null;

        if (blockType === 'row') {
            const columns = Math.min(Math.max(Number(resolvedProps.columns) || 2, 1), 6);
            return (
                <div
                    key={id}
                    className={className || 'grid gap-4'}
                    style={className ? undefined : { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                >
                    {visibleChildren.map((child, index) => renderBlockNode(child, `${id}-child-${index}`))}
                </div>
            );
        }

        if (blockType === 'column') {
            return (
                <div key={id} className={className || 'space-y-3'}>
                    {visibleChildren.map((child, index) => renderBlockNode(child, `${id}-child-${index}`))}
                </div>
            );
        }

        if (blockType === 'container') {
            return (
                <div key={id} className={className || 'container-custom'}>
                    {visibleChildren.map((child, index) => renderBlockNode(child, `${id}-child-${index}`))}
                </div>
            );
        }

        if (blockType === 'heading') {
            return (
                <h3 key={id} className={className || 'font-serif text-2xl font-semibold text-primary-900'}>
                    {resolvedProps.text || ''}
                </h3>
            );
        }

        if (blockType === 'button') {
            const href = resolvedProps.link || resolvedProps.href || '';
            const label = resolvedProps.text || 'Learn More';
            if (!href) return null;
            return (
                <Link key={id} href={href} className={className || 'btn btn-primary'}>
                    {label}
                </Link>
            );
        }

        if (blockType === 'form') {
            return <DynamicFormBlock key={id} id={id} props={resolvedProps} className={className} />;
        }

        if (blockType === 'image') {
            const src = resolvedProps.src || '';
            if (!src) return null;
            return (
                <Image
                    key={id}
                    src={src}
                    alt={resolvedProps.alt || ''}
                    className={className || 'w-full rounded-lg'}
                    width={Number(resolvedProps.width) || 1200}
                    height={Number(resolvedProps.height) || 800}
                    unoptimized
                />
            );
        }

        if (blockType === 'spacer') {
            const height = Number(resolvedProps.height || 24);
            return <div key={id} style={{ height: Number.isFinite(height) ? height : 24 }} />;
        }

        if (blockType === 'divider') {
            return <hr key={id} className={className || 'border-primary-200'} />;
        }

        return (
            <p key={id} className={className || 'text-primary-700'}>
                {resolvedProps.text || ''}
            </p>
        );
    };

    return <div className="space-y-3">{visibleBlocks.map((block, index) => renderBlockNode(block, `${zone}-${index}`))}</div>;
};

const isSectionEnabled = (section = {}) => {
    if (typeof section?.enabled === 'boolean') return section.enabled;

    const data = getLayoutSectionData(section);
    if (typeof data?.enabled === 'boolean') return data.enabled;

    return true;
};

const withExperimentData = (section = {}, runtime = {}) => {
    const baseData = getLayoutSectionData(section);
    const variant = resolveExperimentVariant(baseData.experiments, `${runtime.seed}:${section.id}:${runtime.pathname}`);
    if (!variant?.data) return baseData;
    return {
        ...baseData,
        ...variant.data,
    };
};

const HeroSection = ({ banners, heroSettings }) => {
    // Use banners if enabled and active, else fallback to Hero Settings
    const activeBanners = (banners || [])
        .filter(b => b.isActive)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (activeBanners.length > 0) {
        const banner = activeBanners[0];
        const bannerPrimaryLink = banner.link || banner.primaryLink || '';
        const bannerPrimaryText =
            banner.buttonText ||
            banner.primaryButtonText ||
            heroSettings?.primaryButtonText ||
            heroSettings?.buttonText ||
            'Shop Now';
        const bannerSecondaryLink =
            banner.secondaryLink ||
            banner.secondaryButtonLink ||
            heroSettings?.secondaryButtonLink ||
            heroSettings?.buttonLinkSecondary ||
            '';
        const bannerSecondaryText =
            banner.secondaryButtonText ||
            banner.buttonTextSecondary ||
            heroSettings?.secondaryButtonText ||
            heroSettings?.buttonTextSecondary ||
            'Learn More';

        return (
            <HeroAnimate
                backgroundUrl={banner.imageUrl || banner.image}
                className="h-[500px] lg:h-[600px] flex items-center"
            >
                <div className="container-custom">
                    <div className="max-w-2xl text-white">
                        <h2 className="text-5xl lg:text-7xl font-bold mb-4 leading-tight">{banner.title}</h2>
                        {banner.subtitle && <p className="text-xl text-white/90 mb-8">{banner.subtitle}</p>}
                        {(bannerPrimaryLink || bannerSecondaryLink) && (
                            <div className="inline-flex flex-col sm:flex-row gap-4">
                                {bannerPrimaryLink && (
                                    <Link href={bannerPrimaryLink} className="btn bg-white text-primary-900 px-8 py-3 text-lg hover:bg-brand-brown hover:text-white border-none">
                                        {bannerPrimaryText} <FiArrowRight className="inline ml-2" />
                                    </Link>
                                )}
                                {bannerSecondaryLink && (
                                    <Link href={bannerSecondaryLink} className="btn btn-secondary px-8 py-3 text-lg">
                                        {bannerSecondaryText}
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </HeroAnimate>
        );
    }

    // Fallback to Admin-defined Hero Section
    if (!heroSettings?.enabled) return null;

    const primaryButtonText =
        heroSettings.primaryButtonText ?? heroSettings.buttonText ?? 'Shop Collection';
    const primaryButtonLink =
        heroSettings.primaryButtonLink ?? heroSettings.buttonLink ?? '/products';
    const secondaryButtonText =
        heroSettings.secondaryButtonText ?? heroSettings.buttonTextSecondary ?? 'Learn More';
    const secondaryButtonLink =
        heroSettings.secondaryButtonLink ?? heroSettings.buttonLinkSecondary ?? '';
    const hasPrimaryButton = typeof primaryButtonLink === 'string' ? primaryButtonLink.trim().length > 0 : Boolean(primaryButtonLink);
    const hasSecondaryButton = typeof secondaryButtonLink === 'string' ? secondaryButtonLink.trim().length > 0 : Boolean(secondaryButtonLink);

    const heroLayout = heroSettings.layout || 'full-bleed';
    const heroAlignment = heroSettings.alignment || (heroLayout === 'minimal' ? 'center' : 'left');
    const heroAnimationType = heroSettings.animation?.type || 'none';
    const heroHasImage = Boolean(heroSettings.imageUrl);
    const textAlignmentClass = resolveHeroTextAlignment(heroAlignment);
    const contentPositionClass = resolveHeroContentPosition(heroAlignment);
    const contentWidthClass = heroLayout === 'minimal' ? 'max-w-3xl' : 'max-w-2xl';

    const contentNode = (
        <div className="container-custom">
            <div className={`w-full ${contentWidthClass} ${contentPositionClass} flex flex-col ${textAlignmentClass}`}>
                <h1 data-hero-animate className={`font-serif text-5xl md:text-7xl font-bold mb-6 ${heroHasImage ? 'text-white' : 'text-primary-900'}`}>
                    {heroSettings.title}
                    {heroSettings.subtitle && (
                        <span className={`block mt-2 ${heroHasImage ? 'text-white/90' : 'text-brand-brown'}`}>{heroSettings.subtitle}</span>
                    )}
                </h1>
                {heroSettings.description && (
                    <p data-hero-animate className={`text-xl mb-8 ${heroHasImage ? 'text-white/90' : 'text-primary-700'}`}>{heroSettings.description}</p>
                )}
                <div data-hero-animate className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                    {hasPrimaryButton && (
                        <Link href={primaryButtonLink} className="btn btn-primary text-lg px-8 py-4">
                            {primaryButtonText} <FiArrowRight className="inline ml-2" />
                        </Link>
                    )}
                    {hasSecondaryButton && (
                        <Link href={secondaryButtonLink} className="btn btn-secondary text-lg px-8 py-4">
                            {secondaryButtonText}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );

    if (heroHasImage) {
        return (
            <HeroAnimate
                backgroundUrl={heroSettings.imageUrl}
                animationType={heroAnimationType}
                className="min-h-[calc(100vh-80px)] flex items-center"
            >
                {contentNode}
            </HeroAnimate>
        );
    }

    return (
        <section className={`relative min-h-[calc(100vh-80px)] flex items-center overflow-hidden bg-gradient-to-br ${heroSettings.backgroundGradient || 'from-primary-50 via-brand-cream/20 to-primary-100'}`}>
            <HeroAnimate animationType={heroAnimationType} className="w-full">
                {contentNode}
            </HeroAnimate>
        </section>
    );
}

const TextSection = ({ sectionData }) => {
    if (!sectionData?.content) return null;

    return (
        <ScrollReveal delay={100}>
            <section className="section-padding bg-white">
                <div className="container-custom max-w-4xl">
                    <div className="prose prose-stone max-w-none whitespace-pre-wrap text-primary-700">
                        {sectionData.content}
                    </div>
                </div>
            </section>
        </ScrollReveal>
    );
};

const FeaturedProductsSection = ({ sectionData = {}, products }) => {
    if (!sectionData.enabled) return null;

    const productLimit = Number(sectionData.productLimit);
    const visibleProducts = Number.isFinite(productLimit) && productLimit > 0
        ? products.slice(0, productLimit)
        : products;

    return (
        <ScrollReveal delay={200}>
            <section className="section-padding bg-primary-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="font-serif text-4xl font-bold text-primary-900 mb-4">{sectionData.title}</h2>
                        <p className="text-lg text-primary-600 max-w-2xl mx-auto">{sectionData.description}</p>
                    </div>

                    {visibleProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {visibleProducts.map((product, idx) => (
                                <ProductCard key={product._id} product={product} priority={idx < 4} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-primary-600">No products available.</p>
                    )}

                    {sectionData.viewAllButtonLink && (
                        <div className="text-center mt-12">
                            <Link href={sectionData.viewAllButtonLink} className="btn btn-primary">
                                {sectionData.viewAllButtonText} <FiArrowRight className="ml-2 inline" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </ScrollReveal>
    );
};

const MadeToOrderSection = ({ sectionData = {} }) => {
    if (!sectionData.enabled) return null;

    const featureList = normalizeFeatureList(sectionData.features);

    return (
        <ScrollReveal delay={100}>
            <section className="section-padding bg-white text-center">
                <div className="container-custom max-w-4xl">
                    <h2 className="font-serif text-4xl font-bold text-primary-900 mb-6">{sectionData.title}</h2>
                    <p className="text-lg text-primary-600 mb-8">{sectionData.description}</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-primary-600">
                        {featureList.map(f => (
                            <span key={f} className="bg-primary-50 px-3 py-1 rounded-full">{f}</span>
                        ))}
                    </div>
                </div>
            </section>
        </ScrollReveal>
    );
};

const NewsletterSection = ({ sectionData = {} }) => {
    if (!sectionData.enabled) return null;

    return (
        <ScrollReveal delay={100}>
            <section className="section-padding bg-brand-brown text-white text-center">
                <div className="container-custom max-w-2xl">
                    <h2 className="font-serif text-3xl font-bold mb-4">{sectionData.title}</h2>
                    <p className="text-white/80 mb-8">{sectionData.description}</p>
                    <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder={sectionData.placeholder || 'Your email address'}
                            className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none"
                        />
                        <button className="bg-brand-tan text-white px-6 py-3 rounded-md hover:bg-white hover:text-brand-brown transition-colors font-medium">
                            {sectionData.buttonText}
                        </button>
                    </form>
                </div>
            </section>
        </ScrollReveal>
    );
};

const TrustBadgesSection = ({ settings }) => {
    if (!settings.trustBadges?.length) return null;
    return (
        <ScrollReveal>
            <section className="section-padding bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {settings.trustBadges.map(badge => {
                            const Icon = getIconComponent(badge.icon);
                            return (
                                <div key={badge.id} className="text-center p-6">
                                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icon className="w-8 h-8 text-brand-brown" />
                                    </div>
                                    <h3 className="font-serif text-xl font-semibold mb-2">{badge.title}</h3>
                                    <p className="text-primary-600">{badge.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </ScrollReveal>
    );
};

export default function HomeSections({ initialSettings, initialProducts }) {
    const { settings: clientSettings, loading } = useSiteSettings();
    const { user, isAuthenticated } = useAuth();
    const [builderLayout, setBuilderLayout] = useState([]);
    const [selectedBuilderSectionId, setSelectedBuilderSectionId] = useState(null);
    const [isBuilderSaving, setIsBuilderSaving] = useState(false);
    const [pageDraft, setPageDraft] = useState({ title: '', slug: '' });
    const [globalWidgetsJson, setGlobalWidgetsJson] = useState('{}');
    const [globalWidgetsDraft, setGlobalWidgetsDraft] = useState({});
    const [showRawWidgetsJson, setShowRawWidgetsJson] = useState(false);
    const [popupConfigJson, setPopupConfigJson] = useState('{"enabled":false}');

    // Prefer client settings if loaded (which includes live previews), otherwise fallback to server settings (SSR)
    const activeSettings = useMemo(() => {
        // If we're loading client settings, sticking to initialSettings is safer to avoid layout shift
        // unless we have a specific reason to believe clientSettings has more recent data (like live preview).
        // However, deepMerge in Context ensures we have data. 
        // If loading is true, 'clientSettings' might be defaults.
        // So:
        const baseSettings = loading ? initialSettings : clientSettings;
        return normalizeSettingsLayout(baseSettings);
    }, [loading, clientSettings, initialSettings]);

    const runtimeContext = useMemo(() => {
        const hasWindow = typeof window !== 'undefined';
        const width = hasWindow ? window.innerWidth : 1280;
        const device = width <= 768 ? 'mobile' : width <= 1024 ? 'tablet' : 'desktop';
        const query = hasWindow ? new URLSearchParams(window.location.search) : new URLSearchParams('');
        const pathname = hasWindow ? window.location.pathname : '/';
        const isEmbeddedPreview = hasWindow && query.get('visualEditor') === '1';
        const isStorefrontBuilder = hasWindow && query.get('storefrontBuilder') === '1';
        const seed = hasWindow
            ? window.localStorage.getItem('vb-seed') || `${Date.now()}`
            : 'server';

        if (hasWindow && !window.localStorage.getItem('vb-seed')) {
            window.localStorage.setItem('vb-seed', seed);
        }

        return {
            device,
            query,
            pathname,
            seed,
            isEmbeddedPreview,
            isStorefrontBuilder,
            isLoggedIn: false,
        };
    }, []);

    useEffect(() => {
        if (!runtimeContext.isStorefrontBuilder) return;
        const normalizedLayout = normalizeLayoutSchema(activeSettings.layout || []);
        setBuilderLayout(normalizedLayout);
        const initialWidgets = activeSettings?.theme?.globalWidgets || {};
        setGlobalWidgetsDraft(initialWidgets);
        setGlobalWidgetsJson(JSON.stringify(initialWidgets, null, 2));
        setPopupConfigJson(JSON.stringify(activeSettings?.theme?.popupBuilder || { enabled: false }, null, 2));
        if (!selectedBuilderSectionId && normalizedLayout[0]?.id) {
            setSelectedBuilderSectionId(normalizedLayout[0].id);
        }
    }, [
        runtimeContext.isStorefrontBuilder,
        activeSettings.layout,
        activeSettings?.theme?.globalWidgets,
        activeSettings?.theme?.popupBuilder,
        selectedBuilderSectionId,
    ]);

    const canEditStorefront = useMemo(() => {
        if (!isAuthenticated) return false;
        return ['admin', 'designer', 'publisher'].includes(user?.role);
    }, [isAuthenticated, user?.role]);

    const canPublishStorefront = useMemo(() => {
        if (!isAuthenticated) return false;
        return ['admin', 'publisher'].includes(user?.role);
    }, [isAuthenticated, user?.role]);

    const effectiveSettings = useMemo(() => {
        if (!runtimeContext.isStorefrontBuilder) return activeSettings;
        if (!Array.isArray(builderLayout) || builderLayout.length === 0) return activeSettings;

        const normalizedLayout = normalizeLayoutSchema(builderLayout);
        const derivedHomeSections = deriveHomeSectionsFromLayout(
            normalizedLayout,
            activeSettings.homeSections || {},
        );

        return {
            ...activeSettings,
            layout: normalizedLayout,
            homeSections: derivedHomeSections,
        };
    }, [runtimeContext.isStorefrontBuilder, builderLayout, activeSettings]);

    // Determine Layout Order
    // Use settings.layout if available, otherwise fallback to default structure
    let renderOrder = [];

    if (effectiveSettings.layout && effectiveSettings.layout.length > 0) {
        renderOrder = effectiveSettings.layout.filter((item) => {
            if (!isSectionEnabled(item)) return false;
            const effectiveData = withExperimentData(item, runtimeContext);
            return evaluateVisibilityRules(effectiveData.visibilityRules, runtimeContext);
        });
    } else {
        // Default fallback
        if (effectiveSettings.homeSections?.heroSection?.enabled) renderOrder.push({ id: 'hero', type: 'hero' });
        if (effectiveSettings.homeSections?.featuredProducts?.enabled) renderOrder.push({ id: 'products', type: 'products' });
        if (effectiveSettings.homeSections?.madeToOrder?.enabled) renderOrder.push({ id: 'madeToOrder', type: 'madeToOrder' });
        if (effectiveSettings.homeSections?.newsletter?.enabled) renderOrder.push({ id: 'newsletter', type: 'newsletter' });
    }

    // Helper to render section by type
    const renderSection = (section) => {
        const sectionData = withExperimentData(section, runtimeContext);

        switch (section.type) {
            case 'hero': {
                const heroSettings = mergeHeroSettings(
                    effectiveSettings.homeSections?.heroSection || {},
                    sectionData || {}
                );
                return <HeroSection key={section.id} banners={effectiveSettings.banners} heroSettings={heroSettings} />;
            }
            case 'products': {
                const productsSettings = mergeSectionSettings(
                    effectiveSettings.homeSections?.featuredProducts || {},
                    sectionData || {}
                );
                return <FeaturedProductsSection key={section.id} sectionData={productsSettings} products={initialProducts} />;
            }
            case 'madeToOrder': {
                const madeToOrderSettings = mergeSectionSettings(
                    effectiveSettings.homeSections?.madeToOrder || {},
                    sectionData || {}
                );
                return <MadeToOrderSection key={section.id} sectionData={madeToOrderSettings} />;
            }
            case 'newsletter': {
                const newsletterSettings = mergeSectionSettings(
                    effectiveSettings.homeSections?.newsletter || {},
                    sectionData || {}
                );
                return <NewsletterSection key={section.id} sectionData={newsletterSettings} />;
            }
            case 'text':
                return <TextSection key={section.id} sectionData={sectionData || {}} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        const isEmbeddedPreview =
            typeof window !== 'undefined' &&
            window.parent !== window &&
            new URLSearchParams(window.location.search).get('visualEditor') === '1';

        if (!isEmbeddedPreview) return;

        const onClickCapture = (event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;

            const sectionEl = target.closest('[data-editor-section]');
            if (!sectionEl) return;

            event.preventDefault();
            event.stopPropagation();

            window.parent.postMessage(
                {
                    type: 'SECTION_CLICKED',
                    payload: {
                        id: sectionEl.getAttribute('data-section-id') || null,
                        sectionType: sectionEl.getAttribute('data-section-type') || null,
                    },
                },
                '*',
            );
        };

        document.addEventListener('click', onClickCapture, true);
        return () => document.removeEventListener('click', onClickCapture, true);
    }, []);

    const selectedBuilderSection = useMemo(
        () => builderLayout.find((section) => section.id === selectedBuilderSectionId) || null,
        [builderLayout, selectedBuilderSectionId],
    );

    const updateSelectedSectionBlocks = (nextBlocks) => {
        if (!selectedBuilderSectionId) return;

        setBuilderLayout((prev) => prev.map((section) => {
            if (section.id !== selectedBuilderSectionId) return section;
            return {
                ...section,
                data: {
                    ...(section.data || {}),
                    blocks: nextBlocks,
                },
            };
        }));
    };

    const handleStorefrontBuilderSave = async () => {
        try {
            setIsBuilderSaving(true);
            const normalizedLayout = normalizeLayoutSchema(builderLayout);
            const homeSections = deriveHomeSectionsFromLayout(
                normalizedLayout,
                activeSettings.homeSections || {},
            );

            let parsedGlobalWidgets = {};
            let parsedPopupConfig = { enabled: false };

            try {
                parsedGlobalWidgets = showRawWidgetsJson
                    ? JSON.parse(globalWidgetsJson || '{}')
                    : (globalWidgetsDraft || {});
            } catch {
                toast.error('Global widgets JSON is invalid');
                setIsBuilderSaving(false);
                return;
            }

            try {
                parsedPopupConfig = JSON.parse(popupConfigJson || '{"enabled":false}');
            } catch {
                toast.error('Popup config JSON is invalid');
                setIsBuilderSaving(false);
                return;
            }

            await adminAPI.updateSettings({
                layout: normalizedLayout,
                homeSections,
                layoutSchemaVersion: CURRENT_LAYOUT_SCHEMA_VERSION,
                theme: {
                    ...(activeSettings.theme || {}),
                    globalWidgets: parsedGlobalWidgets,
                    popupBuilder: parsedPopupConfig,
                },
            });

            toast.success('Storefront builder changes saved');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save storefront builder changes');
        } finally {
            setIsBuilderSaving(false);
        }
    };

    const handleQuickAddButton = () => {
        if (!canEditStorefront) {
            toast.error('Your role cannot edit builder content');
            return;
        }
        if (!selectedBuilderSectionId) {
            toast.error('Select a section first');
            return;
        }

        const existingBlocks = Array.isArray(selectedBuilderSection?.data?.blocks)
            ? selectedBuilderSection.data.blocks
            : [];

        updateSelectedSectionBlocks([
            ...existingBlocks,
            {
                id: `button-${Date.now()}`,
                type: 'button',
                zone: 'after',
                props: {
                    text: 'New Button',
                    link: '/products',
                    className: 'btn btn-primary',
                },
                children: [],
            },
        ]);
    };

    const handleAddGlobalWidget = () => {
        const defaultId = `widget-${Date.now()}`;
        setGlobalWidgetsDraft((prev) => {
            const next = {
                ...(prev || {}),
                [defaultId]: {
                    id: defaultId,
                    type: 'button',
                    props: {
                        text: 'New Global Widget',
                        link: '/products',
                        className: 'btn btn-primary',
                    },
                    children: [],
                },
            };
            setGlobalWidgetsJson(JSON.stringify(next, null, 2));
            return next;
        });
    };

    const handleUpdateGlobalWidget = (widgetId, key, value) => {
        setGlobalWidgetsDraft((prev) => {
            const current = prev?.[widgetId] || { type: 'text', props: {} };
            const next = {
                ...(prev || {}),
                [widgetId]: {
                    ...current,
                    type: key === 'type' ? value : current.type,
                    props: {
                        ...(current.props || {}),
                        ...(key === 'text' ? { text: value } : {}),
                        ...(key === 'link' ? { link: value, href: value } : {}),
                        ...(key === 'className' ? { className: value } : {}),
                    },
                },
            };
            setGlobalWidgetsJson(JSON.stringify(next, null, 2));
            return next;
        });
    };

    const handleRenameGlobalWidgetId = (oldId, newIdRaw) => {
        const newId = String(newIdRaw || '').trim();
        if (!newId || newId === oldId) return;

        setGlobalWidgetsDraft((prev) => {
            if (!prev?.[oldId]) return prev;
            if (prev?.[newId]) {
                toast.error('Global widget id already exists');
                return prev;
            }

            const next = { ...(prev || {}) };
            const widget = { ...(next[oldId] || {}), id: newId };
            delete next[oldId];
            next[newId] = widget;
            setGlobalWidgetsJson(JSON.stringify(next, null, 2));
            return next;
        });
    };

    const handleDeleteGlobalWidget = (widgetId) => {
        setGlobalWidgetsDraft((prev) => {
            const next = { ...(prev || {}) };
            delete next[widgetId];
            setGlobalWidgetsJson(JSON.stringify(next, null, 2));
            return next;
        });
    };

    const handleCreatePageFromSection = async () => {
        if (!canPublishStorefront) {
            toast.error('Only admin/publisher can create pages');
            return;
        }
        const title = pageDraft.title.trim();
        const slug = pageDraft.slug.trim().toLowerCase();

        if (!title || !slug) {
            toast.error('Page title and slug are required');
            return;
        }

        const sourceBlocks = Array.isArray(selectedBuilderSection?.data?.blocks)
            ? selectedBuilderSection.data.blocks
            : [];

        const contentBlocks = sourceBlocks.map((block, index) => ({
            type: block?.type || 'text',
            position: index,
            visibility: 'all',
            config: {
                ...(block || {}),
            },
        }));

        try {
            await adminAPI.createCmsPage({
                title,
                slug,
                path: `/pages/${slug}`,
                status: 'draft',
                category: 'page',
                template: 'default',
                blocks: contentBlocks,
            });

            toast.success(`Page created at /pages/${slug}`);
            setPageDraft({ title: '', slug: '' });
        } catch (error) {
            console.error(error);
            toast.error('Failed to create page');
        }
    };

    const handleResetStorefrontDefaults = async () => {
        if (!canPublishStorefront) {
            toast.error('Only admin/publisher can reset storefront');
            return;
        }
        const confirmed = window.confirm(
            'Reset all frontend settings to default and publish live now? This will overwrite current settings.',
        );
        if (!confirmed) return;

        const typedConfirmation = window.prompt('Type RESET to confirm full storefront reset:');
        if (typedConfirmation !== 'RESET') {
            toast.error('Reset cancelled. Confirmation text did not match.');
            return;
        }

        try {
            setIsBuilderSaving(true);
            await adminAPI.resetFrontendDefaults();
            toast.success('Frontend reset to defaults');
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error('Failed to reset defaults');
        } finally {
            setIsBuilderSaving(false);
        }
    };

    return (
        <>
            {renderOrder.map(section => (
                (() => {
                    const effectiveSectionData = withExperimentData(section, runtimeContext);
                    const scopeSelector = `[data-section-id="${section.id}"]`;
                    const compiledCss = compileScopedCss(scopeSelector, effectiveSectionData.customCss || '');
                    const compiledGlobalClassCss = compileGlobalClassCss(scopeSelector, effectiveSectionData.globalClassStyles);
                    const renderCost = analyzeBlockPerformance(effectiveSectionData.blocks);
                    const bindingContext = {
                        settings: effectiveSettings,
                        section: effectiveSectionData,
                    };

                    return (
                        <div
                            key={section.id}
                            className="relative"
                            data-editor-section="true"
                            data-section-id={section.id}
                            data-section-type={section.type}
                        >
                            {compiledCss && <style>{compiledCss}</style>}
                            {compiledGlobalClassCss && <style>{compiledGlobalClassCss}</style>}
                            {runtimeContext.isEmbeddedPreview && (
                                <div className="pointer-events-none absolute right-2 top-2 z-20">
                                    <span
                                        className={`rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                                            renderCost.level === 'high'
                                                ? 'bg-red-100 text-red-700'
                                                : renderCost.level === 'medium'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                        }`}
                                    >
                                        Render Cost: {renderCost.level}
                                    </span>
                                </div>
                            )}
                            {renderDynamicBlocks(
                                effectiveSectionData.blocks,
                                { runtime: runtimeContext, binding: bindingContext },
                                'before',
                            )}
                            {renderSection(section)}
                            {renderDynamicBlocks(
                                effectiveSectionData.blocks,
                                { runtime: runtimeContext, binding: bindingContext },
                                'after',
                            )}
                            {section.type === 'hero' && <TrustBadgesSection settings={effectiveSettings} />}
                        </div>
                    );
                })()
            ))}

            <PopupBuilder popupConfig={effectiveSettings?.theme?.popupBuilder || { enabled: false }} />

            {runtimeContext.isStorefrontBuilder && (
                <div className="fixed top-4 right-4 w-[360px] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-2xl z-50 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-800">Storefront Builder</h3>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Live Edit</span>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Select Section</label>
                        <select
                            value={selectedBuilderSectionId || ''}
                            onChange={(event) => setSelectedBuilderSectionId(event.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                        >
                            <option value="">Choose section</option>
                            {builderLayout.map((section) => (
                                <option key={section.id} value={section.id}>{section.type} ({section.id})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleQuickAddButton}
                            className="btn btn-secondary text-xs"
                            type="button"
                        >
                            Add Button Block
                        </button>
                        <button
                            onClick={handleStorefrontBuilderSave}
                            className="btn btn-primary text-xs"
                            type="button"
                            disabled={isBuilderSaving || !canEditStorefront}
                        >
                            {isBuilderSaving ? 'Saving...' : 'Save Theme'}
                        </button>
                    </div>

                    <button
                        onClick={handleResetStorefrontDefaults}
                        className="btn btn-secondary w-full text-xs"
                        type="button"
                        disabled={isBuilderSaving || !canPublishStorefront}
                    >
                        Reset to Default Frontend
                    </button>

                    {selectedBuilderSection && (
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-2">Drag & Drop Components</p>
                            <BlockTreeEditor
                                value={selectedBuilderSection?.data?.blocks || []}
                                onChange={updateSelectedSectionBlocks}
                            />
                        </div>
                    )}

                    <div className="rounded border border-gray-200 p-2 space-y-2">
                        <p className="text-xs font-semibold text-gray-700">Create Page (Elementor-style)</p>
                        <input
                            type="text"
                            value={pageDraft.title}
                            onChange={(event) => setPageDraft((prev) => ({ ...prev, title: event.target.value }))}
                            placeholder="Page title"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                        />
                        <input
                            type="text"
                            value={pageDraft.slug}
                            onChange={(event) => setPageDraft((prev) => ({ ...prev, slug: event.target.value }))}
                            placeholder="page-slug"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                        />
                        <button
                            onClick={handleCreatePageFromSection}
                            className="btn btn-secondary w-full text-xs"
                            type="button"
                            disabled={!canPublishStorefront}
                        >
                            Create Draft Page from Section Blocks
                        </button>
                    </div>

                    <div className="rounded border border-gray-200 p-2 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-700">Global Widgets</p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleAddGlobalWidget}
                                    className="btn btn-secondary text-[11px] px-2 py-1"
                                    disabled={!canEditStorefront}
                                >
                                    Add Widget
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRawWidgetsJson((prev) => !prev)}
                                    className="btn btn-secondary text-[11px] px-2 py-1"
                                >
                                    {showRawWidgetsJson ? 'Visual Mode' : 'JSON Mode'}
                                </button>
                            </div>
                        </div>

                        {showRawWidgetsJson ? (
                            <textarea
                                value={globalWidgetsJson}
                                onChange={(event) => {
                                    setGlobalWidgetsJson(event.target.value);
                                    try {
                                        const parsed = JSON.parse(event.target.value || '{}');
                                        setGlobalWidgetsDraft(parsed);
                                    } catch {
                                        // keep invalid JSON in textarea until user fixes
                                    }
                                }}
                                rows={6}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-mono"
                                placeholder='{"promoButton":{"type":"button","props":{"text":"Shop","link":"/products"}}}'
                            />
                        ) : (
                            <div className="space-y-2 max-h-52 overflow-y-auto">
                                {Object.keys(globalWidgetsDraft || {}).length === 0 && (
                                    <p className="text-[11px] text-gray-500">No global widgets yet.</p>
                                )}
                                {Object.entries(globalWidgetsDraft || {}).map(([widgetId, widget]) => (
                                    <div key={widgetId} className="rounded border border-gray-200 p-2 space-y-1">
                                        <div className="grid grid-cols-2 gap-1">
                                            <input
                                                type="text"
                                                value={widgetId}
                                                onChange={(event) => handleRenameGlobalWidgetId(widgetId, event.target.value)}
                                                className="border border-gray-300 rounded px-2 py-1 text-xs"
                                            />
                                            <select
                                                value={widget?.type || 'text'}
                                                onChange={(event) => handleUpdateGlobalWidget(widgetId, 'type', event.target.value)}
                                                className="border border-gray-300 rounded px-2 py-1 text-xs"
                                            >
                                                <option value="text">text</option>
                                                <option value="heading">heading</option>
                                                <option value="button">button</option>
                                                <option value="image">image</option>
                                                <option value="form">form</option>
                                            </select>
                                        </div>
                                        <input
                                            type="text"
                                            value={widget?.props?.text || ''}
                                            onChange={(event) => handleUpdateGlobalWidget(widgetId, 'text', event.target.value)}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                            placeholder="Text"
                                        />
                                        <input
                                            type="text"
                                            value={widget?.props?.link || widget?.props?.href || ''}
                                            onChange={(event) => handleUpdateGlobalWidget(widgetId, 'link', event.target.value)}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                            placeholder="Link (/products)"
                                        />
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="text"
                                                value={widget?.props?.className || ''}
                                                onChange={(event) => handleUpdateGlobalWidget(widgetId, 'className', event.target.value)}
                                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                                                placeholder="Class"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteGlobalWidget(widgetId)}
                                                className="btn btn-secondary text-[11px] px-2 py-1"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="text-[10px] text-gray-500">Use block field <strong>globalWidgetId</strong> to reuse widgets across sections/pages.</p>
                    </div>

                    <div className="rounded border border-gray-200 p-2 space-y-2">
                        <p className="text-xs font-semibold text-gray-700">Popup Builder (JSON)</p>
                        <textarea
                            value={popupConfigJson}
                            onChange={(event) => setPopupConfigJson(event.target.value)}
                            rows={5}
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-mono"
                            placeholder='{"enabled":true,"title":"Welcome","description":"Sale live","delayMs":1500,"buttonText":"Shop","buttonLink":"/products"}'
                        />
                    </div>
                </div>
            )}
        </>
    );
}
