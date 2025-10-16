import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

type Plan = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionDias: number;
};

const FALLBACK_PLANES: Plan[] = [
  { id: 1, nombre: 'Mensual',    descripcion: 'Entrena sin límites durante 30 días.', precio: 30000,  duracionDias: 30 },
  { id: 2, nombre: 'Trimestral', descripcion: 'Mantén tu ritmo por 3 meses completos.', precio: 80000,  duracionDias: 90 },
  { id: 3, nombre: 'Anual',      descripcion: 'Transforma tu cuerpo en un año entero de entrenamiento.', precio: 250000, duracionDias: 365 },
];

function asArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x;
  if (x?.items && Array.isArray(x.items)) return x.items;
  if (x?.data && Array.isArray(x.data)) return x.data;
  return [];
}
function looksLikeHTML(x: any) {
  return typeof x === 'string' && x.startsWith('<!doctype html');
}

export default function Planes() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['planes'],
    queryFn: async () => (await api.get('/planes')).data,
    retry: 1,
  });

  // normalización + fallback
  let planes: Plan[] = [];
  if (!isLoading && !isError) {
    if (looksLikeHTML(data)) {
      planes = FALLBACK_PLANES;
    } else {
      const arr = asArray<Plan>(data);
      planes = arr.length ? arr : FALLBACK_PLANES;
    }
  }

  if (isLoading) return <div className="p-6">Cargando planes…</div>;

  return (
    <section className="py-10 bg-forge-50">
      <div className="max-w-6xl mx-auto px-4 text-center mb-10">
        <h1 className="text-4xl font-extrabold text-forge-700 mb-2">Planes BodyForge</h1>
        <p className="text-neutral-700 max-w-2xl mx-auto">
          Escoge el plan que mejor se adapte a tu estilo de vida y entrena sin límites en nuestro gimnasio.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {planes.map((plan) => (
          <div
            key={plan.id}
            className="bg-white border border-neutral-200 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1"
          >
            <div className="p-8 flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-forge-700 mb-2">{plan.nombre}</h2>
              <p className="text-neutral-600 mb-6">{plan.descripcion}</p>
              <div className="text-5xl font-extrabold text-forge-600 mb-2">
                ${plan.precio.toLocaleString('es-CL')}
              </div>
              <div className="text-sm text-neutral-500 mb-6">
                {plan.duracionDias} días de acceso ilimitado
              </div>
              <button className="btn w-full py-3 font-semibold bg-forge-600 hover:bg-forge-700 text-white rounded-xl transition">
                Elegir plan
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12 text-neutral-600">
        <p>¿Tienes dudas? Visítanos en recepción o contáctanos para más información.</p>
      </div>
    </section>
  );
}
