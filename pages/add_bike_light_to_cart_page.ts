import { Page, expect } from '@playwright/test';

export class Add_bike_light_to_cartPage {
  readonly page: Page;
  readonly usernameInput;
  readonly passwordInput;
  readonly loginButton;
  readonly sauceLabsBikeLightAddToCartButton;
  readonly sauceLabsBikeLightRemoveButton;
  readonly shoppingCartLink;
  readonly cartItemSauceLabsBikeLight;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.sauceLabsBikeLightAddToCartButton = page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]'); // FIXED: Removed 'wrongidadded'
    this.sauceLabsBikeLightRemoveButton = page.locator('[data-test="remove-sauce-labs-bike-light"]');
    this.shoppingCartLink = page.locator('.shopping_cart_link');
    this.cartItemSauceLabsBikeLight = page.locator('.cart_item_label:has-text("Sauce Labs Bike Light")');
  }

  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await expect(this.page).toHaveURL('https://www.saucedemo.com/inventory.html');
  }

  async addBikeLightToCart() {
    await expect(this.sauceLabsBikeLightAddToCartButton).toBeVisible();
    await this.sauceLabsBikeLightAddToCartButton.click();
    // Verify it's added by checking the button text changed to 'Remove' or cart badge incremented
    await expect(this.sauceLabsBikeLightRemoveButton).toBeVisible();
  }

  async navigateToCart() {
    await this.shoppingCartLink.click();
    await expect(this.page).toHaveURL('https://www.saucedemo.com/cart.html');
  }

  async verifyBikeLightInCart() {
    await expect(this.cartItemSauceLabsBikeLight).toBeVisible();
  }
}
