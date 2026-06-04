/* 
   Playwright E2E Tests - Jobflow Copilot User Interactions
   Tests UI navigation flow, resume adaptation simulation, search filtering, and console execution.
*/

const { test, expect } = require('@playwright/test');

test.describe('Jobflow Copilot Dashboard E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Open local index.html before each test
        await page.goto(`file://${process.cwd()}/index.html`);
    });

    test('should load dashboard overview page with proper elements', async ({ page }) => {
        await expect(page.locator('#current-tab-title')).toHaveText('System Overview');
        await expect(page.locator('.brand h1')).toHaveText('Jobflow');
        await expect(page.locator('#stats-records')).toHaveText('4');
    });

    test('should switch active tabs when sidebar menu buttons are clicked', async ({ page }) => {
        // Switch to Resume Adaptor
        await page.click('#btn-tab-adaptor');
        await expect(page.locator('#current-tab-title')).toHaveText('Resume Skill Adaptor');
        await expect(page.locator('#input-skills')).toHaveValue('Python, SQL, HTML, CSS, Git, Machine Learning');

        // Switch to QA Test Suite
        await page.click('#btn-tab-qa');
        await expect(page.locator('#current-tab-title')).toHaveText('QA Automated Test Suite');
        await expect(page.locator('#qa-console-status')).toHaveText('IDLE');
    });

    test('should perform local skills adaptation matching when inputs are submitted', async ({ page }) => {
        await page.click('#btn-tab-adaptor');
        
        // Fill custom skills
        await page.fill('#input-skills', 'Python, HTML');
        await page.fill('#input-job-desc', 'Requirements: Python, SQL, Docker, and APIs.');
        await page.click('#btn-adapt-skills');

        // Check if skills block contains adapted skills
        const skillsBlock = page.locator('#resume-skills-block');
        await expect(skillsBlock).toContainText('Python');
        await expect(skillsBlock).toContainText('Docker');
        await expect(skillsBlock).toContainText('REST APIs');
        
        // Verify copy button is enabled
        await expect(page.locator('#btn-copy-skills')).toBeEnabled();
    });

    test('should execute automated in-browser QA test runner', async ({ page }) => {
        await page.click('#btn-tab-qa');
        
        // Click execute test runner
        await page.click('#btn-run-qa');
        
        // Check running state
        await expect(page.locator('#qa-console-status')).toHaveText('RUNNING');
        
        // Wait for tests to complete (depends on execution speeds, wait max 6000ms)
        await page.waitForSelector('#qa-console-status:has-text("PASSED")', { timeout: 6000 });
        
        // Verify success stats
        await expect(page.locator('#qa-passed-cases')).toHaveText('4');
        await expect(page.locator('#qa-failed-cases')).toHaveText('0');
        await expect(page.locator('#qa-pass-rate')).toHaveText('100%');
    });
});
