import { test, expect } from '@playwright/test';

test.describe('Rutas protegidas y navegación', () => {
  test('redirige a /login cuando no hay sesión y se accede a /inicio', async ({ page }) => {
    // Aseguramos que no haya datos en localStorage (sesión limpia)
    await page.goto('/inicio');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirige a /login cuando no hay sesión y se accede a /dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirige a /login cuando no hay sesión y se accede a /intercambios', async ({ page }) => {
    await page.goto('/intercambios');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirige a /login cuando no hay sesión y se accede a /historial', async ({ page }) => {
    await page.goto('/historial');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirige a /login cuando no hay sesión y se accede a /', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('la página de login tiene el link para ir a register', async ({ page }) => {
    await page.goto('/login');
    const link = page.getByRole('link', { name: /regístrate aquí/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('la página de register tiene el link para volver a login', async ({ page }) => {
    await page.goto('/register');
    const link = page.getByRole('link', { name: /ingresa aquí/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('una ruta inexistente redirige al root que a su vez va a /login', async ({ page }) => {
    await page.goto('/ruta-que-no-existe-abc123');
    // La ruta * → Navigate to="/" → AppLayout → no hay sesión → /login
    await expect(page).toHaveURL(/\/login/);
  });
});
