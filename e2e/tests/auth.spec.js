const { prepareDriver, cleanupDriver } = require('../utils/browser-automation');
const { expect } = require('chai');
const should = require('chai').should();
const { By, until, Key, elementIsVisible } = require('selenium-webdriver');

let c = require('../utils/constants.js');
let u = require('../utils/utils.js');

describe('Проверка аутентификации', function () {
  this.timeout(0);
  let driver;
  before(async () => {
    driver = await prepareDriver();
  });
  after(() => cleanupDriver(driver));

  it('Вход с неправильными параметрами выдает ошибку', async function () {
    await driver.manage().deleteAllCookies();
    await driver.get(c.SITE_URL);
    const loginInput = await driver.findElement(By.css(c.SELECTORS.LOGIN));
    const passwordInput = await driver.findElement(By.css(c.SELECTORS.PASSWORD));
    await loginInput.sendKeys(c.USERS.INCORRECT.LOGIN);
    await passwordInput.sendKeys(c.USERS.INCORRECT.PASSWORD);
    await loginInput.submit();
    let check = await driver.findElements(By.css(c.SELECTORS.LOGIN_ERROR_MESSAGE));
    expect(check.length).to.equal(1);
    await u.s(driver);
  });

  it('Вход с верными параметрами успешно пускает в систему', async function () {
    await driver.manage().deleteAllCookies();
    await driver.get(c.SITE_URL);
    const loginInput = await driver.findElement(By.css(c.SELECTORS.LOGIN));
    const passwordInput = await driver.findElement(By.css(c.SELECTORS.PASSWORD));
    await loginInput.sendKeys(c.USERS.ADMIN.LOGIN);
    await passwordInput.sendKeys(c.USERS.ADMIN.PASSWORD);
    await loginInput.submit();
    let check = await driver.findElements(By.css(c.SELECTORS.LOGIN_ERROR_MESSAGE));
    expect(check.length).to.equal(0);
    await u.s(driver);
  });

  it('кнопка Выход разлогинивает пользователя и перенаправляет на страницу аутентификации', async function () {
    try{
      await u.waitForEl(driver, c.SELECTORS.LOGOUT_BUTTON);
      const logoutBtn = await driver.findElement(By.css(c.SELECTORS.LOGOUT_BUTTON));
      await logoutBtn.click();
      await driver.get(c.SITE_URL + c.PAGE_UPLOAD); // проверяем что после клика по выходу - мы разлогинены и нас будет перекидывать на страницу аутентификации.;
      await driver.findElement(By.css(c.SELECTORS.LOGIN));
      await u.s(driver);
    }catch(e){
      expect(e).to.equal(null);
    }
  });
});
