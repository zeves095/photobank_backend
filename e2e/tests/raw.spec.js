/**
 *
 * selenium docs: https://www.seleniumhq.org/docs;
 * selenium-webdriver js api: https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html;
 * chai as assertion lib: https://www.chaijs.com/
 *
 */


const { prepareDriver, cleanupDriver } = require('../utils/browser-automation');
const { expect } = require('chai');
const should = require('chai').should();
const { By, until, Key, elementIsVisible } = require('selenium-webdriver');

/**
 * Constants;
 */
  const MAX_SLEEP = 30000;
  const DEBUG_SLEEP = 1000;
  const DEBUG = false;
  const SHORT_WAIT = 200;
  const WAIT = 400;
  const LONG_WAIT = 4000;

async function s(driver){
  DEBUG && await driver.wait(new Promise((resolve)=>setTimeout(()=>resolve(),DEBUG_SLEEP)), MAX_SLEEP);
}
async function w(driver){
  await driver.wait(new Promise((resolve)=>setTimeout(()=>resolve(),WAIT)), MAX_SLEEP);
}
async function lw(driver){
  await driver.wait(new Promise((resolve)=>setTimeout(()=>resolve(),LONG_WAIT)), MAX_SLEEP);
}
async function sw(driver){
  await driver.wait(new Promise((resolve)=>setTimeout(()=>resolve(),SHORT_WAIT)), MAX_SLEEP);
}
async function waitForEl(driver,selector){
  await sw(driver);
  await driver.wait(until.elementLocated(By.css(selector)), 4000, 'Loading indefinitely');
}
  const SITE_URL = 'http://localhost:8000';
  const PAGE_UPLOAD = '/upload';
  const PAGE_LINKS = '/account';
  const PAGE_USERS = '/usermanager';

  const USERS = {
    ADMIN: {
      LOGIN: 'efimov',
      PASSWORD: '300ljkkfhjd'
    },
    INCORRECT: {
      LOGIN: 'none',
      PASSWORD: 'none'
    }
  }
  const FORM_DATA = {
    ITEM_NAME: 'Кружка',
    NODE_NAME: 'Кружка',
  }
  const SELECTORS = {
    LOGIN: 'input[name="_username"]',
    PASSWORD: 'input[name="_password"]',
    LOGIN_ERROR_MESSAGE: '.auth__item.auth__item--error',
    LOGOUT_BUTTON: '.clogout-btn',
    LOADER: '.loading',
    upload:{
      ITEM_SEARCH_FORM: '.item-search',
      ITEM_SEARCH_NAME_INPUT: '#srchinpt1',
      ITEM_SEARCH_NODE_INPUT: '#srchinpt2',
      ITEM_SEARCH_ITEM_CODE: '#srchinpt3',
      ITEM_SEARCH_NESTED_INPUT: '#srchinpt4',
      ITEM_SEARCH_SUBMIT_BTN: '#srchbtn',
      ITEM_LIST_ITEM: '.view-inner__item-list .list-item',
      ITEM_LIST_FILTER: '#nodesearchinpt',
      CATALOGUE_TREE_SEARCH_VIEW: '.component-title__view-icons>i[data-view="3"]',
      CATALOGUE_TREE_LIST_VIEW: '.component-title__view-icons>i[data-view="1"]',
      CATALOGUE_TREE_TREE_VIEW: '.component-title__view-icons>i[data-view="2"]',
      CATALOGUE_TREE_LIST_ITEM: '.list-view__cat_item[data-node]',
      CATALOGUE_TREE_LIST_ROOT: '.catalogue-tree__crumbs .crumbs__crumb:first-child',
      CATALOGUE_TREE_TREE_NODE: '.jstree-anchor',
      CATALOGUE_TREE_TREE_CHILDREN: '.jstree-children',
      CATALOGUE_TREE_LIST_UP: '.list-view__cat_item:not([data-node])',
      RESOURCE_LIST_ITEM: '.existing-files__file',
    },
    linkmanager:{
      ADD_LINK_BTN: ".link-list .add-button",
      RESOURCE_SEARCH_ITEM_NAME: ".resource-search-form #root_item_search_name",
      RESOURCE_SEARCH_NODE_NAME: ".resource-search-form #root_item_search_parent_name",
      RESOURCE_SEARCH_SEARCH_NESTED: ".resource-search-form #root_item_search_search_nested",
      RESOURCE_SEARCH_ITEM_CODE: ".resource-search-form #root_item_search_code",
      RESOURCE_SEARCH_RESOURCE_ID: ".resource-search-form #root_resource_search_id",
      RESOURCE_SEARCH_PRESET_ID: ".resource-search-form #root_resource_search_preset",
      RESOURCE_SEARCH_TYPE_ID: ".resource-search-form #root_resource_search_type",
      RESOURCE_SEARCH_SUBMIT: ".resource-search-form button[type=submit]",
      RESOURCE_SEARCH_RESULT: ".resource.list-item",
      RESOURCE_SEARCH_SELECT_ALL: ".resource-search-results button[name=button]",
    },
    notloading:{
      ITEM_LIST: ".view-inner__item-list .view-inner__container:not(.loading)",
      NODE_LIST: ".catalogue-tree__view-inner:not(.loading)",
      RESOURCE_SEARCH_RESULTS: ".resource-search-results:not(.loading)",
      UNFINISHED_UPLOADS: ".item-uploads__unfinished:not(.loading)",
      RESOURCE_LIST: ".item-resources:not(.loading)",
      LINK_LIST: ".link-list .component-body:not(.loading)"
    }
  }

describe('Проверка аутентификации', function () {
  this.timeout(0); // set timelimit to infinity - otherwise you'll get 2000ms timeUp error.;
  let driver;
  before(async () => {
    driver = await prepareDriver();
  });
  after(() => cleanupDriver(driver));

  it('Вход с неправильными параметрами выдает ошибку', async function () {
    await driver.manage().deleteAllCookies();
    await driver.get(SITE_URL);
    const loginInput = await driver.findElement(By.css(SELECTORS.LOGIN));
    const passwordInput = await driver.findElement(By.css(SELECTORS.PASSWORD));
    await loginInput.sendKeys(USERS.INCORRECT.LOGIN);
    await passwordInput.sendKeys(USERS.INCORRECT.PASSWORD);
    await loginInput.submit();
    let check = await driver.findElements(By.css(SELECTORS.LOGIN_ERROR_MESSAGE));
    expect(check.length).to.equal(1);
    await s(driver);
  });

  it('Вход с верными параметрами успешно пускает в систему', async function () {
    await driver.manage().deleteAllCookies();
    await driver.get(SITE_URL);
    const loginInput = await driver.findElement(By.css(SELECTORS.LOGIN));
    const passwordInput = await driver.findElement(By.css(SELECTORS.PASSWORD));
    await loginInput.sendKeys(USERS.ADMIN.LOGIN);
    await passwordInput.sendKeys(USERS.ADMIN.PASSWORD);
    await loginInput.submit();
    let check = await driver.findElements(By.css(SELECTORS.LOGIN_ERROR_MESSAGE));
    expect(check.length).to.equal(0);
    await s(driver);
  });

  it('кнопка Выход разлогинивает пользователя и перенаправляет на страницу аутентификации', async function () {
    try{
      const logoutBtn = await driver.findElement(By.css(SELECTORS.LOGOUT_BUTTON));
      await logoutBtn.click();
      await driver.get(SITE_URL + PAGE_UPLOAD); // проверяем что после клика по выходу - мы разлогинены и нас будет перекидывать на страницу аутентификации.;
      await driver.findElement(By.css(SELECTORS.LOGIN));
      await s(driver);
    }catch(e){
      expect(e).to.equal(null);
    }
  });
});

describe('Проверка поисковой системы (и фильтров) по товарам', function () {
  this.timeout(0); // set timelimit to infinity - otherwise you'll get 2000ms timeUp error.;
  let driver;
  before(async () => {
    driver = await prepareDriver();
  });
  after(() => cleanupDriver(driver));

  it('Поиск по названию находит нужные товары', async function () {
    await driver.manage().deleteAllCookies();
    await driver.get(SITE_URL);
    const loginInput = await driver.findElement(By.css(SELECTORS.LOGIN));
    const passwordInput = await driver.findElement(By.css(SELECTORS.PASSWORD));
    await loginInput.sendKeys(USERS.ADMIN.LOGIN);
    await passwordInput.sendKeys(USERS.ADMIN.PASSWORD);
    await loginInput.submit();
    await w(driver);
    const searchViewBtn = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW));
    await searchViewBtn.click();
    let nameInput = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+">"+SELECTORS.upload.ITEM_SEARCH_NAME_INPUT));
    nameInput.sendKeys(FORM_DATA.ITEM_NAME);
    let searchSubmitBtn = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+">"+SELECTORS.upload.ITEM_SEARCH_SUBMIT_BTN));
    await searchSubmitBtn.click();
    await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
    let searchResults = await driver.findElements(By.css(SELECTORS.upload.ITEM_LIST_ITEM));
    //searchResults = await searchResults.filter(async item=>(await item.getAttribute('innerHTML')).includes(FORM_DATA.ITEM_NAME));
    let tbd = [];
    for(let i = 0; i<searchResults.length; i++){
      let inner = await searchResults[i].getAttribute('innerText');
      if(!inner.toLowerCase().includes(FORM_DATA.ITEM_NAME.toLowerCase())){tbd.push(i);}
    }
    tbd.reverse();
    for(let i = 0; i<tbd.length; i++){searchResults.splice(tbd[i], 1);}
    searchResults.should.have.lengthOf.at.least(20);
    await s(driver);
  });

  it('Поиск включает фильтрацию по разделу каталога и находит нужные товары', async function () {
    var {numOfItemsInNode,nodeName} = await getVerifiedData(driver);
    await s(driver);
    const searchViewBtn = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW));
    await searchViewBtn.click();
    let nodeInput = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+">"+SELECTORS.upload.ITEM_SEARCH_NODE_INPUT));
    nodeInput.sendKeys(nodeName);
    const searchSubmitBtn = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+">"+SELECTORS.upload.ITEM_SEARCH_SUBMIT_BTN));
    await searchSubmitBtn.click();
    await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
    const searchResults = await driver.findElements(By.css(SELECTORS.upload.ITEM_LIST_ITEM));
    await s(driver);
    expect(searchResults.length).to.equal(numOfItemsInNode);
    await s(driver);
  });

  it('Поиск включает фильтрацию по разделу каталога (рекурсивно) и находит нужные товары', async function () {
    var {numOfNestedItems,nodeName} = await getVerifiedData(driver);
    await waitForEl(driver, SELECTORS.notloading.NODE_LIST);
    const searchViewBtn = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW));
    await searchViewBtn.click();
    let nodeInput = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+">"+SELECTORS.upload.ITEM_SEARCH_NODE_INPUT));
    nodeInput.sendKeys(nodeName);
    let nestedInput = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+" "+SELECTORS.upload.ITEM_SEARCH_NESTED_INPUT));
    nestedInput.click();
    const searchSubmitBtn = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+">"+SELECTORS.upload.ITEM_SEARCH_SUBMIT_BTN));
    await searchSubmitBtn.click();
    await waitForEl(driver, SELECTORS.notloading.NODE_LIST);
    await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
    const searchResults = await driver.findElements(By.css(SELECTORS.upload.ITEM_LIST_ITEM));
    await s(driver);
    expect(searchResults.length).to.equal(numOfNestedItems);
  });

  it('Поиск по 1С коду товара находит нужный товар', async function () {
    var {numOfItemsInNode,itemCodes} = await getVerifiedData(driver);
    await s(driver);
    const searchViewBtn = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW));
    await searchViewBtn.click();
    let nodeInput = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+">"+SELECTORS.upload.ITEM_SEARCH_ITEM_CODE));
    nodeInput.sendKeys(itemCodes[0]);
    const searchSubmitBtn = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+">"+SELECTORS.upload.ITEM_SEARCH_SUBMIT_BTN));
    await searchSubmitBtn.click();
    await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
    const searchResults = await driver.findElements(By.css(SELECTORS.upload.ITEM_LIST_ITEM));
    await s(driver);
    let resultCode = await searchResults[0].getAttribute('data-item');
    expect(resultCode).to.equal(itemCodes[0]);
    await s(driver);
  });

  it('Поиск ао 1С кодам товаров находит нужные товары', async function () {
    var {numOfItemsInNode,itemCodes} = await getVerifiedData(driver);
    await s(driver);
    const searchViewBtn = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW));
    await searchViewBtn.click();
    let nodeInput = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+">"+SELECTORS.upload.ITEM_SEARCH_ITEM_CODE));
    for(let i = 0; i<itemCodes.length; i++){
        await nodeInput.sendKeys(itemCodes[i]+", ");
    }
    const searchSubmitBtn = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+">"+SELECTORS.upload.ITEM_SEARCH_SUBMIT_BTN));
    await searchSubmitBtn.click();
    await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
    const searchResults = await driver.findElements(By.css(SELECTORS.upload.ITEM_LIST_ITEM));
    await s(driver);
    for(let i =0; i<itemCodes.length; i++){
      let resultCode = await searchResults[i].getAttribute('data-item');
      expect(resultCode).to.equal(itemCodes[i]);
    }

    await s(driver);
  });

  it('Поиск артиклу коду товара находит нужный товар', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  });

  it('Поиск артикулам товаров находит нужные товары', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  });

  it('Фильтрация товаров работает', async function () {
    var {numOfItemsInNode,itemCodes} = await getVerifiedData(driver);
    await s(driver);
    const searchViewBtn = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW));
    await searchViewBtn.click();
    let nodeInput = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+">"+SELECTORS.upload.ITEM_SEARCH_ITEM_CODE));
    for(let i = 0; i<itemCodes.length; i++){
        await nodeInput.sendKeys(itemCodes[i]+", ");
    }
    const searchSubmitBtn = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+">"+SELECTORS.upload.ITEM_SEARCH_SUBMIT_BTN));
    await searchSubmitBtn.click();
    await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
    const filterInput = await driver.findElement(By.css(SELECTORS.upload.ITEM_LIST_FILTER));
    await filterInput.click();
    await filterInput.sendKeys(itemCodes[0]);
    await w(driver);
    const searchResults = await driver.findElements(By.css(SELECTORS.upload.ITEM_LIST_ITEM));
    expect(searchResults.length).to.equal(1);
    await s(driver);
  });
});

describe('Проверка навигации по каталогам', function () {
  this.timeout(0); // set timelimit to infinity - otherwise you'll get 2000ms timeUp error.;
  let driver;
  before(async () => {
    driver = await prepareDriver();
  });
  after(() => cleanupDriver(driver));

  it('[вид: дерево] При клике по дереву каталога - подгружаются его подкаталоги', async function () {
    await driver.manage().deleteAllCookies();
    await driver.get(SITE_URL);
    const loginInput = await driver.findElement(By.css(SELECTORS.LOGIN));
    const passwordInput = await driver.findElement(By.css(SELECTORS.PASSWORD));
    await loginInput.sendKeys(USERS.ADMIN.LOGIN);
    await passwordInput.sendKeys(USERS.ADMIN.PASSWORD);
    await loginInput.submit();
    await w(driver);
    const treeViewBtn = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_TREE_VIEW));
    await treeViewBtn.click();
    let rootNode = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_TREE_NODE));
    rootNode.click();
    try{
      const subNodes = await driver.findElements(By.css(SELECTORS.upload.CATALOGUE_TREE_TREE_NODE+">"+SELECTORS.upload.CATALOGUE_TREE_TREE_CHILDREN));
      await waitForEl(driver, SELECTORS.notloading.NODE_LIST);
      expect(subNodes).to.have.lengthOf.at.least(5);
    }catch(e){
      expect(false, e);
    }
  });

  it('[вид: дерево] При клике по дереву каталога - подгружаются товары в этом каталоге (непосредственные потомки)', async function () {
    let numOfItemsInNode = 0;
    let browseStep = 0;
    while(numOfItemsInNode < 1){
      await s(driver);
      let catNodes = await driver.findElements(By.css(SELECTORS.upload.CATALOGUE_TREE_TREE_NODE));
      await catNodes[browseStep++].click();
      await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
      await driver.findElements(By.css(SELECTORS.upload.ITEM_LIST_ITEM)).then((items)=>{numOfItemsInNode = items.length});
    }
    let foundItems = await driver.findElements(By.css(SELECTORS.upload.ITEM_LIST_ITEM));
    expect(foundItems).to.have.lengthOf.at.least(1);
  });

  it('[вид: директории] При клике по дереву каталога - подгружаются его подкаталоги', async function () {
    const listViewBtn = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_VIEW));
    await listViewBtn.click();
    await waitForEl(driver, SELECTORS.notloading.NODE_LIST);
    try{
      const rootNode = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_ROOT));
      await rootNode.click();
      await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
    }catch(e){console.log(e)}
    const firstNode = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
    firstNode.click();
    await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
    const subNodes = await driver.findElements(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
    expect(subNodes).to.have.lengthOf.at.least(1);
  });

  it('[вид: директории] При клике по дереву каталога - подгружаются товары в этом каталоге (непосредственные потомки)', async function () {
    const listViewBtn = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_VIEW));
    await listViewBtn.click();
    await waitForEl(driver, SELECTORS.notloading.NODE_LIST);
    try{
      const rootNode = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_ROOT));
      await rootNode.click();
      await waitForEl(driver, SELECTORS.notloading.NODE_LIST);
    }catch(e){}
    let nodeCounter = 0;
    let itemsInNode = 0;
    try{
      while(itemsInNode<1){
        const curNode = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
        curNode.click();
        await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
        await driver.findElements(By.css(SELECTORS.upload.ITEM_LIST_ITEM)).then((items=>{itemsInNode = items.length}));
      }
    }catch(e){
      expect(false, e);
    }
    expect(itemsInNode).to.be.at.least(1);
  });

  it('[вид: директории] При клике по "../" - происходит переход к родителю', async function () {
    const listViewBtn = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_VIEW));
    await listViewBtn.click();
    await waitForEl(driver, SELECTORS.notloading.NODE_LIST);
    try{
      const rootNode = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_ROOT));
      await rootNode.click();
      await waitForEl(driver, SELECTORS.notloading.NODE_LIST);
    }catch(e){}
    let firstNode = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
    let nodeCode = await firstNode.getAttribute('data-node');
    firstNode.click();
    await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
    const traverseUpBtn = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_UP));
    traverseUpBtn.click();
    await waitForEl(driver, SELECTORS.notloading.NODE_LIST);
    firstNode = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
    let newNodeCode = await firstNode.getAttribute('data-node');
    expect(nodeCode).to.equal(newNodeCode);
  });

});

describe('Отображение ресурсов товара', function () {
    this.timeout(0); // set timelimit to infinity - otherwise you'll get 2000ms timeUp error.;
    let driver;
    before(async () => {
      driver = await prepareDriver();
    });
    after(() => cleanupDriver(driver));

    it('При клике на товар - отображаются ресурсы товара (если есть)', async function () {
      await driver.manage().deleteAllCookies();
      await driver.get(SITE_URL);
      const loginInput = await driver.findElement(By.css(SELECTORS.LOGIN));
      const passwordInput = await driver.findElement(By.css(SELECTORS.PASSWORD));
      await loginInput.sendKeys(USERS.ADMIN.LOGIN);
      await passwordInput.sendKeys(USERS.ADMIN.PASSWORD);
      await loginInput.submit();
      await w(driver);
      const searchViewBtn = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_SEARCH_VIEW));
      await searchViewBtn.click();
      let searchSubmitBtn = await driver.findElement(By.css(SELECTORS.upload.ITEM_SEARCH_FORM+">"+SELECTORS.upload.ITEM_SEARCH_SUBMIT_BTN));
      await searchSubmitBtn.click();
      await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
      let searchResults = await driver.findElements(By.css(SELECTORS.upload.ITEM_LIST_ITEM));
      let numOfResources = 0;
      let resourceCounter = 0;
      while(numOfResources<1){
        let item = searchResults[resourceCounter++];
        await item.click();
        await waitForEl(driver, SELECTORS.notloading.RESOURCE_LIST);
        try{
          let itemResources = await driver.findElements(By.css(SELECTORS.upload.RESOURCE_LIST_ITEM));
          numOfResources = itemResources.length;
        }catch(e){}
        await driver.executeScript("arguments[0].scrollIntoView(true)", item);
        await driver.wait(until.elementIsVisible(item), 500, 'Could not locate the child element within the time specified');
      }
      expect(numOfResources).to.be.at.least(1);
      await s(driver);
    });
  });

describe('Проверка поисковой системы по ресурсам', function () {
    this.timeout(0); // set timelimit to infinity - otherwise you'll get 2000ms timeUp error.;
    let driver;
    before(async () => {
      driver = await prepareDriver();
    });
    after(() => cleanupDriver(driver));

    it('Поиск по названию товара находит нужные ресурсы', async function () {
      await driver.manage().deleteAllCookies();
      await driver.get(SITE_URL);
      const loginInput = await driver.findElement(By.css(SELECTORS.LOGIN));
      const passwordInput = await driver.findElement(By.css(SELECTORS.PASSWORD));
      await loginInput.sendKeys(USERS.ADMIN.LOGIN);
      await passwordInput.sendKeys(USERS.ADMIN.PASSWORD);
      await loginInput.submit();
      await driver.get(SITE_URL+PAGE_LINKS);
      await w(driver);
      await waitForEl(driver, SELECTORS.notloading.LINK_LIST);
      const addLinkButton = await driver.findElement(By.css(SELECTORS.linkmanager.ADD_LINK_BTN));
      await addLinkButton.click();
      let itemNameInput = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_ITEM_NAME));
      itemNameInput.sendKeys(FORM_DATA.ITEM_NAME);
      let searchSubmitBtn = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_SUBMIT));
      await searchSubmitBtn.click();
      await waitForEl(driver, SELECTORS.notloading.RESOURCE_SEARCH_RESULTS);
      let searchResults = await driver.findElements(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_RESULT));
      let initLength = searchResults.length;
      let tbd = [];
      for(let i = 0; i<searchResults.length; i++){
        let inner = await searchResults[i].getAttribute('innerText');
        if(!inner.toLowerCase().includes(FORM_DATA.ITEM_NAME.toLowerCase())){tbd.push(i);}
      }
      tbd.reverse();
      for(let i = 0; i<tbd.length; i++){searchResults.splice(tbd[i], 1);}
      searchResults.should.have.lengthOf(initLength);
      await s(driver);
      itemNameInput.clear();
    });

    it('Поиск включает фильтрацию по разделу каталога и находит нужные товары', async function () {
      var {nodeWithResources, itemsWithResources} = await getVerifiedData(driver);
      await driver.get(SITE_URL+PAGE_LINKS);
      await s(driver);
      await waitForEl(driver, SELECTORS.notloading.LINK_LIST);
      const addLinkButton = await driver.findElement(By.css(SELECTORS.linkmanager.ADD_LINK_BTN));
      await addLinkButton.click();
      let nodeInput = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_NODE_NAME));
      nodeInput.sendKeys(nodeWithResources);
      let presetInput = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_PRESET_ID))
      presetInput.sendKeys(Key.BACK_SPACE);
      let typeInput = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_TYPE_ID))
      typeInput.sendKeys(Key.BACK_SPACE);
      let nestedInput = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_SEARCH_NESTED))
      nestedInput.click();
      const searchSubmitBtn = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_SUBMIT));
      await searchSubmitBtn.click();
      await waitForEl(driver, SELECTORS.notloading.RESOURCE_SEARCH_RESULTS);
      const searchResults = await driver.findElements(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_RESULT));
      await s(driver);
      let itemCodes = [];
      for(let i = 0; i<searchResults.length; i++){
        let itemTitle = await searchResults[i].getAttribute("innerText");
        let itemCode = itemTitle.split('(')[1].split(')')[0];
        if(itemCodes.indexOf(itemCode) == -1){
          itemCodes.push(itemCode);
        }
      }
      expect(itemCodes).to.have.lengthOf(itemsWithResources.length);
      await s(driver);
    });

    it('Поиск по коду 1с товара находит нужные ресурсы', async function () {
      var {itemsWithResources} = await getVerifiedData(driver);
      await driver.get(SITE_URL+PAGE_LINKS);
      await s(driver);
      await waitForEl(driver, SELECTORS.notloading.LINK_LIST);
      const addLinkButton = await driver.findElement(By.css(SELECTORS.linkmanager.ADD_LINK_BTN));
      await addLinkButton.click();
      let presetInput = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_PRESET_ID));
      presetInput.sendKeys(Key.BACK_SPACE);
      let typeInput = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_TYPE_ID));
      typeInput.sendKeys(Key.BACK_SPACE);
      let itemCodeInput = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_ITEM_CODE));
      itemCodeInput.sendKeys(itemsWithResources[0]);
      const searchSubmitBtn = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_SUBMIT));
      await searchSubmitBtn.click();
      await waitForEl(driver, SELECTORS.notloading.RESOURCE_SEARCH_RESULTS);
      const searchResults = await driver.findElements(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_RESULT));
      await s(driver);
      let resultsMatchCode = true;
      for(let i = 0; i<searchResults.length; i++){
        let itemTitle = await searchResults[i].getAttribute("innerText");
        let itemCode = itemTitle.split('(')[1].split(')')[0];
        if(itemCode !== itemsWithResources[0]){
          resultsMatchCode = false;
        }
      }
      expect(resultsMatchCode).to.be.true;
      await s(driver);
    });

    it('Поиск по ID ресурса находит нужный ресурс', async function () {
      await driver.get(SITE_URL+PAGE_LINKS);
      await waitForEl(driver, SELECTORS.notloading.LINK_LIST);
      const addLinkButton = await driver.findElement(By.css(SELECTORS.linkmanager.ADD_LINK_BTN));
      await addLinkButton.click();
      let itemNameInput = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_ITEM_NAME));
      itemNameInput.sendKeys(FORM_DATA.ITEM_NAME);
      let searchSubmitBtn = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_SUBMIT));
      await searchSubmitBtn.click();
      await waitForEl(driver, SELECTORS.notloading.RESOURCE_SEARCH_RESULTS);
      let searchResults = await driver.findElements(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_RESULT));
      let resourceId = await searchResults[0].getAttribute('data-res');
      let resourceIdInput = await driver.findElement(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_RESOURCE_ID));
      resourceIdInput.sendKeys(resourceId);
      itemNameInput.sendKeys(Key.BACK_SPACE.repeat(50));
      await w(driver);
      searchSubmitBtn.click();
      await waitForEl(driver, SELECTORS.notloading.RESOURCE_SEARCH_RESULTS);
      searchResults = await driver.findElements(By.css(SELECTORS.linkmanager.RESOURCE_SEARCH_RESULT));
      let newResourceId = await searchResults[0].getAttribute('data-res');
      expect(newResourceId).to.equal(resourceId);
      expect(searchResults).to.have.lengthOf(1);
      await s(driver);
      itemNameInput.clear();
    });

  });

async function getVerifiedData(driver){
  await driver.get(SITE_URL+PAGE_UPLOAD);

  let numOfItemsInNode = 0;
  let numOfNestedItems = 0;
  let numOfSubNodes = 0;
  let nodeName = "";
  let nodeCode = "";
  let nodeCodeList = [];
  let itemCodes = [];
  let nodeWithResources = "";
  let itemsWithResources = [];
  let numOfResources = 0;

  const listViewBtn = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_VIEW));
  await listViewBtn.click();

  await waitForEl(driver, SELECTORS.notloading.NODE_LIST);

  try{
    await w(driver);
    const rootNode = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_ROOT));
    await rootNode.click();
  }catch(e){}

  await waitForEl(driver, SELECTORS.notloading.NODE_LIST);

  do{
    await s(driver);
    let firstListItem = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
    nodeName = await firstListItem.getAttribute('innerText');
    nodeCode = await firstListItem.getAttribute('data-node');
    nodeCodeList = [nodeCode];

    await firstListItem.click();

    await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);

    await driver.findElements(By.css(SELECTORS.upload.ITEM_LIST_ITEM)).then((items=>{numOfItemsInNode = items.length}));
    await driver.findElements(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM)).then((items=>{numOfSubNodes = items.length}));
    await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
    
  }while(numOfItemsInNode < 1)

  numOfNestedItems = numOfItemsInNode;
  let itemResults = await driver.findElements(By.css(SELECTORS.upload.ITEM_LIST_ITEM));

  for(let i = 0; i<itemResults.length; i++){
      let itemCode = await itemResults[i].getAttribute('data-item');
      await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
      itemResults[i].click();
      await waitForEl(driver, SELECTORS.notloading.RESOURCE_LIST);
      try{
          let resourcesInItem = await driver.findElements(By.css(SELECTORS.upload.RESOURCE_LIST_ITEM));
          nodeWithResources = nodeName;
          itemsWithResources.push(itemCode);
          numOfResources += resourcesInItem.length;
      }catch(e){console.log(e)}
      itemCodes.push(itemCode);
  }

  while(numOfSubNodes > 0){
    await s(driver);
    await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);
    let firstListItem = await driver.findElement(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
    let nodeCodeItem = await firstListItem.getAttribute('data-node');
    nodeCodeList.push(nodeCodeItem);
    await firstListItem.click();
    await waitForEl(driver, SELECTORS.notloading.ITEM_LIST);

    try{await driver.findElements(By.css(SELECTORS.upload.ITEM_LIST_ITEM)).then((items=>{numOfNestedItems += items.length}))}catch(e){};
    try{await driver.findElements(By.css(SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM)).then((items=>{numOfSubNodes = items.length}))}catch(e){};
  }

  return {
    numOfItemsInNode,
    numOfNestedItems,
    numOfSubNodes,
    nodeName,
    nodeCode,
    nodeCodeList,
    itemCodes,
    nodeWithResources,
    itemsWithResources,
    numOfResources
  }
}
