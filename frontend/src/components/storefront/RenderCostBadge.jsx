'use client';

export default function RenderCostBadge({ level }) {
    const toneClass =
        level === 'high'
            ? 'bg-red-100 text-red-700'
            : level === 'medium'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700';

    return (
        <div className="pointer-events-none absolute right-2 top-2 z-20">
            <span className={`rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${toneClass}`}>
                Render Cost: {level}
            </span>
        </div>
    );
}
