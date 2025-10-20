import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { getJSON, setJSON } from '../../utils/persist';

type Cliente = {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
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

const LS_KEY = 'admin_clientes';
const LS_SEQ = 'admin_seq_clientes';

export default function Clientes() {
  const qc = useQueryClient();

  // Estado local + persistencia
  const [localClientes, setLocalClientes] = useState<Cliente[]>(
    getJSON<Cliente[]>(LS_KEY, [
      { id: 1, nombre: 'Juan Pérez', email: 'juan@gym.cl', telefono: '987654321' },
      { id: 2, nombre: 'María López', email: 'maria@gym.cl', telefono: '912345678' },
    ])
  );
  const [seq, setSeq] = useState<number>(getJSON<number>(LS_SEQ, Math.max(3, (localClientes.at(-1)?.id ?? 0) + 1)));

  // Carga remota (si existiera API)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => (await api.get('/clientes')).data,
    retry: 0,
  });

  const inMockMode = useMemo(() => isError || looksLikeHTML(data), [isError, data]);

  // Persistir cada cambio local
  useEffect(() => {
    if (inMockMode) {
      setJSON(LS_KEY, localClientes);
      setJSON(LS_SEQ, seq);
    }
  }, [inMockMode, localClientes, seq]);

  const crear = useMutation({
    mutationFn: async (payload: Omit<Cliente, 'id'>) => (await api.post('/clientes', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });

  const actualizar = useMutation({
    mutationFn: async (payload: Cliente) => (await api.put(`/clientes/${payload.id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });

  const eliminar = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/clientes/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });

  // UI state
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Cliente | null>(null);
  const [form, setForm] = useState<Omit<Cliente, 'id'>>({ nombre: '', email: '', telefono: '' });

  const onNew = () => {
    setEdit(null);
    setForm({ nombre: '', email: '', telefono: '' });
    setOpen(true);
  };

  const onEdit = (c: Cliente) => {
    setEdit(c);
    setForm({ nombre: c.nombre, email: c.email, telefono: c.telefono });
    setOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inMockMode) {
      if (edit) {
        setLocalClientes(arr => arr.map(c => c.id === edit.id ? { ...edit, ...form } : c));
      } else {
        setLocalClientes(arr => [...arr, { ...form, id: seq }]);
        setSeq(n => n + 1);
      }
      setOpen(false);
      return;
    }
    if (edit) await actualizar.mutateAsync({ ...edit, ...form });
    else await crear.mutateAsync(form);
    setOpen(false);
  };

  const onDelete = async (id: number) => {
    if (inMockMode) {
      setLocalClientes(arr => arr.filter(c => c.id !== id));
      return;
    }
    await eliminar.mutateAsync(id);
  };

  const clientes: Cliente[] = inMockMode ? localClientes : asArray<Cliente>(data);

  if (isLoading) return <div className="p-6">Cargando clientes…</div>;

  return (
    <div className="space-y-6">
      {inMockMode && (
        <div className="p-3 rounded-xl2 bg-amber-50 border border-amber-200 text-amber-800">
          Modo local con persistencia: datos guardados en este navegador.
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button className="btn" onClick={onNew}>Nuevo cliente</button>
      </div>

      <div className="overflow-x-auto rounded-xl2 border border-neutral-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">ID</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Teléfono</th>
              <th className="text-right px-4 py-3 font-semibold text-neutral-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-b last:border-b-0">
                <td className="px-4 py-3">{c.id}</td>
                <td className="px-4 py-3">{c.nombre}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.telefono}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="btn-ghost" onClick={() => onEdit(c)}>Editar</button>
                  <button
                    className="btn-outline text-rose-700 border-rose-300 hover:bg-rose-50"
                    onClick={() => onDelete(c.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">No hay clientes aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">{edit ? 'Editar cliente' : 'Nuevo cliente'}</h2>
            <form className="space-y-3" onSubmit={onSubmit}>
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <input className="input mt-1" value={form.nombre}
                  onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input type="email" className="input mt-1" value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono</label>
                <input className="input mt-1" value={form.telefono}
                  onChange={(e) => setForm(f => ({ ...f, telefono: e.target.value }))} />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
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
