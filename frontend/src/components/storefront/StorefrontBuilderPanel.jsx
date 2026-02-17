'use client';

import BlockTreeEditor from '@/components/admin/cms/BlockTreeEditor';
import {
    EDITOR_LAYOUT_TYPES,
    EDITOR_WIDGET_TYPES,
    GLOBAL_WIDGET_TYPES,
} from '@/components/editor/sharedEditorContract';

export default function StorefrontBuilderPanel({
    builderLayout,
    selectedBuilderSectionId,
    setSelectedBuilderSectionId,
    builderTab,
    setBuilderTab,
    handleStorefrontBuilderSave,
    isBuilderSaving,
    canEditStorefront,
    handleQuickAddButton,
    handleResetStorefrontDefaults,
    canPublishStorefront,
    selectedBuilderSection,
    isWidgetDragActive,
    setIsWidgetDragActive,
    handleDropWidgetToSection,
    updateSelectedSectionBlocks,
    handleQuickAddBlockType,
    handleWidgetDragStart,
    handleWidgetDragEnd,
    pageDraft,
    setPageDraft,
    handleCreatePageFromSection,
    handleAddGlobalWidget,
    showRawWidgetsJson,
    setShowRawWidgetsJson,
    globalWidgetsJson,
    setGlobalWidgetsJson,
    globalWidgetsDraft,
    setGlobalWidgetsDraft,
    handleRenameGlobalWidgetId,
    handleUpdateGlobalWidget,
    handleDeleteGlobalWidget,
    popupConfigJson,
    setPopupConfigJson,
}) {
    const widgetLibraryTypes = [...EDITOR_WIDGET_TYPES.filter((type) => type !== 'divider' && type !== 'spacer'), ...EDITOR_LAYOUT_TYPES.filter((type) => type !== 'column')];

    return (
        <div className="fixed top-4 right-4 w-[440px] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-2xl z-50 p-3 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Storefront Builder</h3>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Live Edit</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={() => setBuilderTab('structure')}
                    className={`text-xs px-2 py-1.5 rounded border ${builderTab === 'structure' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600'}`}
                >
                    Structure
                </button>
                <button
                    type="button"
                    onClick={() => setBuilderTab('widgets')}
                    className={`text-xs px-2 py-1.5 rounded border ${builderTab === 'widgets' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600'}`}
                >
                    Widgets
                </button>
                <button
                    type="button"
                    onClick={() => setBuilderTab('page')}
                    className={`text-xs px-2 py-1.5 rounded border ${builderTab === 'page' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600'}`}
                >
                    Page
                </button>
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
                    onClick={handleStorefrontBuilderSave}
                    className="btn btn-primary text-xs"
                    type="button"
                    disabled={isBuilderSaving || !canEditStorefront}
                >
                    {isBuilderSaving ? 'Saving...' : 'Save Theme'}
                </button>
                <button
                    onClick={handleQuickAddButton}
                    className="btn btn-secondary text-xs"
                    type="button"
                >
                    Quick Add Button
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

            {builderTab === 'structure' && selectedBuilderSection && (
                <div>
                    <div
                        className={`mb-2 rounded border-2 border-dashed px-3 py-2 text-xs transition-colors ${isWidgetDragActive ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-500 bg-gray-50'}`}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setIsWidgetDragActive(true);
                        }}
                        onDragLeave={() => setIsWidgetDragActive(false)}
                        onDrop={handleDropWidgetToSection}
                    >
                        {isWidgetDragActive
                            ? 'Drop widget here to add into selected section'
                            : 'Drag widget from Widgets tab and drop here'}
                    </div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Drag & Drop Components</p>
                    <BlockTreeEditor
                        value={selectedBuilderSection?.data?.blocks || []}
                        onChange={updateSelectedSectionBlocks}
                    />
                </div>
            )}

            {builderTab === 'widgets' && (
                <div className="rounded border border-gray-200 p-2 space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Widget Library</p>
                    <div className="grid grid-cols-2 gap-2">
                        {widgetLibraryTypes.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => handleQuickAddBlockType(type)}
                                draggable
                                onDragStart={(event) => handleWidgetDragStart(event, type)}
                                onDragEnd={handleWidgetDragEnd}
                                className="btn btn-secondary text-xs"
                                disabled={!canEditStorefront}
                            >
                                Add {type}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-500">Select a section first, then add widgets here like Elementor panel.</p>
                </div>
            )}

            {builderTab === 'page' && (
                <>
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
                                                {GLOBAL_WIDGET_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
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
                </>
            )}
        </div>
    );
}