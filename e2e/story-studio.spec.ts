import { test, expect } from '@playwright/test';

test.describe('Story Studio Workflow', () => {
    test('should navigate through the creation flow', async ({ page }) => {
        // 1. Visit Story Studio (Step 1)
        await page.goto('/en/story-studio/step-1-spark');
        await expect(page).toHaveURL(/\/story-studio\/step-1-spark/);

        // Check if main elements are visible
        await expect(page.getByText('Story Spark')).toBeVisible();

        // 2. Simulate input (Topic)
        // Find textarea or input for topic
        const topicInput = page.getByPlaceholder(/topic/i);
        if (await topicInput.isVisible()) {
            await topicInput.fill('A funny cat adventure');
        }

        // 3. Navigation between steps (Step 1 -> Step 2)
        // This usually requires valid input and clicking "Next" or generating ideas
        // Since this requires API calls (expensive/mocked), we might just check route availability for now

        // Manual navigation check
        await page.goto('/en/story-studio/step-2-characters');
        await expect(page).toHaveURL(/\/story-studio\/step-2-characters/);

        await page.goto('/en/story-studio/step-3-plot');
        await expect(page).toHaveURL(/\/story-studio\/step-3-plot/);

        await page.goto('/en/story-studio/step-4-studio');
        await expect(page).toHaveURL(/\/story-studio\/step-4-studio/);
    });
});
