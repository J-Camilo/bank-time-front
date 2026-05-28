import { test, expect } from '@playwright/test';

test.describe('Register page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('muestra los campos nombre, apellido, correo y contraseña', async ({ page }) => {
    await expect(page.getByPlaceholder(/ingrese su nombre/i)).toBeVisible();
    await expect(page.getByPlaceholder(/ingrese apellido/i)).toBeVisible();
    await expect(page.getByPlaceholder(/ingrese correo electrónico/i)).toBeVisible();
    await expect(page.getByPlaceholder(/ingrese su contraseña/i)).toBeVisible();
    await expect(page.getByPlaceholder(/confirme su contraseña/i)).toBeVisible();
  });

  test('muestra el campo de dirección', async ({ page }) => {
    await expect(page.getByPlaceholder(/ingrese su dirección/i)).toBeVisible();
  });

  test('muestra el selector de departamento', async ({ page }) => {
    await expect(page.getByText('Selecciona el departamento')).toBeVisible();
  });

  test('muestra el botón "Crear cuenta"', async ({ page }) => {
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible();
  });

  test('tiene un link para volver al login', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /ingresa aquí/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('muestra toast de error si se envía sin nombre', async ({ page }) => {
    // Enviamos el formulario completamente vacío — la primera validación
    // client-side es el nombre, así que debe mostrar ese mensaje
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    await expect(
      page.getByText(/el nombre es obligatorio/i)
        .or(page.locator('[class*="error"], [data-type="error"], [role="alert"]'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('muestra toast de error si las contraseñas no coinciden', async ({ page }) => {
    await page.fill('input[placeholder="Ingrese su nombre"]', 'Juan');
    await page.fill('input[placeholder="Ingrese apellido"]', 'Pérez');
    await page.fill('input[type="email"]', 'juan@test.com');

    // Departamento — hacemos click en el trigger del Select
    await page.getByText('Selecciona el departamento').click();
    await page.getByText('Antioquia').click();

    // Ciudad
    await page.getByText('Selecciona tu ciudad').click();
    await page.getByText('Medellín').click();

    await page.fill('input[placeholder="Ingrese su contraseña"]', 'pass123');
    await page.fill('input[placeholder="Confirme su contraseña"]', 'pass456');

    await page.getByRole('button', { name: /crear cuenta/i }).click();

    await expect(page.getByText(/las contraseñas no coinciden/i)).toBeVisible({ timeout: 5000 });
  });

  test('el campo ciudad se desbloquea al seleccionar departamento', async ({ page }) => {
    // Antes de elegir departamento
    await expect(page.getByText('Primero elige departamento')).toBeVisible();

    // Seleccionamos departamento
    await page.getByText('Selecciona el departamento').click();
    await page.getByText('Caldas').click();

    // Ahora el Select de ciudad cambia su placeholder
    await expect(page.getByText('Selecciona tu ciudad')).toBeVisible();
  });
});
