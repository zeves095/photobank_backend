const { prepareDriver, cleanupDriver } = require('../utils/browser-automation');
const { expect } = require('chai');
const should = require('chai').should();
const { By, until, Key, elementIsVisible, Button } = require('selenium-webdriver');

let c = require('../utils/constants.js');
let u = require('../utils/utils.js');

describe('Проверка работы со свалкой', function () {
  this.timeout(0);
  let driver;
  before(async () => {
    driver = await prepareDriver();
  });
  after(() => cleanupDriver(driver));

  it('Создается новый раздел', async function () {
    await u.login(driver);
    await u.w(driver);
    await u.waitForEl(driver,c.SELECTORS.upload.GARBAGE_SWITCH);
    const garbageCollectionBtn = await driver.findElement(By.css(c.SELECTORS.upload.GARBAGE_SWITCH));
    await garbageCollectionBtn.click();
    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    await u.waitForEl(driver, c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE_ANCHOR);
    let rootNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE_ANCHOR));
    rootNode.click();

    let nodeName = 'testnodecreate';

    let addInput = await driver.findElement(By.css(c.SELECTORS.upload.NODE_CRUD.ADD_INPUT));
    await addInput.sendKeys(nodeName);
    let submitBtn = await driver.findElement(By.css(c.SELECTORS.upload.NODE_CRUD.SUBMIT));
    await submitBtn.click();

    await u.w(driver);

    let listViewBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_VIEW));
    await listViewBtn.click();
    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    let nodeList = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST));
    let newNode = await nodeList.findElements(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
    let found = false;
    for(let i= 0; i<newNode.length; i++){
      if(await newNode[i].getText() === nodeName){
        found = true;
      }
    }
    expect(found).to.be.true;
  });

  it('Раздел переименовывается', async function () {
    await u.login(driver);
    await u.w(driver);

    await u.waitForEl(driver,c.SELECTORS.upload.GARBAGE_SWITCH);
    const garbageCollectionBtn = await driver.findElement(By.css(c.SELECTORS.upload.GARBAGE_SWITCH));
    await garbageCollectionBtn.click();

    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    let treeViewBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_VIEW));
    await treeViewBtn.click();

    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    await u.waitForEl(driver, c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE_ANCHOR);
    let rootNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE_ANCHOR));
    rootNode.click();

    let nodeName = 'testnoderename';

    let renameBtn = await driver.findElement(By.css(c.SELECTORS.upload.NODE_CRUD.RENAME_BTN));
    await renameBtn.click();
    await u.waitForEl(driver, c.SELECTORS.upload.NODE_CRUD.RENAME_INPUT);

    let renameInput = await driver.findElement(By.css(c.SELECTORS.upload.NODE_CRUD.RENAME_INPUT));
    await renameInput.sendKeys(nodeName);

    let submitBtn = await driver.findElement(By.css(c.SELECTORS.upload.NODE_CRUD.SUBMIT));
    await submitBtn.click();
    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);

    rootNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE_ANCHOR));
    expect(await rootNode.getText()).to.equal(nodeName);
  });

  it('Раздел удаляется', async function () {
    await u.login(driver);
    await u.w(driver);

    await u.waitForEl(driver,c.SELECTORS.upload.GARBAGE_SWITCH);
    const garbageCollectionBtn = await driver.findElement(By.css(c.SELECTORS.upload.GARBAGE_SWITCH));
    await garbageCollectionBtn.click();

    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    let treeViewBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_VIEW));
    await treeViewBtn.click();

    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    await u.waitForEl(driver, c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE_ANCHOR);
    let rootNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE_ANCHOR));
    rootNode.click();

    let deleteBtn = await driver.findElement(By.css(c.SELECTORS.upload.NODE_CRUD.DELETE_BTN));
    await deleteBtn.click();
    await u.waitForEl(driver, c.SELECTORS.upload.NODE_CRUD.SUBMIT);

    let submitBtn = await driver.findElement(By.css(c.SELECTORS.upload.NODE_CRUD.SUBMIT));
    await submitBtn.click();
    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);

    try{
      rootNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE_ANCHOR));
      expect(false);
    }catch(e){
      expect(e.name).to.equal("NoSuchElementError");
    }
  });

  //TODO разобраться почему экшены перестуют отрабатывать если делать dragAndDrop на элементах jsTree
  /*
  it('Раздел перемещается между родителями', async function () {
    await u.login(driver);
    await u.w(driver);

    await u.waitForEl(driver,c.SELECTORS.upload.GARBAGE_SWITCH);
    const garbageCollectionBtn = await driver.findElement(By.css(c.SELECTORS.upload.GARBAGE_SWITCH));
    await garbageCollectionBtn.click();

    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    let treeViewBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_VIEW));
    await treeViewBtn.click();
    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);

    await u.waitForEl(driver, c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE);
    let rootNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE));
    await rootNode.click();
    await u.w(driver);
    await u.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    rootNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE));
    children = await rootNode.findElements(By.css(c.SELECTORS.upload.CATALOGUE_TREE_TREE_NODE));

    await driver.actions({bridge: true}).dragAndDrop(children[0], children[1]).perform();
    await u.lw(driver);await u.lw(driver);await u.lw(driver);

  });
*/
});
