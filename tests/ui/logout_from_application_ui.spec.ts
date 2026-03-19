import { test, expect } from '@playwright/test';
import { Logout_from_applicationPage } from '../../pages/logout_from_application_page';

test('logout from application', async ({ page }) => {
  const logoutPage = new Logout_from_applicationPage(page);

  // 1. Navigate to the application
  await logoutPage.navigate();

  // 2. Authentication: The context elements show username/password inputs (likely due to access restriction).
  // We must be logged in to access the logout functionality.
  await logoutPage.login("standard_user", "secret_sauce");

  // 3. User Goal: Logout from application
  await logoutPage.logout();

  // 4. Verification
  // After logout, SauceDemo redirects to the landing page.
  await expect(page).toHaveURL("https://www.saucedemo.com/");
  await expect(logoutPage.loginButton).toBeVisible();
});