import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('muestra los campos email, password y el botón de submit', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('tiene el placeholder correcto en los campos del formulario', async ({ page }) => {
    await expect(page.getByPlaceholder(/correo electrónico/i)).toBeVisible();
    await expect(page.getByPlaceholder(/contraseña/i)).toBeVisible();
  });

  test('tiene un link para ir a la página de registro', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /regístrate aquí/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('muestra toast de error cuando se envía el formulario con credenciales inválidas', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalido@test.com');
    await page.fill('input[type="password"]', 'contrasenaMala123');

    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // El toast de error debe aparecer — no requiere backend real porque
    // el handler catch del authService.login renderiza el mensaje de error
    // Playwright espera hasta que aparezca o timeout
    await expect(
      page.locator('[class*="error"], [data-type="error"], [role="alert"]')
        .or(page.getByText(/credenciales incorrectas/i))
        .or(page.getByText(/error/i))
    ).toBeVisible({ timeout: 8000 });
  });

  test('el botón de submit se deshabilita mientras se está cargando', async ({ page }) => {
    // Interceptamos la petición para que tarde
    await page.route('**/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.abort();
    });

    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page.getByRole('button', { name: /cargando/i })).toBeDisabled();
  });

  test('redirige a /login cuando se accede a / sin sesión', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });
});
