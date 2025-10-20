const TOKEN_KEY = 'access_token';
const USER_KEY  = 'auth_user';

export const tokenStorage = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (t: string) => sessionStorage.setItem(TOKEN_KEY, t),
  clear: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
};

export const userStorage = {
  get: (): AuthUser | null => {
    const s = sessionStorage.getItem(USER_KEY);
    return s ? JSON.parse(s) : null;
  },
  set: (u: AuthUser) => sessionStorage.setItem(USER_KEY, JSON.stringify(u))
};
