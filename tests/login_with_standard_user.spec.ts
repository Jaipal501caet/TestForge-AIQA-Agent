import { test, expect } from '@playwright/test';
import { SauceDemoPage } from '../pages/SauceDemoPage'; 

test.describe('Sauce Demo Login Flow', () => {
  let sauceDemoPage: SauceDemoPage;

  test.beforeEach(async ({ page }) => {
    sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.goto();
  });

  test('should successfully login with standard_user credentials', async () => {
    await sauceDemoPage.login('standard_user', 'secret_sauce');
    await sauceDemoPage.assertLoginSuccess();
  });
});
