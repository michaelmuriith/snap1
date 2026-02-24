const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to register page...");
    await page.goto('http://localhost:8000/register');
    
    // Check for standard fields
    await page.waitForSelector('input[name="name"]');
    await page.waitForSelector('input[name="email"]');
    
    console.log("Selecting carrier role...");
    await page.selectOption('select[name="role"]', 'carrier');
    
    console.log("Checking if backpack vehicle type is selected by default...");
    // Wait for vehicle type to appear
    await page.waitForSelector('select[name="vehicle_type"]');
    const vehicleTypeVal = await page.$eval('select[name="vehicle_type"]', el => el.value);
    
    if (vehicleTypeVal !== 'backpack') {
       console.log("Warning: Backpack not default vehicle type. Value is: " + vehicleTypeVal);
    }
    
    console.log("Selecting bike vehicle type...");
    await page.selectOption('select[name="vehicle_type"]', 'bike');
    
    console.log("Checking for extended bike fields...");
    await page.waitForSelector('input[name="bike_reg_number"]');
    await page.waitForSelector('input[name="id_number"]');
    await page.waitForSelector('input[name="photo"]');
    
    console.log("All carrier fields rendered successfully!");
    
    // Take a screenshot
    await page.screenshot({ path: 'register_carrier_form.png', fullPage: true });
    
  } catch (e) {
    console.error("Test failed: ", e);
  } finally {
    await browser.close();
  }
})();
