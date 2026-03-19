import { Page, Locator } from '@playwright/test';

export class Add_t_shirt_into_cartPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly inventoryTshirtButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input#user-name');
    this.passwordInput = page.locator('input#password');
    this.loginButton = page.locator('input#login-button');
    // Using standard SauceDemo data-test attribute for the Bolt T-Shirt
    this.inventoryTshirtButton = page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async navigate() {
    await this.page.goto('https://www.saucedemo.com');
  }

  async login() {
    // Standard credentials for SauceDemo
    await this.usernameInput.fill('standard_user');
    await this.passwordInput.fill('secret_sauce');
    await this.loginButton.click();
  }

  async addTShirtToCart() {
    await this.inventoryTshirtButton.click();
  }
}