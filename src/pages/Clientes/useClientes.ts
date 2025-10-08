import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Cliente } from '../../types/models';

export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => (await api.get<Cliente[]>('/clientes')).data
  });
}
