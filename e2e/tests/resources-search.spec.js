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

    it('Поиск по названию товара находит нужные ресурсы', async function () {
      await u.login(driver);
      await driver.get(c.SITE_URL+c.PAGE_LINKS);
      await u.w(driver);
      await u.waitForEl(driver, c.SELECTORS.notloading.LINK_LIST);
      const addLinkButton = await driver.findElement(By.css(c.SELECTORS.linkmanager.ADD_LINK_BTN));
      await addLinkButton.click();
      let itemNameInput = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_ITEM_NAME));
      itemNameInput.sendKeys(c.FORM_DATA.ITEM_NAME);
      let searchSubmitBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_SUBMIT));
      await searchSubmitBtn.click();
      await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_SEARCH_RESULTS);
      let searchResults = await driver.findElements(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_RESULT));
      let initLength = searchResults.length;
      let tbd = [];
      for(let i = 0; i<searchResults.length; i++){
        let inner = await searchResults[i].getAttribute('innerText');
        if(!inner.toLowerCase().includes(c.FORM_DATA.ITEM_NAME.toLowerCase())){tbd.push(i);}
      }
      tbd.reverse();
      for(let i = 0; i<tbd.length; i++){searchResults.splice(tbd[i], 1);}
      searchResults.should.have.lengthOf(initLength);
      await u.s(driver);
      itemNameInput.clear();
    });

    it('Поиск включает фильтрацию по разделу каталога и находит нужные товары', async function () {
      var {nodeWithResources, itemsWithResources} = await u.getVerifiedData(driver);
      await driver.get(c.SITE_URL+c.PAGE_LINKS);
      await u.s(driver);
      await u.waitForEl(driver, c.SELECTORS.notloading.LINK_LIST);
      const addLinkButton = await driver.findElement(By.css(c.SELECTORS.linkmanager.ADD_LINK_BTN));
      await addLinkButton.click();
      let nodeInput = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_NODE_NAME));
      nodeInput.sendKeys(nodeWithResources);
      let presetInput = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_PRESET_ID));
      presetInput.sendKeys(Key.BACK_SPACE);
      let typeInput = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_TYPE_ID));
      typeInput.sendKeys(Key.BACK_SPACE);
      let nestedInput = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_SEARCH_NESTED));
      nestedInput.click();
      const searchSubmitBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_SUBMIT));
      await searchSubmitBtn.click();
      await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_SEARCH_RESULTS);
      const searchResults = await driver.findElements(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_RESULT));
      await u.s(driver);
      let itemCodes = [];
      for(let i = 0; i<searchResults.length; i++){
        let itemTitle = await searchResults[i].getAttribute("innerText");
        let itemCode = itemTitle.split('(')[1].split(')')[0];
        if(itemCodes.indexOf(itemCode) == -1){
          itemCodes.push(itemCode);
        }
      }
      expect(itemCodes).to.have.lengthOf(itemsWithResources.length);
      await u.s(driver);
    });

    it('Поиск по коду 1с товара находит нужные ресурсы', async function () {
      var {itemsWithResources} = await u.getVerifiedData(driver);
      await driver.get(c.SITE_URL+c.PAGE_LINKS);
      await u.s(driver);
      await u.waitForEl(driver, c.SELECTORS.notloading.LINK_LIST);
      const addLinkButton = await driver.findElement(By.css(c.SELECTORS.linkmanager.ADD_LINK_BTN));
      await addLinkButton.click();
      let presetInput = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_PRESET_ID));
      presetInput.sendKeys(Key.BACK_SPACE);
      let typeInput = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_TYPE_ID));
      typeInput.sendKeys(Key.BACK_SPACE);
      let itemCodeInput = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_ITEM_CODE));
      itemCodeInput.sendKeys(itemsWithResources[0]);
      const searchSubmitBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_SUBMIT));
      await searchSubmitBtn.click();
      await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_SEARCH_RESULTS);
      const searchResults = await driver.findElements(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_RESULT));
      await u.s(driver);
      let resultsMatchCode = true;
      for(let i = 0; i<searchResults.length; i++){
        let itemTitle = await searchResults[i].getAttribute("innerText");
        let itemCode = itemTitle.split('(')[1].split(')')[0];
        if(itemCode !== itemsWithResources[0]){
          resultsMatchCode = false;
        }
      }
      expect(resultsMatchCode).to.be.true;
      await u.s(driver);
    });

    it('Поиск по ID ресурса находит нужный ресурс', async function () {
      await driver.get(c.SITE_URL+c.PAGE_LINKS);
      await u.waitForEl(driver, c.SELECTORS.notloading.LINK_LIST);
      await u.w(driver);
      const addLinkButton = await driver.findElement(By.css(c.SELECTORS.linkmanager.ADD_LINK_BTN));
      await addLinkButton.click();
      let itemNameInput = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_ITEM_NAME));
      itemNameInput.sendKeys(c.FORM_DATA.ITEM_NAME);
      let searchSubmitBtn = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_SUBMIT));
      await searchSubmitBtn.click();
      await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_SEARCH_RESULTS);
      let searchResults = await driver.findElements(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_RESULT));
      let resourceId = await searchResults[0].getAttribute('data-res');
      let resourceIdInput = await driver.findElement(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_RESOURCE_ID));
      resourceIdInput.sendKeys(resourceId);
      itemNameInput.sendKeys(Key.BACK_SPACE.repeat(50));
      await u.w(driver);
      searchSubmitBtn.click();
      await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_SEARCH_RESULTS);
      searchResults = await driver.findElements(By.css(c.SELECTORS.linkmanager.RESOURCE_SEARCH_RESULT));
      let newResourceId = await searchResults[0].getAttribute('data-res');
      expect(newResourceId).to.equal(resourceId);
      expect(searchResults).to.have.lengthOf(1);
      await u.s(driver);
      itemNameInput.clear();
    });

  });
