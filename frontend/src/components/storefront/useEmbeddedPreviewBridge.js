import { useEffect } from 'react';

export default function useEmbeddedPreviewBridge() {
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
}
