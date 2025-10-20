import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  type ClienteCreate,
  type ClienteUpdate,
} from './api';
import { notify } from '../../utils/toast';

export function useClientes() {
  return useQuery({ queryKey: ['clientes'], queryFn: fetchClientes });
}

export function useCreateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClienteCreate) => createCliente(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      notify.success('Cliente creado');
    },
    onError: () => notify.error('No se pudo crear el cliente'),
  });
}

export function useUpdateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClienteUpdate) => updateCliente(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      notify.success('Cambios guardados');
    },
    onError: () => notify.error('No se pudo actualizar el cliente'),
  });
}

export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCliente(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['clientes'] });
      const prev = qc.getQueryData<any>(['clientes']);
      qc.setQueryData<any>(['clientes'], (old: any[] = []) => old.filter((c) => c.id !== id));
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['clientes'], ctx.prev);
      notify.error('No se pudo eliminar');
    },
    onSuccess: () => notify.success('Cliente eliminado'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}
