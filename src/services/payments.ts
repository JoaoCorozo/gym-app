import api from '../api/axios';

export type Order = {
  orderId: string;      // id local de orden
  planId: number;
  amount: number;
  buyerEmail: string;
  status: 'created' | 'authorized' | 'failed' | 'committed';
  token?: string;       // token del adquirente (webpay)
};

export async function createPaymentIntent(payload: {
  planId: number;
  amount: number;
  buyerEmail: string;
  returnUrl: string;  // a dónde retorna el PSP
}) {
  const { data } = await api.post('/pagos/create', payload);
  return data as { token: string; redirectUrl: string; orderId: string };
}

export async function commitPayment(payload: { token: string }) {
  const { data } = await api.post('/pagos/commit', payload);
  return data as { status: 'authorized' | 'failed' | 'committed'; orderId: string };
}

export async function getPaymentStatus(token: string) {
  const { data } = await api.get(`/pagos/status/${token}`);
  return data as { status: Order['status']; orderId: string; planId: number; amount: number; buyerEmail: string };
}
