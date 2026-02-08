import { Page, Locator, expect } from '@playwright/test';

export class SauceDemoPage {
  readonly page: Page;
  readonly baseURL = 'https://www.saucedemo.com/';

  // Locators for login page elements
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  // Locator for an element on the inventory page (after successful login)
  readonly productsTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    // Using the ID from the provided selectors, as they are meaningful and robust.
    this.usernameInput = page.locator('input#user-name');
    this.passwordInput = page.locator('input#password');
    this.loginButton = page.locator('input#login-button');

    // Assuming 'span.title' is the common selector for the 'Products' title on the inventory page
    this.productsTitle = page.locator('span.title');
  }

  /**
   * Navigates to the Sauce Demo login page.
   */
  async goto(): Promise<void> {
    await this.page.goto(this.baseURL);
  }

  /**
   * Performs a login operation.
   * @param username The username to enter.
   * @param password The password to enter.
   */
  async login(username: string, password_val: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password_val);
    await this.loginButton.click();
  }

  /**
   * Asserts that the user has successfully logged in and is on the inventory page.
   */
  async assertLoginSuccess(): Promise<void> {
    await expect(this.productsTitle).toBeVisible();
    await expect(this.productsTitle).toHaveText('Products');
    await expect(this.page).toHaveURL(/.*inventory.html/); // Check for the inventory page URL
  }


  async logout(): Promise<void> {
    // Locator for the menu button (Hamburger icon)
    const menuButton = this.page.locator('#react-burger-menu-btn');
    // Locator for the logout link within the sidebar
    const logoutLink = this.page.locator('#logout_sidebar_link');

    // 1. Click the menu button to open the sidebar
    await menuButton.click();

    // 2. Click the Logout link
    await logoutLink.click();

    // 3. Assert successful logout by checking for the login button presence and URL change
    await expect(this.page).toHaveURL(this.baseURL);
    await expect(this.loginButton).toBeVisible();
  }
}
