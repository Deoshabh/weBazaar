'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
    evaluateVisibilityRules,
    parseMaybeJson,
    resolveDynamicObject,
    resolveResponsiveProps,
} from '@/utils/visualBuilder';
import { normalizeEditorWidgetMap } from '@/components/editor/sharedEditorContract';

const resolveAnimationClass = (animationType = 'none') => {
    if (animationType === 'fade-up') return 'animate-fade-up';
    if (animationType === 'slide-in') return 'animate-slide-in';
    if (animationType === 'zoom-in') return 'animate-zoom-in';
    return '';
};

const normalizeCollection = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
        const parsed = parseMaybeJson(value, null);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
        return value
            .split('\n')
            .map((entry) => entry.trim())
            .filter(Boolean);
    }
    return [];
};

function GalleryBlock({ id, props = {}, className = '' }) {
    const entries = normalizeCollection(props.images || props.items);
    const columns = Math.min(Math.max(Number(props.columns) || 3, 1), 6);

    if (!entries.length) return null;

    return (
        <div
            key={id}
            className={className || 'grid gap-3'}
            style={className ? undefined : { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
            {entries.map((entry, index) => {
                const src = typeof entry === 'string' ? entry : entry?.src || '';
                const alt = typeof entry === 'string' ? `Gallery image ${index + 1}` : (entry?.alt || `Gallery image ${index + 1}`);
                if (!src) return null;
                return (
                    <Image
                        key={`${id}-gallery-${index}`}
                        src={src}
                        alt={alt}
                        width={800}
                        height={600}
                        className="w-full rounded-lg object-cover"
                        unoptimized
                    />
                );
            })}
        </div>
    );
}

function AccordionBlock({ id, props = {}, className = '' }) {
    const items = normalizeCollection(props.items).map((entry, index) => (
        typeof entry === 'string'
            ? { id: `${id}-item-${index}`, title: `Item ${index + 1}`, content: entry }
            : {
                id: entry?.id || `${id}-item-${index}`,
                title: entry?.title || `Item ${index + 1}`,
                content: entry?.content || '',
            }
    ));

    if (!items.length) return null;

    return (
        <div key={id} className={className || 'space-y-2'}>
            {items.map((item) => (
                <details
                    key={item.id}
                    className="rounded-lg border px-4 py-3"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    <summary className="cursor-pointer font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.title}</summary>
                    <p className="mt-2 text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>{item.content}</p>
                </details>
            ))}
        </div>
    );
}

function TabsBlock({ id, props = {}, className = '' }) {
    const items = normalizeCollection(props.items).map((entry, index) => (
        typeof entry === 'string'
            ? { id: `${id}-tab-${index}`, label: `Tab ${index + 1}`, content: entry }
            : {
                id: entry?.id || `${id}-tab-${index}`,
                label: entry?.label || entry?.title || `Tab ${index + 1}`,
                content: entry?.content || '',
            }
    ));

    const [activeIndex, setActiveIndex] = useState(0);

    if (!items.length) return null;

    const safeIndex = Math.min(Math.max(activeIndex, 0), items.length - 1);
    const active = items[safeIndex];

    return (
        <div key={id} className={className || 'space-y-3'}>
            <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className="rounded-md border px-3 py-1.5 text-sm"
                        style={index === safeIndex
                            ? {
                                borderColor: 'var(--theme-primary-color)',
                                backgroundColor: 'color-mix(in srgb, var(--theme-primary-color) 14%, var(--color-surface) 86%)',
                                color: 'var(--color-text-primary)',
                            }
                            : {
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-secondary)',
                            }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            <div
                className="rounded-lg border p-4 text-sm whitespace-pre-wrap"
                style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-secondary)',
                }}
            >
                {active?.content || ''}
            </div>
        </div>
    );
}

function CarouselBlock({ id, props = {}, className = '' }) {
    const items = normalizeCollection(props.items).map((entry, index) => {
        if (typeof entry === 'string') {
            return { id: `${id}-slide-${index}`, image: entry, title: '', description: '' };
        }

        return {
            id: entry?.id || `${id}-slide-${index}`,
            image: entry?.image || entry?.src || '',
            title: entry?.title || '',
            description: entry?.description || entry?.content || '',
        };
    });

    const [activeIndex, setActiveIndex] = useState(0);

    if (!items.length) return null;

    const safeIndex = Math.min(Math.max(activeIndex, 0), items.length - 1);
    const active = items[safeIndex];

    const goPrev = () => setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    const goNext = () => setActiveIndex((prev) => (prev + 1) % items.length);

    return (
        <div key={id} className={className || 'space-y-3'}>
            <div
                className="relative overflow-hidden rounded-xl border"
                style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                }}
            >
                {active?.image ? (
                    <Image
                        src={active.image}
                        alt={active.title || `Slide ${safeIndex + 1}`}
                        width={1400}
                        height={700}
                        className="h-72 w-full object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="flex h-72 items-center justify-center" style={{ color: 'var(--color-text-secondary)' }}>No slide image</div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-black/45 px-4 py-3 text-white">
                    {active?.title && <p className="font-semibold">{active.title}</p>}
                    {active?.description && <p className="text-sm text-white/85">{active.description}</p>}
                </div>
            </div>

            {items.length > 1 && (
                <div className="flex items-center justify-between">
                    <button type="button" onClick={goPrev} className="btn btn-secondary text-sm px-3 py-1.5">Prev</button>
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{safeIndex + 1} / {items.length}</span>
                    <button type="button" onClick={goNext} className="btn btn-secondary text-sm px-3 py-1.5">Next</button>
                </div>
            )}
        </div>
    );
}

function VideoBlock({ id, props = {}, className = '' }) {
    const source = props.src || props.videoUrl || '';
    if (!source) return null;

    return (
        <video
            key={id}
            src={source}
            poster={props.poster || props.posterUrl || undefined}
            controls={props.controls !== false}
            muted={Boolean(props.muted)}
            autoPlay={Boolean(props.autoPlay)}
            loop={Boolean(props.loop)}
            playsInline
            className={className || 'w-full rounded-lg'}
        />
    );
}

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
        <form
            key={id}
            onSubmit={handleSubmit}
            className={className || 'space-y-3 rounded-lg border p-4'}
            style={className ? undefined : { borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
            {fields.map((field) => (
                <div key={field.name} className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{field.label || field.name}</label>
                    {field.type === 'textarea' ? (
                        <textarea
                            name={field.name}
                            required={Boolean(field.required)}
                            className="w-full border rounded px-3 py-2 text-sm"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-background)' }}
                            rows={Number(field.rows) || 4}
                            placeholder={field.placeholder || ''}
                        />
                    ) : (
                        <input
                            type={field.type || 'text'}
                            name={field.name}
                            required={Boolean(field.required)}
                            className="w-full border rounded px-3 py-2 text-sm"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-background)' }}
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

export const renderDynamicBlocks = (blocksInput, context, zone = 'after') => {
    const parsed = parseMaybeJson(blocksInput, blocksInput);
    const blocks = Array.isArray(parsed) ? parsed : [];
    const normalizedGlobalWidgetMap = normalizeEditorWidgetMap(
        context?.binding?.settings?.theme?.globalWidgets || {},
    );

    const visibleBlocks = blocks.filter((block) => {
        if (!block || (block.zone || 'after') !== zone) return false;
        return evaluateVisibilityRules(block.visibilityRules, context.runtime);
    });

    if (visibleBlocks.length === 0) return null;

    const renderBlockNode = (block, keyPrefix) => {
        const globalWidgetId = block?.props?.globalWidgetId || block?.globalWidgetId;
        const globalWidgetNode = globalWidgetId ? normalizedGlobalWidgetMap?.[globalWidgetId] : null;

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

        if (blockType === 'video') {
            return <VideoBlock key={id} id={id} props={resolvedProps} className={className} />;
        }

        if (blockType === 'gallery') {
            return <GalleryBlock key={id} id={id} props={resolvedProps} className={className} />;
        }

        if (blockType === 'accordion') {
            return <AccordionBlock key={id} id={id} props={resolvedProps} className={className} />;
        }

        if (blockType === 'tabs') {
            return <TabsBlock key={id} id={id} props={resolvedProps} className={className} />;
        }

        if (blockType === 'carousel') {
            return <CarouselBlock key={id} id={id} props={resolvedProps} className={className} />;
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
