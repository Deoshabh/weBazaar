'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';
import ProductCard from '@/components/ProductCard';
import HeroAnimate from '@/components/ui/HeroAnimate';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { getIconComponent } from '@/utils/iconMapper';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useEffect, useMemo } from 'react';
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
        const dynamicProps = resolveDynamicObject(block.props || {}, context.binding);
        const resolvedProps = resolveResponsiveProps(dynamicProps, context.runtime.device);
        const blockType = block.type || 'text';
        const globalClassName = resolvedProps.globalClassName || '';
        const className = [resolvedProps.className || '', globalClassName].filter(Boolean).join(' ').trim();
        const childNodes = Array.isArray(block.children) ? block.children : [];
        const visibleChildren = childNodes.filter((child) =>
            evaluateVisibilityRules(child.visibilityRules, context.runtime),
        );
        const id = block.id || keyPrefix;

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

const withExperimentData = (section = {}, runtime = {}) => {
    const baseData = section.data || {};
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

    // Prefer client settings if loaded (which includes live previews), otherwise fallback to server settings (SSR)
    const activeSettings = useMemo(() => {
        // If we're loading client settings, sticking to initialSettings is safer to avoid layout shift
        // unless we have a specific reason to believe clientSettings has more recent data (like live preview).
        // However, deepMerge in Context ensures we have data. 
        // If loading is true, 'clientSettings' might be defaults.
        // So:
        if (loading) return initialSettings;
        return clientSettings;
    }, [loading, clientSettings, initialSettings]);

    const runtimeContext = useMemo(() => {
        const hasWindow = typeof window !== 'undefined';
        const width = hasWindow ? window.innerWidth : 1280;
        const device = width <= 768 ? 'mobile' : width <= 1024 ? 'tablet' : 'desktop';
        const query = hasWindow ? new URLSearchParams(window.location.search) : new URLSearchParams('');
        const pathname = hasWindow ? window.location.pathname : '/';
        const isEmbeddedPreview = hasWindow && query.get('visualEditor') === '1';
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
            isLoggedIn: false,
        };
    }, []);

    // Determine Layout Order
    // Use settings.layout if available, otherwise fallback to default structure
    let renderOrder = [];

    if (activeSettings.layout && activeSettings.layout.length > 0) {
        renderOrder = activeSettings.layout.filter((item) => {
            if (!item.enabled) return false;
            const effectiveData = withExperimentData(item, runtimeContext);
            return evaluateVisibilityRules(effectiveData.visibilityRules, runtimeContext);
        });
    } else {
        // Default fallback
        if (activeSettings.homeSections?.heroSection?.enabled) renderOrder.push({ id: 'hero', type: 'hero' });
        if (activeSettings.homeSections?.featuredProducts?.enabled) renderOrder.push({ id: 'products', type: 'products' });
        if (activeSettings.homeSections?.madeToOrder?.enabled) renderOrder.push({ id: 'madeToOrder', type: 'madeToOrder' });
        if (activeSettings.homeSections?.newsletter?.enabled) renderOrder.push({ id: 'newsletter', type: 'newsletter' });
    }

    // Helper to render section by type
    const renderSection = (section) => {
        const sectionData = withExperimentData(section, runtimeContext);

        switch (section.type) {
            case 'hero': {
                const heroSettings = mergeHeroSettings(
                    activeSettings.homeSections?.heroSection || {},
                    sectionData || {}
                );
                return <HeroSection key={section.id} banners={activeSettings.banners} heroSettings={heroSettings} />;
            }
            case 'products': {
                const productsSettings = mergeSectionSettings(
                    activeSettings.homeSections?.featuredProducts || {},
                    sectionData || {}
                );
                return <FeaturedProductsSection key={section.id} sectionData={productsSettings} products={initialProducts} />;
            }
            case 'madeToOrder': {
                const madeToOrderSettings = mergeSectionSettings(
                    activeSettings.homeSections?.madeToOrder || {},
                    sectionData || {}
                );
                return <MadeToOrderSection key={section.id} sectionData={madeToOrderSettings} />;
            }
            case 'newsletter': {
                const newsletterSettings = mergeSectionSettings(
                    activeSettings.homeSections?.newsletter || {},
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
                        settings: activeSettings,
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
                            {section.type === 'hero' && <TrustBadgesSection settings={activeSettings} />}
                        </div>
                    );
                })()
            ))}
        </>
    );
}
