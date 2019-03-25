let c = require('./constants');
const {until, By} = require('selenium-webdriver');

let waiters = {
  s:async (driver)=>{
    c.DEBUG && await driver.wait(new Promise((resolve)=>setTimeout(()=>resolve(),c.DEBUG_SLEEP)), c.MAX_SLEEP);
  },
  w:async (driver)=>{
    await driver.wait(new Promise((resolve)=>setTimeout(()=>resolve(),c.WAIT)), c.MAX_SLEEP);
  },
  lw:async (driver)=>{
    await driver.wait(new Promise((resolve)=>setTimeout(()=>resolve(),c.LONG_WAIT)), c.MAX_SLEEP);
  },
  sw:async (driver)=>{
    await driver.wait(new Promise((resolve)=>setTimeout(()=>resolve(),c.SHORT_WAIT)), c.MAX_SLEEP);
  },
};

waiters.waitForEl = async (driver,selector)=>{
  await waiters.sw(driver);
  await driver.wait(until.elementLocated(By.css(selector)), 4000, 'Loading indefinitely');
};

module.exports = {
  ...waiters,
  getVerifiedData:async (driver)=>{
    await driver.get(c.SITE_URL+c.PAGE_UPLOAD);

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

    await waiters.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
    const listViewBtn = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_VIEW));
    await listViewBtn.click();

    await waiters.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);

    try{
      await waiters.w(driver);
      await waiters.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
      const rootNode = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ROOT));
      await rootNode.click();
    }catch(e){}

    do{
      await waiters.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
      await waiters.waitForEl(driver, c.SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM);
      let firstListItem = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
      nodeName = await firstListItem.getAttribute('innerText');
      nodeCode = await firstListItem.getAttribute('data-node');
      nodeCodeList = [nodeCode];

      await firstListItem.click();
      await waiters.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);

      await driver.findElements(By.css(c.SELECTORS.upload.ITEM_LIST_ITEM)).then((items=>{numOfItemsInNode = items.length;}));

      await waiters.waitForEl(driver, c.SELECTORS.notloading.NODE_LIST);
      await waiters.waitForEl(driver, c.SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM);
      await driver.findElements(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM)).then((items=>{numOfSubNodes = items.length;}));
      await waiters.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);

    }while(numOfItemsInNode < 1);

    numOfNestedItems = numOfItemsInNode;
    let itemResults = await driver.findElements(By.css(c.SELECTORS.upload.ITEM_LIST_ITEM));

    for(let i = 0; i<itemResults.length; i++){
        let itemCode = await itemResults[i].getAttribute('data-item');
        await waiters.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);
        itemResults[i].click();
        await waiters.waitForEl(driver, c.SELECTORS.notloading.RESOURCE_LIST);
        try{
            let resourcesInItem = await driver.findElements(By.css(c.SELECTORS.upload.RESOURCE_LIST_ITEM));
            nodeWithResources = nodeName;
            itemsWithResources.push(itemCode);
            numOfResources += resourcesInItem.length;
        }catch(e){}
        itemCodes.push(itemCode);
    }

    while(numOfSubNodes > 0){
      await waiters.s(driver);
      await waiters.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);
      let firstListItem = await driver.findElement(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM));
      let nodeCodeItem = await firstListItem.getAttribute('data-node');
      nodeCodeList.push(nodeCodeItem);
      await firstListItem.click();
      await waiters.waitForEl(driver, c.SELECTORS.notloading.ITEM_LIST);

      try{await driver.findElements(By.css(c.SELECTORS.upload.ITEM_LIST_ITEM)).then((items=>{numOfNestedItems += items.length;}));}catch(e){}
      try{await driver.findElements(By.css(c.SELECTORS.upload.CATALOGUE_TREE_LIST_ITEM)).then((items=>{numOfSubNodes = items.length;}));}catch(e){}
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
    };
  },
  login: async (driver)=>{
    await driver.manage().deleteAllCookies();
    await driver.get(c.SITE_URL);
    await waiters.w(driver);
    const loginInput = await driver.findElement(By.css(c.SELECTORS.LOGIN));
    const passwordInput = await driver.findElement(By.css(c.SELECTORS.PASSWORD));
    await loginInput.sendKeys(c.USERS.ADMIN.LOGIN);
    await passwordInput.sendKeys(c.USERS.ADMIN.PASSWORD);
    await loginInput.submit();
  }
};
