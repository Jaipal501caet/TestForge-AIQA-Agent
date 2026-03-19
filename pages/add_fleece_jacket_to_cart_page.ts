import { Page, Locator } from '@playwright/test';

export class Add_fleece_jacket_to_cartPage {
  readonly page: Page;
  readonly url: string = 'https://www.saucedemo.com/';
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly fleeceJacketAddToCartButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    // FIX: Corrected the data-test attribute for the fleece jacket add to cart button
    this.fleeceJacketAddToCartButton = page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async navigate() {
    await this.page.goto(this.url);
  }

  async login() {
    await this.usernameInput.fill('standard_user');
    await this.passwordInput.fill('secret_sauce');
    await this.loginButton.click();
  }

  async addFleeceJacket() {
    await this.fleeceJacketAddToCartButton.click();
  }
}
