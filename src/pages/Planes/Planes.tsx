import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

type Plan = { id: number; nombre: string; descripcion: string; precio: number; duracionDias: number };

function asArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x as T[];
  if (x?.items && Array.isArray(x.items)) return x.items as T[];
  if (x?.data && Array.isArray(x.data)) return x.data as T[];
  return [];
}

export default function Planes() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['planes'],
    queryFn: async () => (await api.get('/planes')).data,
  });

  const planes = asArray<Plan>(data);

  if (isLoading) return <div className="p-6">Cargando planes…</div>;
  if (isError) return <div className="p-6 text-rose-600">Error al cargar planes.</div>;
  if (planes.length === 0) return <div className="card p-6">No hay planes disponibles.</div>;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {planes.map((p) => (
        <div key={p.id} className="card p-6 bg-white border border-neutral-200 shadow-sm">
          <h2 className="text-xl font-semibold text-forge-700">{p.nombre}</h2>
          <p className="text-neutral-700 mt-2">{p.descripcion}</p>
          <p className="text-2xl font-bold text-forge-800 mt-4">${p.precio.toLocaleString('es-CL')}</p>
          <p className="text-sm text-neutral-500">{p.duracionDias} días</p>
        </div>
      ))}
    </div>
  );
}
