'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import useStorefrontBuilder from '@/components/storefront/useStorefrontBuilder';
import useEmbeddedPreviewBridge from '@/components/storefront/useEmbeddedPreviewBridge';
import useHomeSectionComposition from '@/components/storefront/useHomeSectionComposition';
import PopupBuilder from '@/components/storefront/PopupBuilder';
import useStorefrontRuntimeContext from '@/components/storefront/useStorefrontRuntimeContext';
import useStorefrontPermissions from '@/components/storefront/useStorefrontPermissions';
import useActiveStorefrontSettings from '@/components/storefront/useActiveStorefrontSettings';
import SectionRenderWrapper from '@/components/storefront/SectionRenderWrapper';

const StorefrontBuilderPanel = dynamic(
    () => import('@/components/storefront/StorefrontBuilderPanel'),
    { ssr: false },
);

export default function HomeSections({ initialSettings, initialProducts }) {
    const { settings: clientSettings, loading } = useSiteSettings();
    const { user, isAuthenticated } = useAuth();
    const activeSettings = useActiveStorefrontSettings({ loading, clientSettings, initialSettings });

    const runtimeContext = useStorefrontRuntimeContext();
    const { canEditStorefront, canPublishStorefront } = useStorefrontPermissions({
        isAuthenticated,
        role: user?.role,
    });

    const {
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
    } = useStorefrontBuilder({
        activeSettings,
        runtimeContext,
        canEditStorefront,
        canPublishStorefront,
    });

    const {
        effectiveSettings,
        renderOrder,
        renderSection,
        getSectionData,
    } = useHomeSectionComposition({
        activeSettings,
        runtimeContext,
        builderLayout,
        initialProducts,
    });

    useEmbeddedPreviewBridge();

    const sectionRenderItems = useMemo(
        () => renderOrder.map((section) => ({
            section,
            effectiveSectionData: getSectionData(section),
        })),
        [getSectionData, renderOrder],
    );

    const popupConfig = useMemo(
        () => effectiveSettings?.theme?.popupBuilder || { enabled: false },
        [effectiveSettings?.theme?.popupBuilder],
    );

    return (
        <>
            {sectionRenderItems.map(({ section, effectiveSectionData }) => (
                <SectionRenderWrapper
                    key={section.id}
                    section={section}
                    effectiveSectionData={effectiveSectionData}
                    effectiveSettings={effectiveSettings}
                    runtimeContext={runtimeContext}
                    renderSection={renderSection}
                />
            ))}

            <PopupBuilder popupConfig={popupConfig} />

            {runtimeContext.isStorefrontBuilder && (
                <StorefrontBuilderPanel
                    builderLayout={builderLayout}
                    selectedBuilderSectionId={selectedBuilderSectionId}
                    setSelectedBuilderSectionId={setSelectedBuilderSectionId}
                    builderTab={builderTab}
                    setBuilderTab={setBuilderTab}
                    handleStorefrontBuilderSave={handleStorefrontBuilderSave}
                    isBuilderSaving={isBuilderSaving}
                    canEditStorefront={canEditStorefront}
                    handleQuickAddButton={handleQuickAddButton}
                    handleResetStorefrontDefaults={handleResetStorefrontDefaults}
                    canPublishStorefront={canPublishStorefront}
                    selectedBuilderSection={selectedBuilderSection}
                    isWidgetDragActive={isWidgetDragActive}
                    setIsWidgetDragActive={setIsWidgetDragActive}
                    handleDropWidgetToSection={handleDropWidgetToSection}
                    updateSelectedSectionBlocks={updateSelectedSectionBlocks}
                    handleQuickAddBlockType={handleQuickAddBlockType}
                    handleWidgetDragStart={handleWidgetDragStart}
                    handleWidgetDragEnd={handleWidgetDragEnd}
                    pageDraft={pageDraft}
                    setPageDraft={setPageDraft}
                    handleCreatePageFromSection={handleCreatePageFromSection}
                    handleAddGlobalWidget={handleAddGlobalWidget}
                    showRawWidgetsJson={showRawWidgetsJson}
                    setShowRawWidgetsJson={setShowRawWidgetsJson}
                    globalWidgetsJson={globalWidgetsJson}
                    setGlobalWidgetsJson={setGlobalWidgetsJson}
                    globalWidgetsDraft={globalWidgetsDraft}
                    setGlobalWidgetsDraft={setGlobalWidgetsDraft}
                    handleRenameGlobalWidgetId={handleRenameGlobalWidgetId}
                    handleUpdateGlobalWidget={handleUpdateGlobalWidget}
                    handleDeleteGlobalWidget={handleDeleteGlobalWidget}
                    popupConfigJson={popupConfigJson}
                    setPopupConfigJson={setPopupConfigJson}
                />
            )}
        </>
    );
}
