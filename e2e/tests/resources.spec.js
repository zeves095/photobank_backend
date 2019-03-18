const { prepareDriver, cleanupDriver } = require('../utils/browser-automation');
const { expect } = require('chai');
const should = require('chai').should();
const { By, until, Key, elementIsVisible } = require('selenium-webdriver');

let c = require('../utils/constants.js');
let u = require('../utils/utils.js');

describe('Отображение ресурсов товара', function () {
    this.timeout(0); // set timelimit to infinity - otherwise you'll get 2000ms timeUp error.;
    let driver;
    before(async () => {
      driver = await prepareDriver();
    });
    after(() => cleanupDriver(driver));

    it('При клике на товар - отображаются ресурсы товара (если есть)', async function () {
      await driver.manage().deleteAllCookies();
      await driver.get(c.SITE_URL);
      const loginInput = await driver.findElement(By.css(c.SELECTORS.LOGIN));
      const passwordInput = await driver.findElement(By.css(c.SELECTORS.PASSWORD));
      await loginInput.sendKeys(c.USERS.ADMIN.LOGIN);
      await passwordInput.sendKeys(c.USERS.ADMIN.PASSWORD);
      await loginInput.submit();
      await u.w(driver);
      await u.waitForEl(driver,c.SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW);
      const searchViewBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW));
      await searchViewBtn.click();
      await u.waitForEl(driver,c.SELECTORS.notloading.ITEM_LIST);
      let searchSubmitBtn = await driver.findElement(By.css(c.SELECTORS.upload.ITEM_SEARCH_FORM+">"+c.SELECTORS.upload.ITEM_SEARCH_SUBMIT_BTN));
      await searchSubmitBtn.click();
      await u.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);
      let searchResults = await driver.findElements(By.css(c.SELECTORS.upload.ITEM_LIST_ITEM));
      let numOfResources = 0;
      let resourceCounter = 0;
      while(numOfResources<1){
        let item = searchResults[resourceCounter++];
        await item.click();
        await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_LIST);
        try{
          let itemResources = await driver.findElements(By.css(c.SELECTORS.upload.RESOURCE_LIST_ITEM));
          numOfResources = itemResources.length;
        }catch(e){}
        await driver.executeScript("arguments[0].scrollIntoView(true)", item);
        await driver.wait(until.elementIsVisible(item), 500, 'Could not locate the child element within the time specified');
      }
      expect(numOfResources).to.be.at.least(1);
      await u.s(driver);
    });
  });
