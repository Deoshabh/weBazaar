'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PopupBuilder({ popupConfig = {} }) {
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
