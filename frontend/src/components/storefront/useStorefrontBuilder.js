import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/utils/api';
import {
    CURRENT_LAYOUT_SCHEMA_VERSION,
    deriveHomeSectionsFromLayout,
    normalizeLayoutSchema,
} from '@/utils/layoutSchema';
import {
    createEditorBlock,
    normalizeEditorBlockTree,
    normalizeEditorWidgetMap,
} from '@/components/editor/sharedEditorContract';

export default function useStorefrontBuilder({
    activeSettings,
    runtimeContext,
    canEditStorefront,
    canPublishStorefront,
}) {
    const [builderLayout, setBuilderLayout] = useState([]);
    const [selectedBuilderSectionId, setSelectedBuilderSectionId] = useState(null);
    const [isBuilderSaving, setIsBuilderSaving] = useState(false);
    const [pageDraft, setPageDraft] = useState({ title: '', slug: '' });
    const [builderTab, setBuilderTab] = useState('structure');
    const [isWidgetDragActive, setIsWidgetDragActive] = useState(false);
    const [globalWidgetsJson, setGlobalWidgetsJson] = useState('{}');
    const [globalWidgetsDraft, setGlobalWidgetsDraft] = useState({});
    const [showRawWidgetsJson, setShowRawWidgetsJson] = useState(false);
    const [popupConfigJson, setPopupConfigJson] = useState('{"enabled":false}');

    useEffect(() => {
        if (!runtimeContext.isStorefrontBuilder) return;
        const normalizedLayout = normalizeLayoutSchema(activeSettings.layout || []);
        setBuilderLayout(normalizedLayout);
        const initialWidgets = normalizeEditorWidgetMap(activeSettings?.theme?.globalWidgets || {});
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

    const selectedBuilderSection = useMemo(
        () => builderLayout.find((section) => section.id === selectedBuilderSectionId) || null,
        [builderLayout, selectedBuilderSectionId],
    );

    const updateSelectedSectionBlocks = (nextBlocks) => {
        if (!selectedBuilderSectionId) return;

        const normalizedBlocks = normalizeEditorBlockTree(nextBlocks, { defaultType: 'text', idPrefix: 'block' });

        setBuilderLayout((prev) => prev.map((section) => {
            if (section.id !== selectedBuilderSectionId) return section;
            return {
                ...section,
                data: {
                    ...(section.data || {}),
                    blocks: normalizedBlocks,
                },
            };
        }));
    };

    const handleStorefrontBuilderSave = async () => {
        try {
            setIsBuilderSaving(true);
            const normalizedBuilderLayout = builderLayout.map((section) => ({
                ...section,
                data: {
                    ...(section.data || {}),
                    blocks: normalizeEditorBlockTree(section?.data?.blocks, { defaultType: 'text', idPrefix: 'block' }),
                },
            }));

            const normalizedLayout = normalizeLayoutSchema(normalizedBuilderLayout);
            const homeSections = deriveHomeSectionsFromLayout(
                normalizedLayout,
                activeSettings.homeSections || {},
            );

            let parsedGlobalWidgets = {};
            let parsedPopupConfig = { enabled: false };

            try {
                parsedGlobalWidgets = normalizeEditorWidgetMap(showRawWidgetsJson
                    ? JSON.parse(globalWidgetsJson || '{}')
                    : (globalWidgetsDraft || {}));
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
            createEditorBlock({
                type: 'button',
                idPrefix: 'button',
                props: {
                    text: 'New Button',
                },
            }),
        ]);
    };

    const handleQuickAddBlockType = (type) => {
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
            createEditorBlock({
                type,
                idPrefix: type,
            }),
        ]);
    };

    const handleWidgetDragStart = (event, type) => {
        event.dataTransfer.setData('application/x-widget-type', type);
        event.dataTransfer.effectAllowed = 'copy';
        setIsWidgetDragActive(true);
    };

    const handleWidgetDragEnd = () => {
        setIsWidgetDragActive(false);
    };

    const handleDropWidgetToSection = (event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/x-widget-type');
        setIsWidgetDragActive(false);
        if (!type) return;
        handleQuickAddBlockType(type);
    };

    const handleAddGlobalWidget = () => {
        const defaultId = `widget-${Date.now()}`;
        setGlobalWidgetsDraft((prev) => {
            const next = {
                ...(prev || {}),
                [defaultId]: {
                    ...createEditorBlock({
                        type: 'button',
                        idPrefix: 'widget',
                    }),
                    id: defaultId,
                    props: {
                        text: 'New Global Widget',
                        link: '/products',
                        className: 'btn btn-primary',
                    },
                },
            };
            const normalized = normalizeEditorWidgetMap(next);
            setGlobalWidgetsJson(JSON.stringify(normalized, null, 2));
            return normalized;
        });
    };

    const handleUpdateGlobalWidget = (widgetId, key, value) => {
        setGlobalWidgetsDraft((prev) => {
            const current = normalizeEditorWidgetMap(prev || {})?.[widgetId] || createEditorBlock({ type: 'text', idPrefix: 'widget' });
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
            const normalized = normalizeEditorWidgetMap(next);
            setGlobalWidgetsJson(JSON.stringify(normalized, null, 2));
            return normalized;
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
            const normalized = normalizeEditorWidgetMap(next);
            setGlobalWidgetsJson(JSON.stringify(normalized, null, 2));
            return normalized;
        });
    };

    const handleDeleteGlobalWidget = (widgetId) => {
        setGlobalWidgetsDraft((prev) => {
            const next = { ...(prev || {}) };
            delete next[widgetId];
            const normalized = normalizeEditorWidgetMap(next);
            setGlobalWidgetsJson(JSON.stringify(normalized, null, 2));
            return normalized;
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

    return {
        builderLayout,
        selectedBuilderSectionId,
        setSelectedBuilderSectionId,
        isBuilderSaving,
        pageDraft,
        setPageDraft,
        builderTab,
        setBuilderTab,
        isWidgetDragActive,
        setIsWidgetDragActive,
        globalWidgetsJson,
        setGlobalWidgetsJson,
        globalWidgetsDraft,
        setGlobalWidgetsDraft,
        showRawWidgetsJson,
        setShowRawWidgetsJson,
        popupConfigJson,
        setPopupConfigJson,
        selectedBuilderSection,
        updateSelectedSectionBlocks,
        handleStorefrontBuilderSave,
        handleQuickAddButton,
        handleQuickAddBlockType,
        handleWidgetDragStart,
        handleWidgetDragEnd,
        handleDropWidgetToSection,
        handleAddGlobalWidget,
        handleUpdateGlobalWidget,
        handleRenameGlobalWidgetId,
        handleDeleteGlobalWidget,
        handleCreatePageFromSection,
        handleResetStorefrontDefaults,
    };
}
