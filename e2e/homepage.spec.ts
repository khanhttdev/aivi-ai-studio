import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Homepage', () => {
    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
        await page.goto('/');
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        expect(accessibilityScanResults.violations).toEqual([]);
    });
    test('should display the main hero section and CTA buttons', async ({ page }) => {
        await page.goto('/');

        // Check title
        await expect(page).toHaveTitle(/AIVI/);

        // Check main heading
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();

        // Check CTA buttons for tools
        const storyStudioBtn = page.getByRole('link', { name: /Story Studio/i });
        await expect(storyStudioBtn).toBeVisible();

        const kolStudioBtn = page.getByRole('link', { name: /KOL Studio/i });
        await expect(kolStudioBtn).toBeVisible();
    });

    test('should switch language', async ({ page }) => {
        await page.goto('/en');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');

        // Switch to Vietnamese (assuming language switcher exists in header)
        // This part depends on implementation, usually a button or dropdown
        // For now, let's just check direct navigation
        await page.goto('/vi');
        await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    });
});
