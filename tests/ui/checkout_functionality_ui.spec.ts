import { test, expect } from '@playwright/test';
import { Checkout_functionalityPage } from '../../pages/checkout_functionality_page';

test('checkout functionality', async ({ page }) => {
  const checkoutPage = new Checkout_functionalityPage(page);

  // Step 1: Navigate and Login
  await checkoutPage.goto();
  await checkoutPage.login('standard_user', 'secret_sauce');

  // Step 2: Add item to cart and proceed to checkout
  // These selectors are standard for the saucedemo site as we progress past the login screen provided in the context
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('.shopping_cart_link').click();
  await page.locator('[data-test="checkout"]').click();

  // Step 3: Complete Checkout Information
  await page.locator('[data-test="firstName"]').fill('Quality');
  await page.locator('[data-test="lastName"]').fill('Engineer');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();

  // Step 4: Finalize the Order
  await page.locator('[data-test="finish"]').click();

  // Step 5: Verification
  const successHeader = page.locator('.complete-header');
  await expect(successHeader).toBeVisible();
  await expect(successHeader).toHaveText('Thank you for your order!');
});