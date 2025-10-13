import React, { useState } from 'react';

type PlanLite = {
  id: number;
  nombre: string;
  precio: number;        // precio total (por ejemplo anual)
  vigenciaDias: number;  // 30, 365, etc.
};

type FeatureMatrix = Record<string, boolean[]>;

function Dot({ on }: { on: boolean }) {
  return (
    <div
      className={`mx-auto h-3 w-3 rounded-full ${
        on ? 'bg-emerald-500' : 'bg-neutral-300'
      }`}
    />
  );
}

function cx(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

export default function PricingTable({
  plans,
  highlightIndex = 1,
  features,
  priceNotes,
  ctaLabel = '¡Únete al Club!',
  onCta,
  title = 'Elige tu plan a medida en BodyForge',
  subtitle = 'Haz match con el plan que se adapta a tu forma de entrenar',
}: {
  plans: PlanLite[];
  highlightIndex?: number;
  features: FeatureMatrix;
  priceNotes?: string[];
  ctaLabel?: string;
  onCta?: () => void;
  title?: string;
  subtitle?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const cols = plans.length;

  return (
    <section className="space-y-6">
      {/* Encabezado */}
      <header className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold">
          {title.replace('BodyForge', '')}
          <span className="text-forge-600"> BodyForge</span>
        </h2>
        <p className="text-[var(--muted)] mt-1">{subtitle}</p>
      </header>

      {/* Tabla comparativa */}
      <div className="relative overflow-hidden rounded-2xl shadow-soft bg-white">
        {/* Nombres de plan */}
        <div className="relative">
          <div
            className="grid transition-all duration-300"
            style={{
              gridTemplateColumns: `280px repeat(${cols}, minmax(200px,1fr))`,
            }}
          >
            <div className="py-5 px-6 bg-neutral-50" />
            {plans.map((p, i) => {
              const active =
                hovered === i || (hovered === null && i === highlightIndex);
              return (
                <div
                  key={p.id}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className={cx(
                    'py-5 px-3 text-center bg-neutral-50 relative cursor-pointer transition-transform duration-300',
                    active ? 'scale-[1.03] shadow-xl border-t-4 border-forge-500 z-10 bg-white' : ''
                  )}
                >
                  {i === highlightIndex && (
                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 text-[11px] font-semibold bg-forge-600 text-white rounded-full px-3 py-1 shadow">
                      Preferido por nuestros socios
                    </span>
                  )}
                  <div
                    className={cx(
                      'font-semibold transition-colors duration-200',
                      active ? 'text-forge-700' : 'text-neutral-800'
                    )}
                  >
                    {p.nombre}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filas de características */}
        <div className="divide-y">
          {Object.entries(features).map(([label, flags], rIdx) => (
            <div
              key={label}
              className={cx(
                'grid items-center text-sm',
                rIdx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'
              )}
              style={{
                gridTemplateColumns: `280px repeat(${cols}, minmax(200px,1fr))`,
              }}
            >
              <div className="py-4 px-6 font-medium text-neutral-700">
                {label}
              </div>
              {flags.map((on, i) => {
                const active =
                  hovered === i || (hovered === null && i === highlightIndex);
                return (
                  <div
                    key={i}
                    className={cx(
                      'py-4 px-3 transition-colors text-center duration-300',
                      active ? 'bg-forge-50/70' : ''
                    )}
                  >
                    {label.toLowerCase().includes('duración') ? (
                      <div className="font-medium text-neutral-800">
                        {plans[i]?.vigenciaDias === 365
                          ? '12 meses'
                          : plans[i]?.vigenciaDias === 30
                          ? 'Indefinida'
                          : `${Math.round(
                              (plans[i]?.vigenciaDias ?? 0) / 30
                            )} meses`}
                      </div>
                    ) : label.toLowerCase().includes('forma de pago') ? (
                      <div className="text-xs text-neutral-700 leading-5">
                        {plans[i]?.vigenciaDias >= 365 ? (
                          <>
                            Pago único anual anticipado.
                            <br />
                            Matrícula y activación gratis.
                          </>
                        ) : i === highlightIndex ? (
                          <>
                            Pagas 2 meses al inicio. Luego, cobro automático
                            mensual.
                            <br />
                            Matrícula y activación gratis.
                          </>
                        ) : (
                          <>
                            Pago único anual anticipado.
                            <br />
                            Matrícula y activación gratis.
                          </>
                        )}
                      </div>
                    ) : (
                      <Dot on={on} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Precios */}
        <div className="border-t">
          <div
            className="grid items-end"
            style={{
              gridTemplateColumns: `280px repeat(${cols}, minmax(200px,1fr))`,
            }}
          >
            <div className="py-6 px-6 text-sm font-semibold text-neutral-700">
              Precio
            </div>
            {plans.map((p, i) => {
              const mensual =
                p.vigenciaDias >= 365 ? Math.round(p.precio / 12) : p.precio;
              const active =
                hovered === i || (hovered === null && i === highlightIndex);
              return (
                <div
                  key={p.id}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className={cx(
                    'py-6 px-3 text-center transition-transform duration-300',
                    active ? 'scale-[1.05] text-forge-600' : ''
                  )}
                >
                  <div className="text-2xl md:text-3xl font-extrabold">
                    ${mensual.toLocaleString('es-CL')}/mes
                  </div>
                  <div className="text-[11px] text-neutral-600 mt-1">
                    {priceNotes?.[i] ??
                      (p.vigenciaDias >= 365
                        ? `Pago único anual de $${p.precio.toLocaleString('es-CL')}`
                        : '2 meses adelantados')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="border-t">
          <div className="py-6 text-center">
            <button
              className="btn rounded-full px-6 transition-transform hover:scale-105"
              onClick={onCta}
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
