import { Page, Locator } from '@playwright/test';

export class Logout_from_applicationPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly burgerMenu: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator("input#user-name");
    this.passwordInput = page.locator("input#password");
    this.loginButton = page.locator("input#login-button");
    this.burgerMenu = page.locator("#react-burger-menu-btn");
    this.logoutLink = page.locator("#logout_sidebar_link");
  }

  async navigate() {
    await this.page.goto("https://www.saucedemo.com/inventory.html");
  }

  /**
   * Helper to login as context shows current state is on the login/error page.
   */
  async login(user: string = "standard_user", pass: string = "secret_sauce") {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }

  /**
   * Performs the logout flow by opening the sidebar and clicking logout.
   */
  async logout() {
    await this.burgerMenu.click();
    await this.logoutLink.click();
  }
}