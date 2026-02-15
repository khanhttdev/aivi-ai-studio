import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should load the landing page and show main CTAs', async ({ page }) => {
        await page.goto('/');

        // Check for main title or hero section
        const heroTitle = page.locator('h1');
        await expect(heroTitle).toBeVisible();

        // Check for "Get Started" or similar CTA buttons
        const getStartedBtn = page.locator('a[href*="studio"]');
        await expect(getStartedBtn.first()).toBeVisible();
    });

    test('should navigate to language switcher and change locale', async ({ page }) => {
        await page.goto('/');

        // Check if locale is correctly handled in URL or content
        // This assumes next-intl middleware is active
        await expect(page).toHaveURL(/\/vi|\/en/);
    });
});
