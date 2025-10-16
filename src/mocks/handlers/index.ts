import { authHandlers } from './auth';
import { planesHandlers } from './planes';

export const handlers = [
  ...authHandlers,
  ...planesHandlers,
];
