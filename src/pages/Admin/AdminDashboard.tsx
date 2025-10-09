import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import type { Cliente, Plan, Suscripcion } from '../../types/models';
import { resumenKPI } from '../../selectors/membership';
import { userStorage } from '../../utils/storage';

export default function AdminDashboard() {
  const user = userStorage.get();

  const clientesQ = useQuery({ queryKey: ['clientes'], queryFn: async () => (await api.get<Cliente[]>('/clientes')).data });
  const planesQ = useQuery({ queryKey: ['planes'], queryFn: async () => (await api.get<Plan[]>('/planes')).data });
  const subsQ = useQuery({ queryKey: ['suscripciones'], queryFn: async () => (await api.get<Suscripcion[]>('/suscripciones')).data });

  if (clientesQ.isLoading || planesQ.isLoading || subsQ.isLoading) return <div style={{ padding:24 }}>Cargando...</div>;
  if (clientesQ.isError || planesQ.isError || subsQ.isError) return <div style={{ padding:24, color:'crimson' }}>Error al cargar datos</div>;

  const kpi = resumenKPI(clientesQ.data!, subsQ.data!);

  return (
    <div style={{ padding:24 }}>
      <h1>Panel del Administrador</h1>
      <p>Bienvenido <strong>{user?.email}</strong></p>

      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginTop:12 }}>
        <div style={{ border:'1px solid #eee', padding:16, borderRadius:12 }}>Clientes: {kpi.total}</div>
        <div style={{ border:'1px solid #eee', padding:16, borderRadius:12 }}>Planes: {planesQ.data?.length}</div>
        <div style={{ border:'1px solid #eee', padding:16, borderRadius:12 }}>Suscripciones: {subsQ.data?.length}</div>
        <div style={{ border:'1px solid #eee', padding:16, borderRadius:12 }}>Activos: {kpi.activas}</div>
        <div style={{ border:'1px solid #eee', padding:16, borderRadius:12 }}>Vencidas: {kpi.vencidas}</div>
      </div>
    </div>
  );
}
