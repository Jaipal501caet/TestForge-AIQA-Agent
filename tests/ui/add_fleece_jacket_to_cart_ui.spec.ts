import { test, expect } from '@playwright/test';
import { Add_fleece_jacket_to_cartPage } from '../../pages/add_fleece_jacket_to_cart_page';

test('add fleece jacket to cart', async ({ page }) => {
  const addFleeceJacketToCartPage = new Add_fleece_jacket_to_cartPage(page);

  await addFleeceJacketToCartPage.navigate();
  await addFleeceJacketToCartPage.login();
  await addFleeceJacketToCartPage.addFleeceJacket();

  // Assert that the cart badge shows 1 item
  await expect(addFleeceJacketToCartPage.cartBadge).toHaveText('1');
});