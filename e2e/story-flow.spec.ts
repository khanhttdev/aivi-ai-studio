import { test, expect } from '@playwright/test';

test.describe('Story Studio Flow', () => {
    test('should navigate through story studio steps', async ({ page }) => {
        // Go to story studio
        await page.goto('/vi/story-studio');

        // Step 1: Spark (Topic input)
        await expect(page).toHaveURL(/\/story-studio\/step-1-spark/);

        // For a real E2E test, we would fill form and click next,
        // but without real AI connection/mocking, we test basic UI elements.
        const title = page.locator('h1, h2');
        await expect(title.first()).toBeVisible();
    });

    test('should show major studio tools in navigation', async ({ page }) => {
        await page.goto('/vi/story-studio');

        // Check if sidebar or navigation for tools exists
        const kolStudioLink = page.locator('a[href*="kol-studio"]');
        await expect(kolStudioLink).toBeVisible();
    });
});
