const { prepareDriver, cleanupDriver } = require('../utils/browser-automation');
const { expect } = require('chai');
const should = require('chai').should();
const { By, until, Key, elementIsVisible } = require('selenium-webdriver');

let c = require('../utils/constants.js');
let u = require('../utils/utils.js');

describe('Проверка системы редактирования пользователей', function () {
    this.timeout(0); // set timelimit to infinity - otherwise you'll get 2000ms timeUp error.;
    let driver;
    before(async () => {
      driver = await prepareDriver();
    });
    after(() => cleanupDriver(driver));

    it('Создается новый пользователь', async function () {
      await u.login(driver);
      await driver.get(c.SITE_URL+c.PAGE_USERS);
      await u.w(driver);

      let newUserData = {
        name: 'testcreateuser',
        email: 'test@test.test',
        password: 'secret'
      };

      let numOfUsers = (await driver.findElements(By.css(c.SELECTORS.usermanager.USER))).length;

      let addUserBtn = await driver.findElement(By.css(c.SELECTORS.usermanager.ADD_USER_BTN));
      await driver.executeScript("arguments[0].scrollIntoView()", addUserBtn);
      await addUserBtn.click();

      let nameInput = await driver.findElement(By.css(c.SELECTORS.usermanager.USER_EDIT_FORM.NAME_INPUT));
      let emailInput = await driver.findElement(By.css(c.SELECTORS.usermanager.USER_EDIT_FORM.EMAIL_INPUT));
      let passwordInput = await driver.findElement(By.css(c.SELECTORS.usermanager.USER_EDIT_FORM.PASSWORD_INPUT));
      let submitBtn = await driver.findElement(By.css(c.SELECTORS.usermanager.USER_EDIT_FORM.SUBMIT_BTN));

      await nameInput.sendKeys(newUserData.name);
      await emailInput.sendKeys(newUserData.email);
      await passwordInput.sendKeys(newUserData.password);
      await submitBtn.click();

      await u.w(driver);

      let newUsers = (await driver.findElements(By.css(c.SELECTORS.usermanager.USER)));
      let newNumOfUsers = newUsers.length;

      let found = false;
      for(let i = 0; i<newNumOfUsers; i++){
        if((await newUsers[i].getText())===newUserData.name){
          found = true;
        }
      }
      expect(newNumOfUsers-numOfUsers).to.equal(1)&&
      expect(found).to.be.true;
    });

    it('Редактируется существующий пользователь', async function () {
      await u.login(driver);
      await driver.get(c.SITE_URL+c.PAGE_USERS);
      await u.w(driver);
      let userName = 'testcreateuser';
      let newUserData = {
        name: 'testupdateuser',
        email: 'test1@test.test',
        password: 'secret1'
      };

      let addedUser;
      let existingUsers = await driver.findElements(By.css(c.SELECTORS.usermanager.USER));
      for(let i = 0; i<existingUsers.length; i++){
        if((await existingUsers[i].getText())===userName){
          addedUser = existingUsers[i];
        }
      }
      await driver.executeScript("arguments[0].scrollIntoView()", addedUser);
      await addedUser.click();

      let nameInput = await driver.findElement(By.css(c.SELECTORS.usermanager.USER_EDIT_FORM.NAME_INPUT));
      let emailInput = await driver.findElement(By.css(c.SELECTORS.usermanager.USER_EDIT_FORM.EMAIL_INPUT));
      let passwordInput = await driver.findElement(By.css(c.SELECTORS.usermanager.USER_EDIT_FORM.PASSWORD_INPUT));
      let submitBtn = await driver.findElement(By.css(c.SELECTORS.usermanager.USER_EDIT_FORM.SUBMIT_BTN));
      await nameInput.clear();
      await nameInput.sendKeys(newUserData.name);
      await emailInput.clear();
      await emailInput.sendKeys(newUserData.email);
      await passwordInput.clear();
      await passwordInput.sendKeys(newUserData.password);
      await submitBtn.click();

      await u.w(driver);

      let newUsers = (await driver.findElements(By.css(c.SELECTORS.usermanager.USER)));
      let newNumOfUsers = newUsers.length;
      let found = false;
      for(let i = 0; i<newNumOfUsers; i++){
        if((await newUsers[i].getText())===newUserData.name){
          found = true;
        }
      }
      expect(found).to.be.true;
    });

    it('Меняется статус активности пользователя', async function () {
      await u.login(driver);
      await driver.get(c.SITE_URL+c.PAGE_USERS);
      await u.w(driver);

      let userName = 'testupdateuser';

      let addedUser;
      let existingUsers = await driver.findElements(By.css(c.SELECTORS.usermanager.USER));
      for(let i = 0; i<existingUsers.length; i++){
        if((await existingUsers[i].getText())===userName){
          addedUser = existingUsers[i];
        }
      }

      await driver.executeScript("arguments[0].scrollIntoView()", addedUser);
      await addedUser.click();

      let activeCheckBox = await driver.findElement(By.css(c.SELECTORS.usermanager.USER_EDIT_FORM.ACTIVE_CHECKBOX));
      let submitBtn = await driver.findElement(By.css(c.SELECTORS.usermanager.USER_EDIT_FORM.SUBMIT_BTN));

      await activeCheckBox.click();
      await submitBtn.click();

      await u.w(driver);

      let showInactiveBtn = await driver.findElement(By.css(c.SELECTORS.usermanager.SHOW_INACTIVE_BTN));
      await showInactiveBtn.click();

      await u.w(driver);

      let inactiveUsers = (await driver.findElements(By.css(c.SELECTORS.usermanager.USER_INACTIVE)));
      let inactiveNumOfUsers = inactiveUsers.length;
      let found = false;
      for(let i = 0; i<inactiveNumOfUsers; i++){
        if((await inactiveUsers[i].getText())===userName){
          found = true;
        }
      }
      expect(found).to.be.true;
    });

  });
