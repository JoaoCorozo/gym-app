import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { getJSON, setJSON } from '../../utils/persist';

type Plan = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionDias: number;
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

const LS_KEY = 'admin_planes';
const LS_SEQ = 'admin_seq_planes';

export default function PlanesAdmin() {
  const qc = useQueryClient();

  const [localPlanes, setLocalPlanes] = useState<Plan[]>(
    getJSON<Plan[]>(LS_KEY, [
      { id: 1, nombre: 'Mensual',    descripcion: 'Acceso ilimitado 30 días',  precio: 30000,  duracionDias: 30 },
      { id: 2, nombre: 'Trimestral', descripcion: 'Acceso ilimitado 90 días',  precio: 80000,  duracionDias: 90 },
      { id: 3, nombre: 'Anual',      descripcion: 'Acceso ilimitado 365 días', precio: 250000, duracionDias: 365 },
    ])
  );
  const [seq, setSeq] = useState<number>(getJSON<number>(LS_SEQ, Math.max(4, (localPlanes.at(-1)?.id ?? 0) + 1)));

  const { data, isLoading, isError } = useQuery({
    queryKey: ['planes-admin'],
    queryFn: async () => (await api.get('/planes')).data,
    retry: 0,
  });

  const inMockMode = useMemo(() => isError || looksLikeHTML(data), [isError, data]);

  useEffect(() => {
    if (inMockMode) {
      setJSON(LS_KEY, localPlanes);
      setJSON(LS_SEQ, seq);
    }
  }, [inMockMode, localPlanes, seq]);

  const crear = useMutation({
    mutationFn: async (payload: Omit<Plan, 'id'>) => (await api.post('/planes', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planes-admin'] }),
  });

  const actualizar = useMutation({
    mutationFn: async (payload: Plan) => (await api.put(`/planes/${payload.id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planes-admin'] }),
  });

  const eliminar = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/planes/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planes-admin'] }),
  });

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Plan | null>(null);
  const [form, setForm] = useState<Omit<Plan, 'id'>>({
    nombre: '',
    descripcion: '',
    precio: 0,
    duracionDias: 30,
  });

  const onNew = () => {
    setEdit(null);
    setForm({ nombre: '', descripcion: '', precio: 0, duracionDias: 30 });
    setOpen(true);
  };

  const onEdit = (p: Plan) => {
    setEdit(p);
    setForm({ nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, duracionDias: p.duracionDias });
    setOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, precio: Number(form.precio), duracionDias: Number(form.duracionDias) };
    if (inMockMode) {
      if (edit) {
        setLocalPlanes(arr => arr.map(p => p.id === edit.id ? { ...edit, ...payload } : p));
      } else {
        setLocalPlanes(arr => [...arr, { ...payload, id: seq }]);
        setSeq(n => n + 1);
      }
      setOpen(false);
      return;
    }
    if (edit) await actualizar.mutateAsync({ ...edit, ...payload });
    else await crear.mutateAsync(payload);
    setOpen(false);
  };

  const onDelete = async (id: number) => {
    if (inMockMode) {
      setLocalPlanes(arr => arr.filter(p => p.id !== id));
      return;
    }
    await eliminar.mutateAsync(id);
  };

  const planes: Plan[] = inMockMode ? localPlanes : asArray<Plan>(data);

  if (isLoading) return <div className="p-6">Cargando planes…</div>;

  return (
    <div className="space-y-6">
      {inMockMode && (
        <div className="p-3 rounded-xl2 bg-amber-50 border border-amber-200 text-amber-800">
          Modo local con persistencia: datos guardados en este navegador.
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Planes (Administración)</h1>
        <button className="btn" onClick={onNew}>Nuevo plan</button>
      </div>

      <div className="overflow-x-auto rounded-xl2 border border-neutral-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">ID</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Descripción</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Precio</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Duración (días)</th>
              <th className="text-right px-4 py-3 font-semibold text-neutral-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {planes.map((p) => (
              <tr key={p.id} className="border-b last:border-b-0">
                <td className="px-4 py-3">{p.id}</td>
                <td className="px-4 py-3">{p.nombre}</td>
                <td className="px-4 py-3">{p.descripcion}</td>
                <td className="px-4 py-3">${p.precio.toLocaleString('es-CL')}</td>
                <td className="px-4 py-3">{p.duracionDias}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="btn-ghost" onClick={() => onEdit(p)}>Editar</button>
                  <button
                    className="btn-outline text-rose-700 border-rose-300 hover:bg-rose-50"
                    onClick={() => onDelete(p.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {planes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-neutral-500">No hay planes aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 flex items-center justify-center">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">{edit ? 'Editar plan' : 'Nuevo plan'}</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Nombre</label>
                <input className="input mt-1" value={form.nombre}
                  onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Descripción</label>
                <textarea className="input mt-1 h-24" value={form.descripcion}
                  onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Precio</label>
                <input type="number" className="input mt-1" value={form.precio}
                  onChange={(e) => setForm(f => ({ ...f, precio: Number(e.target.value) }))} required />
              </div>
              <div>
                <label className="text-sm font-medium">Duración (días)</label>
                <input type="number" className="input mt-1" value={form.duracionDias}
                  onChange={(e) => setForm(f => ({ ...f, duracionDias: Number(e.target.value) }))} required />
              </div>

              <div className="md:col-span-2 pt-3 flex items-center justify-end gap-2">
                <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
                <button className="btn" type="submit">{edit ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
