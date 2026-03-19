import { test, expect } from '@playwright/test';

test('login functionality', async ({ request }) => {
  console.log("🚀 Attempting Login via DummyJSON API...");

  const response = await request.post('https://dummyjson.com/auth/login', {
    headers: { 'Content-Type': 'application/json' },
    data: {
      "username": "emilys",
      "password": "emilyspass",
    }
  });

  if (!response.ok()) {
    console.log(`❌ Failed: ${response.status()}`);
    console.log(await response.text());
  }

  expect(response.status()).toBe(200);
  
  const body = await response.json();
  
  // ✅ FIX: The API calls it 'accessToken', not 'token'
  console.log('✅ Login Successful!');
  console.log('   👤 User:', body.firstName, body.lastName);
  console.log('   🔑 Token:', body.accessToken); 
  
  expect(body).toHaveProperty('accessToken'); // Updated assertion
  expect(body.username).toBe('emilys');
});
