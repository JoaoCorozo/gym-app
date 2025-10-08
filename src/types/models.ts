export interface Cliente {
  id: number;
  nombre: string;
  correo: string;
  telefono?: string;
  fechaInscripcion: string;
  estadoMembresia: 'activa' | 'vencida' | 'morosa';
  planId?: number;
}
