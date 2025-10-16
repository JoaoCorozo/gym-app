import { http, HttpResponse } from 'msw';

type User = {
  id: number;
  email: string;
  nombre: string;
  password: string;
  roles: string[];
};

let users: User[] = [
  { id: 1, email: 'admin@gym.com', nombre: 'Admin COM', password: 'admin123', roles: ['admin'] },
  { id: 2, email: 'user@gym.com',  nombre: 'Usuario COM', password: 'user123', roles: ['user'] },
  { id: 3, email: 'admin@gym.cl',  nombre: 'Admin CL',  password: 'admin123', roles: ['admin'] },
  { id: 4, email: 'user@gym.cl',   nombre: 'Usuario CL', password: 'user123', roles: ['user'] },
];

let seq = 5;

const makeJwt = (payload: any) =>
  ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', btoa(JSON.stringify(payload)), 'fake-sign'].join('.');

export const authHandlers = [
  // LOGIN
  http.post('/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    const u = users.find(
      (x) => x.email.toLowerCase() === body.email.toLowerCase() && x.password === body.password
    );
    if (!u) return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });

    const access_token = makeJwt({
      sub: String(u.id),
      email: u.email,
      roles: u.roles,
      exp: Date.now() / 1000 + 3600,
    });
    const refresh_token = makeJwt({
      sub: String(u.id),
      email: u.email,
      roles: u.roles,
      exp: Date.now() / 1000 + 3600 * 3,
    });

    // IMPORTANTE: devolvemos también el user
    return HttpResponse.json({
      access_token,
      refresh_token,
      user: { id: u.id, email: u.email, roles: u.roles },
    });
  }),

  // REGISTER (user por defecto)
  http.post('/auth/register', async ({ request }) => {
    const body = (await request.json()) as { nombre: string; email: string; password: string };
    const exists = users.some((x) => x.email.toLowerCase() === body.email.toLowerCase());
    if (exists) return HttpResponse.json({ message: 'Email ya está registrado' }, { status: 409 });

    const u: User = { id: seq++, email: body.email, nombre: body.nombre, password: body.password, roles: ['user'] };
    users.push(u);
    return HttpResponse.json({ ok: true, id: u.id }, { status: 201 });
  }),

  // ME (rehidratar sesión usando el token)
  http.get('/auth/me', async ({ request }) => {
    const auth = request.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    if (!token) return HttpResponse.json({ message: 'No token' }, { status: 401 });

    try {
      const payloadJson = atob(token.split('.')[1] || '');
      const payload = JSON.parse(payloadJson);
      const u = users.find((x) => String(x.id) === String(payload.sub));
      if (!u) return HttpResponse.json({ message: 'User not found' }, { status: 404 });
      return HttpResponse.json({ id: u.id, email: u.email, roles: u.roles });
    } catch {
      return HttpResponse.json({ message: 'Bad token' }, { status: 401 });
    }
  }),
];
