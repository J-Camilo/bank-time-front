import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials, updateUser, logout } from '../store/slices/authSlice';

// ─── localStorage mock ───────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:    (k: string) => store[k] ?? null,
    setItem:    (k: string, v: string) => { store[k] = v; },
    clear:      () => { store = {}; },
    removeItem: (k: string) => { delete store[k]; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ─── Factory helpers ─────────────────────────────────────────────────────────

const makeUser = (overrides = {}) => ({
  id: 1,
  nombre: 'Juan',
  apellido: 'Pérez',
  correo: 'juan@test.com',
  es_admin: false,
  creditos_disponibles: 10,
  promedio_valoracion: 4.5,
  ...overrides,
});

const makeStore = () =>
  configureStore({ reducer: { auth: authReducer } });

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('authSlice', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  // ── setCredentials ──────────────────────────────────────────────────────────

  describe('setCredentials', () => {
    it('popula user, accessToken y refreshToken en el state', () => {
      const store = makeStore();
      const user = makeUser();

      store.dispatch(setCredentials({
        user,
        accessToken: 'access-abc',
        refreshToken: 'refresh-xyz',
      }));

      const state = store.getState().auth;
      expect(state.user).toEqual(user);
      expect(state.accessToken).toBe('access-abc');
      expect(state.refreshToken).toBe('refresh-xyz');
    });

    it('persiste user en localStorage', () => {
      const store = makeStore();
      const user = makeUser();

      store.dispatch(setCredentials({ user, accessToken: 'tok', refreshToken: 'ref' }));

      expect(JSON.parse(localStorageMock.getItem('user') as string)).toEqual(user);
    });

    it('persiste accessToken y refreshToken en localStorage', () => {
      const store = makeStore();

      store.dispatch(setCredentials({
        user: makeUser(),
        accessToken: 'my-access',
        refreshToken: 'my-refresh',
      }));

      expect(localStorageMock.getItem('accessToken')).toBe('my-access');
      expect(localStorageMock.getItem('refreshToken')).toBe('my-refresh');
    });

    it('sobrescribe credenciales anteriores', () => {
      const store = makeStore();

      store.dispatch(setCredentials({ user: makeUser({ nombre: 'Viejo' }), accessToken: 'old', refreshToken: 'old-r' }));
      store.dispatch(setCredentials({ user: makeUser({ nombre: 'Nuevo' }), accessToken: 'new', refreshToken: 'new-r' }));

      const state = store.getState().auth;
      expect(state.user?.nombre).toBe('Nuevo');
      expect(state.accessToken).toBe('new');
    });
  });

  // ── updateUser ──────────────────────────────────────────────────────────────

  describe('updateUser', () => {
    it('hace merge parcial del user sin perder campos existentes', () => {
      const store = makeStore();
      const user = makeUser();

      store.dispatch(setCredentials({ user, accessToken: 'tok', refreshToken: 'ref' }));
      store.dispatch(updateUser({ nombre: 'Carlos', creditos_disponibles: 20 }));

      const updated = store.getState().auth.user!;
      expect(updated.nombre).toBe('Carlos');
      expect(updated.creditos_disponibles).toBe(20);
      // campos no tocados se conservan
      expect(updated.apellido).toBe('Pérez');
      expect(updated.correo).toBe('juan@test.com');
    });

    it('actualiza localStorage tras el merge', () => {
      const store = makeStore();

      store.dispatch(setCredentials({ user: makeUser(), accessToken: 'tok', refreshToken: 'ref' }));
      store.dispatch(updateUser({ nombre: 'Modificado' }));

      const stored = JSON.parse(localStorageMock.getItem('user') as string);
      expect(stored.nombre).toBe('Modificado');
    });

    it('no hace nada si no hay user en el state', () => {
      const store = makeStore();
      // no dispatch de setCredentials previo
      store.dispatch(updateUser({ nombre: 'Ghost' }));

      expect(store.getState().auth.user).toBeNull();
    });
  });

  // ── logout ──────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('limpia user, accessToken y refreshToken del state', () => {
      const store = makeStore();

      store.dispatch(setCredentials({ user: makeUser(), accessToken: 'tok', refreshToken: 'ref' }));
      store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
    });

    it('limpia localStorage', () => {
      const store = makeStore();

      store.dispatch(setCredentials({ user: makeUser(), accessToken: 'tok', refreshToken: 'ref' }));
      store.dispatch(logout());

      expect(localStorageMock.getItem('user')).toBeNull();
      expect(localStorageMock.getItem('accessToken')).toBeNull();
      expect(localStorageMock.getItem('refreshToken')).toBeNull();
    });

    it('es idempotente — llamarlo dos veces no rompe nada', () => {
      const store = makeStore();

      store.dispatch(setCredentials({ user: makeUser(), accessToken: 'tok', refreshToken: 'ref' }));
      store.dispatch(logout());
      store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
    });
  });
});
