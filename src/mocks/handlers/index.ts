import { authHandlers } from './auth';
import { planesHandlers } from './planes';
import { clasesHandlers } from './clases';

// 👇 Este array es el que realmente consume el worker
export const handlers = [
  ...authHandlers,
  ...planesHandlers,
  ...clasesHandlers,
];
