/** 
 * 
 * selenium docs: https://www.seleniumhq.org/docs
 * selenium-webdriver js api: https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html
 * chai as assertion lib: https://www.chaijs.com/
 * 
 */


const { prepareDriver, cleanupDriver } = require('../utils/browser-automation')
const { expect } = require('chai')
const { By } = require('selenium-webdriver')

/**
 * Constants
 */
  const MAX_SLEEP = 30000;
  const DEBUG_SLEEP = 1000;
  const DEBUG = false;

  const SITE_URL = 'https://photobank.domfarfora.ru';
  const PAGE_UPLOAD = '/upload';
  
  const USERS = {
    ADMIN: {
      LOGIN: 'ENTER REAL USER',
      PASSWORD: 'ENTER REAL PASSWORD'
    },
    INCORRECT: {
      LOGIN: 'none',
      PASSWORD: 'none'
    }
  }
  const SELECTORS = {
    LOGIN: 'input[name="_username"]',
    PASSWORD: 'input[name="_password"]',
    LOGIN_ERROR_MESSAGE: '.auth__item.auth__item--error',
    LOGOUT_BUTTON: '.clogout-btn'
  }


describe('Проверка аутентификации', function () {
  this.timeout(0); // set timelimit to infinity - otherwise you'll get 2000ms timeUp error.
  let driver
  before(async () => {
    driver = await prepareDriver()
  })
  after(() => cleanupDriver(driver))

  it('Вход с неправильными параметрами выдает ошибку', async function () {
    await driver.manage().deleteAllCookies();
    await driver.get(SITE_URL);
    const loginInput = await driver.findElement(By.css(SELECTORS.LOGIN))
    const passwordInput = await driver.findElement(By.css(SELECTORS.PASSWORD))
    await loginInput.sendKeys(USERS.INCORRECT.LOGIN)
    await passwordInput.sendKeys(USERS.INCORRECT.PASSWORD)
    await loginInput.submit();
    let check = await driver.findElements(By.css(SELECTORS.LOGIN_ERROR_MESSAGE))
    expect(check.length).to.equal(1);
    DEBUG && await driver.wait(new Promise((resolve)=>setTimeout(()=>resolve(),DEBUG_SLEEP)), MAX_SLEEP);
  }) 

  it('Вход с верными параметрами успешно пускает в систему', async function () {
    await driver.manage().deleteAllCookies();
    await driver.get(SITE_URL);
    const loginInput = await driver.findElement(By.css(SELECTORS.LOGIN))
    const passwordInput = await driver.findElement(By.css(SELECTORS.PASSWORD))
    await loginInput.sendKeys(USERS.ADMIN.LOGIN)
    await passwordInput.sendKeys(USERS.ADMIN.PASSWORD)
    await loginInput.submit();
    let check = await driver.findElements(By.css(SELECTORS.LOGIN_ERROR_MESSAGE))
    expect(check.length).to.equal(0);
    DEBUG && await driver.wait(new Promise((resolve)=>setTimeout(()=>resolve(),DEBUG_SLEEP)), MAX_SLEEP);
  }) 

  it('кнопка Выход разлогинивает пользователя и перенаправляет на страницу аутентификации', async function () {
    try{
      const logoutBtn = await driver.findElement(By.css(SELECTORS.LOGOUT_BUTTON))
      await logoutBtn.click();
      await driver.get(SITE_URL + PAGE_UPLOAD); // проверяем что после клика по выходу - мы разлогинены и нас будет перекидывать на страницу аутентификации.
      await driver.findElement(By.css(SELECTORS.LOGIN))
      DEBUG && await driver.wait(new Promise((resolve)=>setTimeout(()=>resolve(),DEBUG_SLEEP)), MAX_SLEEP);
    }catch(e){
      expect(e).to.equal(null);
    }
  }) 
})


describe('Проверка поисковой системы (и фильтров) по товарам', function () {
  this.timeout(0); // set timelimit to infinity - otherwise you'll get 2000ms timeUp error.
  let driver
  before(async () => {
    driver = await prepareDriver()
  })
  after(() => cleanupDriver(driver))

  it('Поиск по названию находит нужные товары', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 

  it('Поиск включает фильтрацию по разделу каталога и находит нужные товары', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 

  it('Поиск включает фильтрацию по разделу каталога (рекурсивно) и находит нужные товары', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 

  it('Поиск 1С коду товара находит нужный товар', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 

  it('Поиск 1С кодам товаров находит нужные товары', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 

  it('Поиск артиклу коду товара находит нужный товар', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 

  it('Поиск артиклам товаров находит нужные товары', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 

  it('Фильтрация товаров работает', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 
})

describe('Проверка навигации по каталогам', function () {
  this.timeout(0); // set timelimit to infinity - otherwise you'll get 2000ms timeUp error.
  let driver
  before(async () => {
    driver = await prepareDriver()
  })
  after(() => cleanupDriver(driver))

  it('[вид: дерево] При клике по дереву каталога - подгружаются его подкаталоги', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 

  it('[вид: дерево] При клике по дереву каталога - подгружаются товары в этом каталоге (непосредственные потомки)', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 

  it('[вид: директории] При клике по дереву каталога - подгружаются его подкаталоги', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 

  it('[вид: директории] При клике по дереву каталога - подгружаются товары в этом каталоге (непосредственные потомки)', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 

  it('[вид: директории] При клике по "../" - происходит переход к родителю', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 

})

describe('Отображение ресурсов товара', function () {
  this.timeout(0); // set timelimit to infinity - otherwise you'll get 2000ms timeUp error.
  let driver
  before(async () => {
    driver = await prepareDriver()
  })
  after(() => cleanupDriver(driver))

  it('При клике на товар - отображаются ресурсы товара (если есть)', async function () {
    expect(false, 'NOT IMPLEMENTED').to.be.ok;
  }) 
})

