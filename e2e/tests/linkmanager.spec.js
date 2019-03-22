const { prepareDriver, cleanupDriver } = require('../utils/browser-automation');
const { expect } = require('chai');
const should = require('chai').should();
const { By, until, Key, elementIsVisible } = require('selenium-webdriver');

let c = require('../utils/constants.js');
let u = require('../utils/utils.js');

describe('Проверка системы внешних ссылок', function () {
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

      await u.waitForEl(driver, c.SELECTORS.linkmanager.ADD_LINK_BTN);
      const addLinkButton = await driver.findElement(By.css(c.SELECTORS.linkmanager.ADD_LINK_BTN));
      await addLinkButton.click();

      await u.waitForEl(driver, c.SELECTORS.linkmanager.RESOURCE_SEARCH_SUBMIT);
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

      await u.w(driver);
      await u.waitForEl(driver, c.SELECTORS.notloading.LINK_LIST);
      let newLinkCount = (await driver.findElements(By.css(c.SELECTORS.linkmanager.LINK_DONE))).length;

      expect(newLinkCount-initialLinkCount).to.equal(numOfLinks);
    });

    it('Удаляются ссылки', async function () {
      await u.login(driver);
      await driver.get(c.SITE_URL+c.PAGE_LINKS);
      await u.w(driver);
      await u.waitForEl(driver, c.SELECTORS.notloading.LINK_LIST);

      let links = await driver.findElements(By.css(c.SELECTORS.linkmanager.LINK_DONE));

      for(let i= 0; i<links.length; i++){
        let deleteBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.LINK_DELETE_BTN));
        await deleteBtn.click();
        let deleteConfirmBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.LINK_DELETE_BTN_CONFIRM));
        await deleteConfirmBtn.click();
        await u.w(driver);
        await u.waitForEl(driver, c.SELECTORS.notloading.LINK_LIST);
      }

      links = await driver.findElements(By.css(c.SELECTORS.linkmanager.LINK_DONE));

      expect(links).to.have.lengthOf(0);
    });

    it('Создается ссылка с заданным размером', async function () {
      await u.login(driver);
      await driver.get(c.SITE_URL+c.PAGE_LINKS);
      await u.w(driver);
      await u.waitForEl(driver, c.SELECTORS.notloading.LINK_LIST);

      let numOfLinks = 4;
      let customWidth = 100;
      let customHeight = 100;

      let initialLinkCount = (await driver.findElements(By.css(c.SELECTORS.linkmanager.LINK_DONE))).length;

      await u.waitForEl(driver, c.SELECTORS.linkmanager.ADD_LINK_BTN);
      const addLinkButton = await driver.findElement(By.css(c.SELECTORS.linkmanager.ADD_LINK_BTN));
      await addLinkButton.click();

      await u.waitForEl(driver, c.SELECTORS.linkmanager.RESOURCE_SEARCH_SUBMIT);
      let searchSubmitBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_SUBMIT));
      await searchSubmitBtn.click();

      await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_SEARCH_RESULTS);
      let searchResults = await driver.findElements(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_RESULT));

      for(let i=0; i<numOfLinks; i++){
        await searchResults[i].click();
      }

      await u.waitForEl(driver, c.SELECTORS.linkmanager.LINK_CUSTOM_SIZE_BTN);
      let customSizeBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.LINK_CUSTOM_SIZE_BTN));
      await customSizeBtn.click();
      let customSizeWidth = await driver.findElement(By.css(c.SELECTORS.linkmanager.LINK_CUSTOM_SIZE_WIDTH));
      await customSizeWidth.sendKeys(customWidth.toString());
      let customSizeHeight = await driver.findElement(By.css(c.SELECTORS.linkmanager.LINK_CUSTOM_SIZE_HEIGHT));
      await customSizeHeight.sendKeys(customHeight.toString());

      let submitBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.LINK_ADD_SUBMIT));
      await submitBtn.click();
      confirmBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.LINK_ADD_SUBMIT));
      await confirmBtn.click();

      let collapseBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.COLLAPSE_ADDER_BTN));
      await collapseBtn.click();

      await u.w(driver);
      await u.waitForEl(driver, c.SELECTORS.notloading.LINK_LIST);
      let newLinkCount = (await driver.findElements(By.css(c.SELECTORS.linkmanager.LINK_DONE))).length;

      expect(newLinkCount-initialLinkCount).to.equal(numOfLinks);
    });

  });
