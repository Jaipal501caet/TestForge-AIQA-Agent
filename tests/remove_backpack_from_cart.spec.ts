import { test, expect } from '@playwright/test';

test.describe('Shopping Cart Management', () => {
    
    test.beforeEach(async ({ page }) => {
        // 1. Login setup
        await page.goto('https://www.saucedemo.com');
        await page.fill('#user-name', 'standard_user');
        await page.fill('#password', 'secret_sauce');
        await page.click('#login-button');
        
        // 2. Add item to cart
        await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    });

    test('Remove backpack from cart', async ({ page }) => {
        const itemName = 'Sauce Labs Backpack';
        
        // Assert initial state: Cart icon shows 1
        const cartBadge = page.locator('.shopping_cart_badge');
        await expect(cartBadge).toHaveText('1');

        // Navigate to Cart
        await page.click('.shopping_cart_link');
        await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
        
        // Assert item is present in cart
        const cartItem = page.locator('.cart_item', { hasText: itemName });
        await expect(cartItem).toBeVisible();

        // 3. Remove the item
        const removeButton = cartItem.locator('[data-test^="remove-"]');
        await removeButton.click();

        // 4. Verification 1: Item is no longer visible on the cart page
        await expect(cartItem).not.toBeVisible();
        
        // 5. Verification 2: Cart badge is gone (or shows 0 if structure changed, but typically it disappears)
        // Wait for the badge to be detached from the DOM
        await expect(page.locator('.shopping_cart_badge')).not.toBeAttached();

        // 6. Verification 3 (Optional but robust): Navigate back to inventory and check button state
        await page.click('[data-test="continue-shopping"]');
        
        // Check if the backpack button reverted back to "Add to cart"
        const backpackButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
        await expect(backpackButton).toBeVisible();
        await expect(backpackButton).toHaveText('Add to cart');
    });
});