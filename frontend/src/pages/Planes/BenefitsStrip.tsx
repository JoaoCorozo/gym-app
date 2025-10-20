import React from 'react';
import { Link } from 'react-router-dom';

type Benefit = {
  title: string;
  description: string;
  imageUrl?: string;
};

export default function BenefitsStrip({
  title = 'Para todos lo tenemos todo',
  highlight = 'tenemos todo',
  items,
  ctaLabel = 'Únete al club',
  onCtaLink = '/clientes',
}: {
  title?: string;
  highlight?: string;
  items: Benefit[];
  ctaLabel?: string;
  onCtaLink?: string;
}) {
  const renderTitle = () => {
    if (!highlight) return title;
    const idx = title.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx < 0) return title;
    const before = title.slice(0, idx);
    const match = title.slice(idx, idx + highlight.length);
    const after = title.slice(idx + highlight.length);
    return (
      <>
        {before}
        <span className="text-forge-600 font-extrabold"> {match}</span>
        {after}
      </>
    );
  };

  return (
    <section className="space-y-6">
      <header className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          {renderTitle()}
        </h2>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((b, i) => (
          <article
            key={i}
            className="
              group relative card overflow-hidden transition
              hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-forge-300
              focus-within:shadow-xl focus-within:-translate-y-1 focus-within:ring-2 focus-within:ring-forge-300
            "
          >
            {/* Media */}
            <div className="relative h-44 bg-neutral-200 overflow-hidden">
              {b.imageUrl ? (
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="
                    h-full w-full object-cover transition
                    duration-500 ease-out
                    group-hover:scale-105 group-focus-within:scale-105
                  "
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-forge-100 to-forge-200" />
              )}

              {/* Overlay degradado */}
              <div
                className="
                  pointer-events-none absolute inset-0
                  bg-gradient-to-t from-black/20 via-black/0 to-black/0
                  opacity-0 transition-opacity duration-300
                  group-hover:opacity-100 group-focus-within:opacity-100
                "
              />
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-neutral-700 leading-6">
                {b.description}
              </p>
            </div>

            {/* Indicador visual (píldora) */}
            <span
              className="
                absolute left-4 top-4 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold
                text-forge-700 ring-1 ring-forge-200 opacity-0 translate-y-1
                transition-all duration-300
                group-hover:opacity-100 group-hover:translate-y-0
                group-focus-within:opacity-100 group-focus-within:translate-y-0
              "
              aria-hidden
            >
              BodyForge
            </span>
          </article>
        ))}
      </div>

      <div className="text-center pt-2">
        <Link to={onCtaLink} className="btn rounded-full px-6 hover:scale-105 transition-transform">
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
