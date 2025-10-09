const ACCESS = 'access_token';
const REFRESH = 'refresh_token';

export const authStorage = {
  getAccess: () => sessionStorage.getItem(ACCESS),
  setAccess: (t: string) => sessionStorage.setItem(ACCESS, t),
  clearAccess: () => sessionStorage.removeItem(ACCESS),

  getRefresh: () => localStorage.getItem(REFRESH),
  setRefresh: (t: string) => localStorage.setItem(REFRESH, t),
  clearRefresh: () => localStorage.removeItem(REFRESH),

  clearAll: () => {
    sessionStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};
