import { http, HttpResponse } from 'msw';

/**
 * Simulador muy simple estilo Webpay:
 * - /pagos/create → genera token y "redirección"
 * - /pagos/commit → confirma con el token devuelto (simulado)
 * - /pagos/status/:token → consulta estado
 * Con memoria + localStorage para persistir durante la sesión.
 */

type Order = {
  orderId: string;
  planId: number;
  amount: number;
  buyerEmail: string;
  status: 'created' | 'authorized' | 'failed' | 'committed';
  token: string;
};

const LS_KEY = 'mock_orders';

function load(): Order[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function save(orders: Order[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(orders));
  } catch {}
}

let orders: Order[] = load();

function newToken() {
  return 'tbk_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
function newOrderId() {
  return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 9999);
}

export const pagosHandlers = [
  http.post('/pagos/create', async ({ request }) => {
    const body = await request.json() as { planId: number; amount: number; buyerEmail: string; returnUrl: string };

    const token = newToken();
    const orderId = newOrderId();

    const record: Order = {
      orderId,
      planId: Number(body.planId),
      amount: Number(body.amount),
      buyerEmail: body.buyerEmail,
      status: 'created',
      token,
    };
    orders.push(record);
    save(orders);

    // En Webpay real te devuelve URL de formulario y luego POST con token_ws
    // Aquí simulamos que vas a /resultado-pago?token_ws=...&status=authorized
    const redirectUrl = `${location.origin}/resultado-pago?token_ws=${encodeURIComponent(token)}&status=authorized`;

    return HttpResponse.json({ token, redirectUrl, orderId }, { status: 201 });
  }),

  http.post('/pagos/commit', async ({ request }) => {
    const body = await request.json() as { token: string };
    const order = orders.find(o => o.token === body.token);
    if (!order) return HttpResponse.json({ message: 'Token inválido' }, { status: 404 });

    // En un PSP real, acá se valida y cambia a committed o failed según respuesta.
    if (order.status === 'authorized' || order.status === 'created') {
      order.status = 'committed';
      save(orders);
    }
    return HttpResponse.json({ status: order.status, orderId: order.orderId }, { status: 200 });
  }),

  http.get('/pagos/status/:token', ({ params }) => {
    const { token } = params as { token: string };
    const order = orders.find(o => o.token === token);
    if (!order) return HttpResponse.json({ message: 'No existe' }, { status: 404 });
    return HttpResponse.json({
      status: order.status,
      orderId: order.orderId,
      planId: order.planId,
      amount: order.amount,
      buyerEmail: order.buyerEmail,
    });
  }),

  // Simulamos que al “volver” desde el PSP nos marca como authorized o failed
  http.post('/pagos/simulate-authorize', async ({ request }) => {
    const body = await request.json() as { token: string; status: 'authorized' | 'failed' };
    const order = orders.find(o => o.token === body.token);
    if (!order) return HttpResponse.json({ message: 'Token inválido' }, { status: 404 });
    order.status = body.status;
    save(orders);
    return HttpResponse.json({ ok: true });
  }),
];
