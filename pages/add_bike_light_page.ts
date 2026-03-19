import { Page, Locator } from '@playwright/test';

export class add_bike_lightPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly bikeLightAddToCartButton: Locator; // Placeholder for future use

    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.locator('input#user-name');
        this.passwordInput = page.locator('input#password');
        this.loginButton = page.locator('input#login-button');
        // NOTE: The current VISION INTEL only provides login page elements.
        // Assuming after successful login, there would be an "Add to cart" button for a bike light.
        // This selector is a placeholder based on typical Sauce Demo element naming and would need actual VISION INTEL from the inventory page.
        this.bikeLightAddToCartButton = page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]');
    }

    async navigateTo(): Promise<void> {
        await this.page.goto('https://www.saucedemo.com');
    }

    async login(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        // NOTE: A successful login typically redirects to the inventory page.
        // We'll wait for the URL of the inventory page to confirm navigation.
        await this.page.waitForURL('https://www.saucedemo.com/inventory.html');
    }

    async addBikeLightToCart(): Promise<void> {
        // NOTE: This method requires elements from the inventory page, which are not
        // available in the current VISION INTEL. This is a simulated action based on the USER GOAL.
        // In a real scenario, this method would interact with the 'bikeLightAddToCartButton'
        // and potentially assert that the item was added (e.g., cart count increased).
        // Without actual VISION INTEL of the inventory page, this click might fail.
        await this.bikeLightAddToCartButton.click();
    }
}
