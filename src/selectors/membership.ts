import type { Cliente, Suscripcion } from '../types/models';
import { todayISO, daysBetween } from '../utils/date';

export type EstadoCalc = 'activa' | 'por_vencer' | 'vencida';

/** Convierte cualquier entrada posible en un arreglo de Suscripcion. */
function normalizeSubs(input: unknown): Suscripcion[] {
  if (Array.isArray(input)) return input;
  if (input && typeof input === 'object') {
    const anyObj = input as any;
    if (Array.isArray(anyObj.items)) return anyObj.items as Suscripcion[];
    if (Array.isArray(anyObj.data)) return anyObj.data as Suscripcion[];
  }
  return [];
}

export function estadoMembresiaDeCliente(
  clienteId: number,
  suscripcionesInput: unknown
): { estado: EstadoCalc; venceEnDias?: number; vencimiento?: string } {
  const suscripciones = normalizeSubs(suscripcionesInput);

  const hoy = todayISO();
  const sub = suscripciones
    .filter((s) => s.clienteId === clienteId)
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
    .pop();

  if (!sub) return { estado: 'vencida' };

  const venceEn = daysBetween(hoy, sub.fechaVencimiento);
  if (venceEn < 0)
    return { estado: 'vencida', venceEnDias: venceEn, vencimiento: sub.fechaVencimiento };
  if (venceEn <= 7)
    return { estado: 'por_vencer', venceEnDias: venceEn, vencimiento: sub.fechaVencimiento };
  return { estado: 'activa', venceEnDias: venceEn, vencimiento: sub.fechaVencimiento };
}

export function resumenKPI(clientesInput: unknown, suscripcionesInput: unknown) {
  const clientes = Array.isArray(clientesInput) ? (clientesInput as Cliente[]) : [];
  const suscripciones = normalizeSubs(suscripcionesInput);

  let activas = 0, porVencer = 0, vencidas = 0;
  for (const c of clientes) {
    const { estado } = estadoMembresiaDeCliente(c.id, suscripciones);
    if (estado === 'activa') activas++;
    else if (estado === 'por_vencer') porVencer++;
    else vencidas++;
  }
  return {
    total: clientes.length,
    activas,
    porVencer,
    vencidas,
    activosPct: clientes.length ? Math.round((activas / clientes.length) * 100) : 0,
  };
}
