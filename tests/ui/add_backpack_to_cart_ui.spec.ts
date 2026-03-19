import { test, expect } from '@playwright/test';
import { Add_backpack_to_cartPage } from '../../pages/add_backpack_to_cart_page';

// Removed 'test.describe' to match the structure of your other files
test('should successfully add the backpack to the shopping cart', async ({ page }) => {
  const inventoryPage = new Add_backpack_to_cartPage(page);

  // 1. Navigate and Login (Moved from beforeEach to here)
  await inventoryPage.navigate();
  // Handle authentication if redirected to login based on context
  await inventoryPage.login('standard_user', 'secret_sauce');

  // 2. Action: Add backpack
  await inventoryPage.addBackpackToCart();

  // 3. Verification
  const cartCount = await inventoryPage.getCartCount();
  expect(cartCount).toBe('1');

  // Verify the button text changes to "Remove"
  await expect(inventoryPage.page.locator('button[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
});
