import { useEffect, useState } from 'react';

export default function Carousel({
  slides,
  intervalMs = 5000,
}: {
  slides: { img: string; title?: string; caption?: string }[];
  intervalMs?: number;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  return (
    <div className="relative">
      <div className="relative h-64 md:h-80 overflow-hidden">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={s.img} alt={s.title ?? `slide-${i}`} className="h-full w-full object-cover" />
            {(s.title || s.caption) && (
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent text-white">
                {s.title && <div className="text-lg font-semibold">{s.title}</div>}
                {s.caption && <div className="text-sm">{s.caption}</div>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controles */}
      <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2">
        {slides.map((_s, i) => (
          <button
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${i === idx ? 'bg-white' : 'bg-white/60'}`}
            onClick={() => setIdx(i)}
            aria-label={`Ir al slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
