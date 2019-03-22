const { prepareDriver, cleanupDriver } = require('../utils/browser-automation');
const { expect } = require('chai');
const should = require('chai').should();
const { By, until, Key, elementIsVisible } = require('selenium-webdriver');

let c = require('../utils/constants.js');
let u = require('../utils/utils.js');

describe('Работа с ресурсами товара', function () {
    this.timeout(0); // set timelimit to infinity - otherwise you'll get 2000ms timeUp error.;
    let driver;
    before(async () => {
      driver = await prepareDriver();
    });
    after(() => cleanupDriver(driver));

    it('При клике на товар - отображаются ресурсы товара (если есть)', async function () {
      await u.login(driver);
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

    it('Изменяется тип файла', async function () {
      await u.login(driver);
      await u.w(driver);
      await u.waitForEl(driver,c.SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW);
      const searchViewBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW));
      await searchViewBtn.click();

      await u.waitForEl(driver,c.SELECTORS.notloading.ITEM_LIST);
      let searchSubmitBtn = await driver.findElement(By.css(c.SELECTORS.upload.ITEM_SEARCH_FORM+">"+c.SELECTORS.upload.ITEM_SEARCH_SUBMIT_BTN));
      await searchSubmitBtn.click();

      await u.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);
      let searchResults = await driver.findElements(By.css(c.SELECTORS.upload.ITEM_LIST_ITEM));

      let originals;
      let itemCounter = 0;
      let numOfOriginals = 0;
      do{
        let item = searchResults[itemCounter++];
        await item.click();

        await (await driver.findElement(By.css(c.SELECTORS.upload.RESOURCE_LIST_VIEW_TYPES.table))).click();

        await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_LIST);
        originals = await driver.findElements(By.xpath(c.SELECTORS_XPATH.ORIGINAL_FILE));
        numOfOriginals = originals.length;
      }while(numOfOriginals===0);

      let select = await originals[0].findElement(By.css(c.SELECTORS.upload.RESOURCE.TYPE_SELECT));
      let control = await originals[0].findElement(By.css(c.SELECTORS.upload.RESOURCE.ADDITIONAL_TYPE_OPTION));
      await control.click();

      await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_LIST);

      expect(await select.getAttribute('value')).to.equal('2');

      await u.s(driver);
    });

    it('Изменяется приоритет файла', async function () {
      await u.login(driver);
      await u.w(driver);
      await u.waitForEl(driver,c.SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW);
      const searchViewBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW));
      await searchViewBtn.click();

      await u.waitForEl(driver,c.SELECTORS.notloading.ITEM_LIST);
      let searchSubmitBtn = await driver.findElement(By.css(c.SELECTORS.upload.ITEM_SEARCH_FORM+">"+c.SELECTORS.upload.ITEM_SEARCH_SUBMIT_BTN));
      await searchSubmitBtn.click();

      await u.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);
      let searchResults = await driver.findElements(By.css(c.SELECTORS.upload.ITEM_LIST_ITEM));

      let originals;
      let itemCounter = 0;
      let numOfOriginals = 0;
      do{
        let item = searchResults[itemCounter++];
        await item.click();

        await (await driver.findElement(By.css(c.SELECTORS.upload.RESOURCE_LIST_VIEW_TYPES.table))).click();

        await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_LIST);
        additional = await driver.findElements(By.xpath(c.SELECTORS_XPATH.ADDITIONAL_FILE));
        numOfAdditional = additional.length;
      }while(numOfAdditional===0);

      let priorityBtn = await additional[0].findElement(By.css(c.SELECTORS.upload.RESOURCE.PRIORITY_BTN));
      let priorityVal = parseInt(await priorityBtn.getText(), 10);
      await driver.actions({bridge: true}).move({origin:priorityBtn}).perform();
      await priorityBtn.click();
      await u.w(driver);

      let priorityOpt = await additional[0].findElement(By.css('div[data-priority="'+(priorityVal+1)+'"]'));
      await priorityOpt.click();
      await u.w(driver);
      await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_LIST);

      expect(parseInt(await priorityBtn.getText(),10)).to.equal(priorityVal+1);

      await u.s(driver);
    });

    it('Генерируются пресеты', async function () {
      await u.login(driver);
      await u.w(driver);
      await u.waitForEl(driver,c.SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW);
      const searchViewBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW));
      await searchViewBtn.click();

      await u.waitForEl(driver,c.SELECTORS.notloading.ITEM_LIST);
      let searchSubmitBtn = await driver.findElement(By.css(c.SELECTORS.upload.ITEM_SEARCH_FORM+">"+c.SELECTORS.upload.ITEM_SEARCH_SUBMIT_BTN));
      await searchSubmitBtn.click();

      await u.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);
      let searchResults = await driver.findElements(By.css(c.SELECTORS.upload.ITEM_LIST_ITEM));

      let originals;
      let resources;
      let numOfResources = 0;
      let itemCounter = 0;
      let numOfOriginals = 0;
      do{
        let item = searchResults[itemCounter++];
        await item.click();
        await (await driver.findElement(By.css(c.SELECTORS.upload.RESOURCE_LIST_VIEW_TYPES.table))).click();

        await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_LIST);

        resources = await driver.findElements(By.css(c.SELECTORS.upload.RESOURCE_LIST_ITEM));
        main = await driver.findElements(By.xpath(c.SELECTORS_XPATH.MAIN_FILE));
        numOfMain = main.length;
        numOfResources = resources.length;
      }while(numOfMain>0||numOfResources===0);
      let select = await resources[0].findElement(By.css(c.SELECTORS.upload.RESOURCE.TYPE_SELECT));
      let control = await resources[0].findElement(By.css(c.SELECTORS.upload.RESOURCE.MAIN_TYPE_OPTION));
      await control.click();

      await u.lw(driver);

      let refreshBtn = driver.findElement(By.css(c.SELECTORS.upload.RESOURCE.UPDATE_RESOURCES_BTN));
      await refreshBtn.click();
      await u.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_LIST);

      let presets = await resources[0].findElements(By.css(c.SELECTORS.upload.RESOURCE.PRESET));
      expect(presets).to.have.lengthOf(3);
      await u.s(driver);
    });

});
