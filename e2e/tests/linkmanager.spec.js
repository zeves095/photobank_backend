const { prepareDriver, cleanupDriver } = require('../utils/browser-automation');
const { expect } = require('chai');
const should = require('chai').should();
const { By, until, Key, elementIsVisible } = require('selenium-webdriver');

let c = require('../utils/constants.js');
let u = require('../utils/utils.js');

describe('Проверка поисковой системы по ресурсам', function () {
    this.timeout(0); // set timelimit to infinity - otherwise you'll get 2000ms timeUp error.;
    let driver;
    before(async () => {
      driver = await prepareDriver();
    });
    after(() => cleanupDriver(driver));

    it('Создается ссылка', async function () {
      await u.login(driver);
      await driver.get(c.SITE_URL+c.PAGE_LINKS);
      await u.w(driver);
      await u.waitForEl(driver, c.SELECTORS.notloading.LINK_LIST);

      let numOfLinks = 4;

      let initialLinkCount = (await driver.findElements(By.css(c.SELECTORS.linkmanager.LINK_DONE))).length;

      const addLinkButton = await driver.findElement(By.css(c.SELECTORS.linkmanager.ADD_LINK_BTN));
      await addLinkButton.click();

      let searchSubmitBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_SUBMIT));
      await searchSubmitBtn.click();

      await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_SEARCH_RESULTS);
      let searchResults = await driver.findElements(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_RESULT));

      for(let i=0; i<numOfLinks; i++){
        await searchResults[i].click();
      }

      let submitBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.LINK_ADD_SUBMIT));
      await submitBtn.click();
      confirmBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.LINK_ADD_SUBMIT));
      await confirmBtn.click();

      let collapseBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.COLLAPSE_ADDER_BTN));
      await collapseBtn.click();

      await u.waitForEl(driver, c.SELECTORS.notloading.LINK_LIST);
      let newLinkCount = (await driver.findElements(By.css(c.SELECTORS.linkmanager.LINK_DONE))).length;

      expect(newLinkCount-initialLinkCount).to.equal(numOfLinks);
    });

  });
