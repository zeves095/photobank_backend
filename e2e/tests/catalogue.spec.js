const { prepareDriver, cleanupDriver } = require('../utils/browser-automation');
const { expect } = require('chai');
const should = require('chai').should();
const { By, until, Key, elementIsVisible } = require('selenium-webdriver');

let c = require('../utils/constants.js');
let u = require('../utils/utils.js');

describe('Проверка навигации по каталогам', function () {
  this.timeout(0);
  let driver;
  before(async () => {
    driver = await prepareDriver();
  });
  after(() => cleanupDriver(driver));

  it('[вид: дерево] При клике по дереву каталога - подгружаются его подкаталоги', async function () {
    await u.login(driver);
    await u.w(driver);
    await u.waitForEl(driver,c.SELECTORS.upload.CATALOGUE_TREE_TREE_VIEW);
    const treeViewBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_VIEW));
    await treeViewBtn.click();
    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    await u.waitForEl(driver, c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE);
    let rootNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE));
    rootNode.click();
    try{
      const subNodes = await driver.findElements(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE+">"+c.SELECTORS.upload.CATALOGUE_TREE_TREE_CHILDREN));
      await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
      expect(subNodes).to.have.lengthOf.at.least(5);
    }catch(e){
      expect(false, e);
    }
  });

  it('[вид: дерево] При клике по дереву каталога - подгружаются товары в этом каталоге (непосредственные потомки)', async function () {
    let numOfItemsInNode = 0;
    let browseStep = 0;
    while(numOfItemsInNode < 1){
      await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
      await u.waitForEl(driver, c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE);
      let catNodes = await driver.findElements(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE));
      await catNodes[browseStep++].click();
      await u.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);
      await driver.findElements(By.css(c.SELECTORS.upload.ITEM_LIST_ITEM)).then((items)=>{numOfItemsInNode = items.length;});
    }
    let foundItems = await driver.findElements(By.css(c.SELECTORS.upload.ITEM_LIST_ITEM));
    expect(foundItems).to.have.lengthOf.at.least(1);
  });

  it('[вид: директории] При клике по дереву каталога - подгружаются его подкаталоги', async function () {
    const listViewBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_VIEW));
    await listViewBtn.click();
    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    try{
      const rootNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ROOT));
      await rootNode.click();
      await u.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);
    }catch(e){}
    const firstNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
    firstNode.click();
    await u.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);
    const subNodes = await driver.findElements(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
    expect(subNodes).to.have.lengthOf.at.least(1);
  });

  it('[вид: директории] При клике по дереву каталога - подгружаются товары в этом каталоге (непосредственные потомки)', async function () {
    const listViewBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_VIEW));
    await listViewBtn.click();
    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    try{
      const rootNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ROOT));
      await rootNode.click();
      await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    }catch(e){}
    let nodeCounter = 0;
    let itemsInNode = 0;
    try{
      while(itemsInNode<1){
        const curNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
        curNode.click();
        await u.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);
        await driver.findElements(By.css(c.SELECTORS.upload.ITEM_LIST_ITEM)).then((items=>{itemsInNode = items.length;}));
      }
    }catch(e){
      expect(false, e);
    }
    expect(itemsInNode).to.be.at.least(1);
  });

  it('[вид: директории] При клике по "../" - происходит переход к родителю', async function () {
    const listViewBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_VIEW));
    await listViewBtn.click();
    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    try{
      const rootNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ROOT));
      await rootNode.click();
      await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    }catch(e){}
    let firstNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
    let nodeCode = await firstNode.getAttribute('data-node');
    firstNode.click();
    await u.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);
    await u.waitForEl(driver, c.SELECTORS.upload.CATALOGUE_TREE_LIST_UP);
    const traverseUpBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_UP));
    traverseUpBtn.click();
    await u.w(driver);
    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    firstNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
    let newNodeCode = await firstNode.getAttribute('data-node');
    expect(nodeCode).to.equal(newNodeCode);
  });

});
