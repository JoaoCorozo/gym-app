import { http, HttpResponse } from 'msw';

// ⚙️ pequeña función para crear tokens fake con exp 1 min
function makeJwt(role: 'admin' | 'user', expSeconds = 60) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: role === 'admin' ? '1' : '2',
      email: role === 'admin' ? 'admin@gym.com' : 'usuario@gym.com',
      roles: [role],
      exp: Math.floor(Date.now() / 1000) + expSeconds,
    })
  );
  const signature = 'fake-signature';
  return `${header}.${payload}.${signature}`;
}

export const handlers = [
  // 👉 login simulado
  http.post('/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as any;
    if (email === 'admin@gym.com' && password === 'admin123') {
      return HttpResponse.json({
        access_token: makeJwt('admin'),
        refresh_token: makeJwt('admin', 3600),
      });
    }
    if (email === 'usuario@gym.com' && password === 'user123') {
      return HttpResponse.json({
        access_token: makeJwt('user'),
        refresh_token: makeJwt('user', 3600),
      });
    }
    return new HttpResponse('Unauthorized', { status: 401 });
  }),

  // 👉 refresh simulado
  http.post('/auth/refresh', async ({ request }) => {
    const { refresh_token } = await request.json() as any;
    const role = refresh_token.includes('admin') ? 'admin' : 'user';
    return HttpResponse.json({
      access_token: makeJwt(role), // nuevo token corto
    });
  }),
];
