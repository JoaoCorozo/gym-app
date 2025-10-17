import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { createPaymentIntent } from '../../services/payments';
import { useAuth } from '../../auth/AuthContext';

type Plan = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionDias: number;
};

// Fallback si no carga /planes
const FALLBACK_PLANES: Plan[] = [
  { id: 1, nombre: 'Mensual',    descripcion: 'Acceso ilimitado 30 días',  precio: 30000,  duracionDias: 30 },
  { id: 2, nombre: 'Trimestral', descripcion: 'Acceso ilimitado 90 días',  precio: 80000,  duracionDias: 90 },
  { id: 3, nombre: 'Anual',      descripcion: 'Acceso ilimitado 365 días', precio: 250000, duracionDias: 365 },
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

export default function Pagar() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get('/planes');
        if (!active) return;
        if (looksLikeHTML(data)) {
          setPlanes(FALLBACK_PLANES);
        } else {
          const arr = asArray<Plan>(data);
          setPlanes(arr.length ? arr : FALLBACK_PLANES);
        }
      } catch {
        setPlanes(FALLBACK_PLANES);
      } finally {
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const plan = useMemo(
    () => planes.find(p => String(p.id) === String(planId)),
    [planes, planId]
  );

  const buyerEmail = user?.email || 'invitado@gym.cl';

  const onPay = async () => {
    if (!plan) return;
    // returnUrl: a dónde vuelve el “PSP”
    const returnUrl = `${location.origin}/resultado-pago`;
    try {
      const { token, redirectUrl } = await createPaymentIntent({
        planId: plan.id,
        amount: plan.precio,
        buyerEmail,
        returnUrl,
      });

      // En un PSP real, aquí harías POST auto-submit al formulario del PSP con token_ws
      // Nosotros simulamos la autorización y redirección:
      // La URL ya viene con ?token_ws=...&status=authorized (mock). Navegamos ahí:
      location.href = `${redirectUrl}&token_ws=${encodeURIComponent(token)}`;
    } catch (e) {
      alert('No fue posible iniciar el pago.');
    }
  };

  if (loading) return <div className="p-6">Cargando plan…</div>;
  if (!plan) return <div className="p-6">Plan no encontrado.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Pagar Plan</h1>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
          <div>
            <div className="text-xl font-semibold text-forge-700">{plan.nombre}</div>
            <div className="text-neutral-700 mt-2">{plan.descripcion}</div>
            <div className="text-sm text-neutral-500">{plan.duracionDias} días</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-forge-600">
              ${plan.precio.toLocaleString('es-CL')}
            </div>
            <div className="text-sm text-neutral-500">Impuestos incluidos</div>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Email del comprador</label>
            <input value={buyerEmail} className="input mt-1" readOnly />
          </div>
          <div>
            <label className="text-sm font-medium">Método</label>
            <input value="Webpay (simulado)" className="input mt-1" readOnly />
          </div>
        </div>

        <div className="pt-6 flex items-center justify-end gap-3">
          <button className="btn-ghost" onClick={() => navigate(-1)}>Cancelar</button>
          <button className="btn" onClick={onPay}>Pagar con Webpay</button>
        </div>
      </div>
    </div>
  );
}
