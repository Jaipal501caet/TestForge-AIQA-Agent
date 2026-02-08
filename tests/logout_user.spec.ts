import { test, expect } from '@playwright/test';
import { SauceDemoPage } from '../pages/SauceDemoPage'; // CRITICAL ARCHITECTURE RULE 1

test('should successfully log out a standard user and return to the login page', async ({ page }) => {
    // CRITICAL ARCHITECTURE RULE 3
    const sauceDemoPage = new SauceDemoPage(page); 

    // 1. Setup: Navigate and Login
    await sauceDemoPage.goto();
    
    // CRITICAL ARCHITECTURE RULE 5: Use POM method, not raw locators
    // CRITICAL ARCHITECTURE RULE 4: Assume login method exists
    await sauceDemoPage.login('standard_user', 'secret_sauce');

    // Assertion Check 1: Ensure successful login (We are on the inventory page)
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    // 2. Action: Logout
    // CRITICAL ARCHITECTURE RULE 5: Use POM method, not raw locators
    // CRITICAL ARCHITECTURE RULE 4: Assume logout method exists
    await sauceDemoPage.logout();

    // 3. Verification: Check redirection back to the root login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // Secondary Verification: Ensure the login form elements are now visible
    // (Assuming assertLoginPageVisible is a verification method within the POM)
    //await sauceDemoPage.assertLoginPageVisible(); 
});
