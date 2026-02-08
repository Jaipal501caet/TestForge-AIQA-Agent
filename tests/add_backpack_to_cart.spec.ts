import { test, expect } from '@playwright/test';

test.describe('Sauce Demo Shopping Scenarios', () => {
    
    // Define the URL to avoid repetition in test steps
    const BASE_URL = 'https://www.saucedemo.com';

    // Use beforeEach to handle the prerequisite login step
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);

        // 1. Enter valid credentials
        await page.fill('#user-name', 'standard_user');
        await page.fill('#password', 'secret_sauce');

        // 2. Click login
        await page.click('#login-button');

        // 3. Assertion: Ensure navigation to the inventory page
        await expect(page).toHaveURL(/.*inventory.html/);
        await expect(page.getByText('Products')).toBeVisible();
    });

    test('Should successfully add Sauce Labs Backpack to the cart', async ({ page }) => {
        const itemName = 'Sauce Labs Backpack';
        
        // --- Action: Add item to cart ---
        
        // 1. Locate the specific item's add-to-cart button using its data-test attribute
        // data-test="add-to-cart-sauce-labs-backpack"
        await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');

        // --- Verification: Inventory Page State ---

        // 2. Assert that the button text changes to 'Remove'
        const removeButton = page.locator('button[data-test="remove-sauce-labs-backpack"]');
        await expect(removeButton).toBeVisible();
        await expect(removeButton).toHaveText('Remove');

        // 3. Assert that the shopping cart badge shows '1' item
        const shoppingCartBadge = page.locator('.shopping_cart_badge');
        await expect(shoppingCartBadge).toHaveText('1');
        
        // --- Action: Navigate to Cart ---
        
        // 4. Click the shopping cart icon
        await page.click('.shopping_cart_link');

        // --- Verification: Cart Page State ---
        
        // 5. Assertion: Ensure navigation to the cart page
        await expect(page).toHaveURL(/.*cart.html/);
        
        // 6. Assert that the specific item is listed in the cart
        const cartItemNameElement = page.locator('.inventory_item_name');
        await expect(cartItemNameElement).toHaveText(itemName);
        
        // 7. Assert that the quantity for the item is 1
        const cartItemQuantity = page.locator('.cart_quantity');
        await expect(cartItemQuantity).toHaveText('1');

        // 8. Final comprehensive assertion to verify the existence of the specific product in the cart list
        const backpackInCart = page.locator('.cart_list', { hasText: itemName });
        await expect(backpackInCart).toBeVisible();
    });
});