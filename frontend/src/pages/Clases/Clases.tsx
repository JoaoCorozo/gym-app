import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';

type Clase = {
  id: string;
  desde: string;
  hasta: string;
  entrenadores: string[];
  inscritos: { id: number; nombre: string }[];
  cupo: number;
};

function asArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x;
  if (x?.items && Array.isArray(x.items)) return x.items;
  if (x?.data && Array.isArray(x.data)) return x.data;
  return [];
}
function looksLikeHTML(x: any) {
  return typeof x === 'string' && x.startsWith('<!doctype html');
}

// Fallback local (08–10, 09–11, …, 21–23)
function generarFranjasLocal(): Clase[] {
  const base = new Date();
  const dia = base.toISOString().slice(0, 10);
  const franjas: Clase[] = [];
  for (let h = 8; h <= 21; h++) {
    const desdeH = String(h).padStart(2, '0');
    const hastaH = String(h + 2).padStart(2, '0'); // última 21–23
    const desde = `${desdeH}:00`;
    const hasta = `${hastaH}:00`;
    const id = `${dia}_${desdeH}-00-${hastaH}-00`;

    const entrenadores =
      (h % 3 === 0) ? ['Cata P.', 'Rodrigo M.']
      : (h % 3 === 1) ? ['Javiera L.']
      : ['Marcelo V.', 'Antonia R.'];

    franjas.push({ id, desde, hasta, entrenadores, inscritos: [], cupo: 20 });
  }
  return franjas;
}

export default function Clases() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['clases'],
    queryFn: async () => (await api.get('/clases')).data,
    retry: 1,
  });

  const inscribir = useMutation({
    mutationFn: async (id: string) => {
      const nombre = user?.email.split('@')[0] || 'Usuario';
      const userId = user?.id || 0;
      await api.post(`/clases/${id}/inscribir`, { userId, nombre });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clases'] }),
  });

  // Normalización + fallback
  let clases: Clase[] = [];
  if (!isLoading && !isError) {
    if (looksLikeHTML(data)) {
      clases = generarFranjasLocal();
    } else {
      const arr = asArray<Clase>(data);
      clases = arr.length ? arr : generarFranjasLocal();
    }
  }

  if (isLoading) return <div className="p-6">Cargando horarios…</div>;
  if (isError)   return (
    <div className="space-y-4">
      <div className="p-6 text-rose-700 bg-rose-50 border border-rose-200 rounded-xl2">
        No se pudo cargar desde la API. Mostrando horarios locales.
      </div>
      <ListadoClases clases={generarFranjasLocal()} inscribir={inscribir} />
    </div>
  );

  if (clases.length === 0) {
    return <div className="card p-6">No hay horarios publicados hoy.</div>;
  }

  return <ListadoClases clases={clases} inscribir={inscribir} />;
}

function ListadoClases({
  clases,
  inscribir,
}: {
  clases: Clase[];
  inscribir: ReturnType<typeof useMutation<any, any, string>>;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Clases y horarios de hoy</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {clases.map((c) => {
          const inscritos = c.inscritos ?? [];
          const lleno = inscritos.length >= c.cupo;
          return (
            <div key={c.id} className="card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{c.desde} – {c.hasta}</h2>
                <span className={`text-sm ${lleno ? 'text-rose-600' : 'text-forge-700'}`}>
                  {inscritos.length}/{c.cupo} cupos
                </span>
              </div>
              <div className="text-sm text-neutral-700">
                <span className="font-medium">Preparadores físicos:</span> {c.entrenadores.join(', ')}
              </div>
              {inscritos.length > 0 ? (
                <div className="text-sm text-neutral-700">
                  <span className="font-medium">Inscritos:</span>{' '}
                  {inscritos.map(i => i.nombre).join(', ')}
                </div>
              ) : (
                <div className="text-sm text-neutral-500">Sin inscritos aún.</div>
              )}
              <div className="pt-2">
                <button
                  className="btn"
                  disabled={lleno || inscribir.isPending}
                  onClick={() => inscribir.mutate(c.id)}
                >
                  {lleno ? 'Cupo lleno' : (inscribir.isPending ? 'Inscribiendo…' : 'Inscribirme')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
