import { authHandlers } from './auth';
import { planesHandlers } from './planes';
import { clasesHandlers } from './clases';
import { adminHandlers } from './admin';
import { pagosHandlers } from './pagos';

export const handlers = [
  ...authHandlers,
  ...planesHandlers,
  ...clasesHandlers,
  ...adminHandlers,
  ...pagosHandlers, // 👈 pagos
];
