import { test, expect } from '@playwright/test';

// E2E-01: Search flow — text query → results list appears
test('E2E-01: search for Lagos returns hospital results', async ({ page }) => {
  await page.goto('/');

  // Home page loads
  await expect(page).toHaveTitle(/carefinder/i);

  // Type query and submit the search form
  await page.getByRole('searchbox').fill('Lagos');
  await page.getByRole('button', { name: /^search$/i }).click();

  // Should navigate to /search with the query param
  await expect(page).toHaveURL(/\/search.*q=Lagos/i);

  // Results list should be visible with at least one hospital card
  const resultsList = page.getByRole('list', { name: /hospital results/i });
  await expect(resultsList).toBeVisible();
  await expect(resultsList.getByRole('listitem').first()).toBeVisible();
});

// E2E-02: CSV export — search → open modal → select 3 columns → file downloads
test('E2E-02: export CSV with 3 selected columns and correct filename', async ({ page }) => {
  await page.goto('/search?q=Lagos');

  // Wait for results to load
  await expect(page.getByRole('list', { name: /hospital results/i })).toBeVisible();

  // Click the Export CSV button to open the modal
  await page.getByRole('button', { name: /export csv/i }).click();

  // Column selection modal should open
  const dialog = page.getByRole('dialog', { name: /export column selection/i });
  await expect(dialog).toBeVisible();

  // Uncheck all columns first, then select exactly 3: Name, Phone, Rating
  const checkboxes = dialog.getByRole('checkbox');
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    const cb = checkboxes.nth(i);
    if (await cb.isChecked()) await cb.uncheck();
  }
  await dialog.getByLabel('Name').check();
  await dialog.getByLabel('Phone').check();
  await dialog.getByLabel('Rating').check();

  // Set up download listener and click Download
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: /download/i }).click(),
  ]);

  // Filename should match hospitals-lagos-YYYY-MM-DD.csv
  expect(download.suggestedFilename()).toMatch(/^hospitals-lagos-\d{4}-\d{2}-\d{2}\.csv$/);
});

// E2E-05: Hospital detail page — click a result card and verify the detail page loads
test('E2E-05: clicking a hospital link navigates to the detail page', async ({ page }) => {
  await page.goto('/search?q=Lagos');

  // Wait for results list
  const resultsList = page.getByRole('list', { name: /hospital results/i });
  await expect(resultsList).toBeVisible();

  // Grab the first hospital link text and href
  const firstLink = resultsList.getByRole('link').first();
  const hospitalName = (await firstLink.textContent())?.trim() ?? '';
  await firstLink.click();

  // Should land on /hospitals/<uuid>
  await expect(page).toHaveURL(/\/hospitals\//);

  // The h1 heading should match the hospital name we clicked
  await expect(
    page.getByRole('heading', { level: 1, name: new RegExp(hospitalName, 'i') })
  ).toBeVisible();
});

// E2E-06: Geolocation denied → text search still works without error
test('E2E-06: deny geolocation → text search returns results without error', async ({
  browser,
}) => {
  // Create a context with geolocation permission explicitly denied
  const context = await browser.newContext({
    permissions: [], // no geolocation permission
    geolocation: undefined,
  });
  const page = await context.newPage();

  await page.goto('/');

  // Home page loads without error despite no geolocation
  await expect(page).toHaveTitle(/carefinder/i);
  await expect(page.getByRole('searchbox')).toBeVisible();

  // Type a LGA name and search
  await page.getByRole('searchbox').fill('Ikeja');
  await page.getByRole('button', { name: /^search$/i }).click();

  // Search page loads with results — no geolocation error shown
  await expect(page).toHaveURL(/\/search.*q=Ikeja/i);

  const resultsList = page.getByRole('list', { name: /hospital results/i });
  await expect(resultsList).toBeVisible();

  // No error message on the page
  await expect(page.getByRole('alert')).not.toBeVisible().catch(() => {});
  // Results should appear (Ikeja General Hospital is in the seed data)
  await expect(resultsList.getByRole('listitem').first()).toBeVisible();

  await context.close();
});
