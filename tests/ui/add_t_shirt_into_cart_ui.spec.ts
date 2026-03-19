import { test, expect } from '@playwright/test';
import { Add_t_shirt_into_cartPage } from '../../pages/add_t_shirt_into_cart_page';

test.describe('SauceDemo Cart Workflow', () => {
  test('add t shirt into cart', async ({ page }) => {
    const addTShirtPage = new Add_t_shirt_into_cartPage(page);

    // 1. Navigate to the login page
    await addTShirtPage.navigate();

    // 2. Perform login to reach products page
    await addTShirtPage.login();

    // 3. Add the T-shirt to the cart
    await addTShirtPage.addTShirtToCart();

    // 4. Assert that the cart has been updated
    await expect(addTShirtPage.cartBadge).toBeVisible();
    await expect(addTShirtPage.cartBadge).toHaveText('1');
  });
});