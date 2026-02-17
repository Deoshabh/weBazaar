'use client';

import { useMemo } from 'react';

import {
    analyzeBlockPerformance,
    compileGlobalClassCss,
    compileScopedCss,
} from '@/utils/visualBuilder';
import { TrustBadgesSection } from '@/components/storefront/HomeSectionComponents';
import { renderDynamicBlocks } from '@/components/storefront/DynamicBlocksRenderer';
import RenderCostBadge from '@/components/storefront/RenderCostBadge';

export default function SectionRenderWrapper({
    section,
    effectiveSectionData,
    effectiveSettings,
    runtimeContext,
    renderSection,
}) {
    const scopeSelector = useMemo(() => `[data-section-id="${section.id}"]`, [section.id]);
    const compiledCss = useMemo(
        () => compileScopedCss(scopeSelector, effectiveSectionData.customCss || ''),
        [effectiveSectionData.customCss, scopeSelector],
    );
    const compiledGlobalClassCss = useMemo(
        () => compileGlobalClassCss(scopeSelector, effectiveSectionData.globalClassStyles),
        [effectiveSectionData.globalClassStyles, scopeSelector],
    );
    const renderCost = useMemo(
        () => analyzeBlockPerformance(effectiveSectionData.blocks),
        [effectiveSectionData.blocks],
    );
    const bindingContext = useMemo(
        () => ({
            settings: effectiveSettings,
            section: effectiveSectionData,
        }),
        [effectiveSectionData, effectiveSettings],
    );

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
                <RenderCostBadge level={renderCost.level} />
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
}
