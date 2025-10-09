import type { Cliente, Suscripcion } from '../types/models';
import { todayISO, daysBetween } from '../utils/date';

export type EstadoCalc = 'activa' | 'por_vencer' | 'vencida';

export function estadoMembresiaDeCliente(
  clienteId: number,
  suscripciones: Suscripcion[]
): { estado: EstadoCalc; venceEnDias?: number; vencimiento?: string } {
  const hoy = todayISO();

  // Buscamos la suscripción más reciente
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

export function resumenKPI(clientes: Cliente[], suscripciones: Suscripcion[]) {
  let activas = 0,
    porVencer = 0,
    vencidas = 0;
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
    activosPct: clientes.length
      ? Math.round((activas / clientes.length) * 100)
      : 0,
  };
}
