import { useEffect, useMemo, useState } from 'react';
import { usePlanes } from './usePlanes';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../auth/AuthContext';
import PlanFormModal from './PlanFormModal';
import PricingTable from './PricingTable';
import BenefitsStrip from './BenefitsStrip';

type PlanLite = { id: number; nombre: string; precio: number; vigenciaDias: number };

/** Convierte cualquier forma común de respuesta a un arreglo. */
function asArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x as T[];
  if (x?.items && Array.isArray(x.items)) return x.items as T[];
  if (x?.data && Array.isArray(x.data)) return x.data as T[];
  return [];
}

export default function Planes() {
  const { data, isLoading, isError } = usePlanes();
  const { isAdmin } = useAuth();
  const [openNew, setOpenNew] = useState(false);

  // Normaliza la respuesta y toma hasta 3 planes para la comparativa
  const planes: PlanLite[] = useMemo(() => asArray<PlanLite>(data).slice(0, 3), [data]);
  const cols = planes.length;

  // Matriz de features (UI mock). Longitudes deben coincidir con planes.length
  const features = useMemo(() => {
    if (cols === 0) return {} as Record<string, boolean[]>;
    const yes = Array(cols).fill(true);

    const accesoMulticlub = planes.map((_p, i) => i !== cols - 1); // demo: último sin multiclub
    const evaluacion = yes;
    const programa = yes;
    const clubBeneficios = yes;
    const clases = planes.map((_p, i) => i !== cols - 1);
    const areas = yes;

    return {
      'Acceso Multiclub': accesoMulticlub,
      'Duración del plan': yes, // calculado en render por vigenciaDias
      'Forma de pago': yes,     // texto dinámico en render (anual vs mensual)
      'Evaluación composición corporal': evaluacion,
      'Programa de entrenamiento': programa,
      'Club de beneficios': clubBeneficios,
      'Clases grupales': clases,
      'Áreas gimnasio': areas,
    } as Record<string, boolean[]>;
  }, [cols, planes]);

  // Notas bajo el precio (opcional)
  const priceNotes = useMemo(() => {
    if (cols === 0) return [] as string[];
    return planes.map((p) =>
      p.vigenciaDias >= 365
        ? `Pago único anual de $${p.precio.toLocaleString('es-CL')}`
        : '2 meses adelantados'
    );
  }, [cols, planes]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isLoading) return <div className="p-6"><Spinner label="Cargando planes..." /></div>;
  if (isError) return <div className="p-6 text-rose-600">Error al cargar planes</div>;

  return (
    <div className="space-y-10">
      {/* Encabezado + acción admin */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Planes</h1>
        {isAdmin && <button className="btn" onClick={() => setOpenNew(true)}>Nuevo</button>}
      </div>

      {/* Tabla comparativa tipo SmartFit */}
      {cols > 0 ? (
        <PricingTable
          plans={planes}
          highlightIndex={1}
          features={features}
          priceNotes={priceNotes}
          ctaLabel="¡Únete al Club!"
          onCta={() => alert('Aquí puedes enlazar a tu flujo de registro/checkout')}
          title="Elige tu plan a medida en BodyForge"
          subtitle="Haz match con el plan que se adapta a tu forma de entrenar"
        />
      ) : (
        <div className="card p-6 text-neutral-600">No hay planes para mostrar.</div>
      )}

      {/* Tira de beneficios (cards con imagen) */}
      <BenefitsStrip
        items={[
          {
            title: 'Clases grupales',
            description:
              'Más de 15 tipos de clases grupales: cycling, HIIT, yoga, pilates, baile y más.',
            imageUrl:
              'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=1200&auto=format&fit=crop',
          },
          {
            title: 'Personal Trainer',
            description:
              'Entrena focalizado con un plan personalizado y alcanza tu mejor versión.',
            imageUrl:
              'https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=1200&auto=format&fit=crop',
          },
          {
            title: 'Nutrición',
            description:
              'Nutricionistas en todos los clubes. Entrenamiento + alimentación = resultados.',
            imageUrl:
              'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop',
          },
          {
            title: 'Convenios Empresas',
            description:
              'Bienestar corporativo para tu equipo: diagnóstico, entrenamiento y nutrición.',
            imageUrl:
              'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
          },
        ]}
        ctaLabel="Únete al club"
        onCtaLink="/clientes"
      />

      {/* Modal crear plan (solo admin) */}
      <PlanFormModal open={openNew} onClose={() => setOpenNew(false)} />
    </div>
  );
}
