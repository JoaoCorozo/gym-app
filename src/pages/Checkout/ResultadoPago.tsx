import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { commitPayment, getPaymentStatus } from '../../services/payments';
import api from '../../api/axios';

type ViewState = 'checking' | 'authorized' | 'failed' | 'committed';

export default function ResultadoPago() {
  const [sp] = useSearchParams();
  const [state, setState] = useState<ViewState>('checking');
  const token = sp.get('token_ws') || sp.get('token') || '';
  const statusParam = sp.get('status') as 'authorized' | 'failed' | null;

  useEffect(() => {
    (async () => {
      if (!token) {
        setState('failed');
        return;
      }
      try {
        // El mock de /pagos/create te redirige con status=authorized por defecto
        if (statusParam) {
          await api.post('/pagos/simulate-authorize', { token, status: statusParam });
        }

        const st = await getPaymentStatus(token);
        if (st.status === 'failed') {
          setState('failed');
          return;
        }
        // Commit (confirmación final)
        const res = await commitPayment({ token });
        if (res.status === 'committed') {
          setState('committed');
        } else if (res.status === 'authorized') {
          setState('authorized');
        } else {
          setState('failed');
        }
      } catch {
        setState('failed');
      }
    })();
  }, [token, statusParam]);

  return (
    <div className="max-w-xl mx-auto text-center space-y-4">
      {state === 'checking' && (
        <>
          <h1 className="text-2xl font-bold">Verificando pago…</h1>
          <p className="text-neutral-600">Estamos confirmando tu transacción.</p>
        </>
      )}

      {state === 'committed' && (
        <>
          <h1 className="text-2xl font-bold text-emerald-700">¡Pago confirmado!</h1>
          <p className="text-neutral-700">Tu suscripción ha sido activada.</p>
          <div className="pt-4">
            <Link to="/planes" className="btn">Volver a planes</Link>
          </div>
        </>
      )}

      {state === 'authorized' && (
        <>
          <h1 className="text-2xl font-bold text-forge-700">Pago autorizado</h1>
          <p className="text-neutral-700">Estamos finalizando tu compra…</p>
        </>
      )}

      {state === 'failed' && (
        <>
          <h1 className="text-2xl font-bold text-rose-700">Pago rechazado</h1>
          <p className="text-neutral-700">No pudimos confirmar tu pago.</p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Link to="/planes" className="btn-ghost">Volver a planes</Link>
            <Link to="/" className="btn">Ir al inicio</Link>
          </div>
        </>
      )}
    </div>
  );
}
