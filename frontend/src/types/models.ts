export interface Cliente {
  id: number;
  nombre: string;
  correo: string;
  telefono?: string;
  fechaInscripcion: string;
  estadoMembresia: 'activa' | 'vencida' | 'morosa';
  planId?: number;
}
export interface Plan {
  id: number;
  nombre: string;
  precio: number;
  vigenciaDias: number;
}
export interface Suscripcion {
  id: number;
  clienteId: number;
  planId: number;
  fechaInicio: string;       // ISO YYYY-MM-DD
  fechaVencimiento: string;  // ISO YYYY-MM-DD
}
