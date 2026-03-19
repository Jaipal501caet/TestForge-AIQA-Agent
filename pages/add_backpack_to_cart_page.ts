import { Page, Locator } from '@playwright/test';

export class Add_backpack_to_cartPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly backpackAddToCartButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.backpackAddToCartButton = page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async navigate() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForURL('https://www.saucedemo.com/inventory.html');
  }

  async addBackpackToCart() {
    await this.backpackAddToCartButton.click();
  }

  async getCartCount(): Promise<string | null> {
    const badge = await this.cartBadge.textContent();
    return badge;
  }
}