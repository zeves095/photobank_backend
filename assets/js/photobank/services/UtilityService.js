import $ from 'jquery';
/**
 * Функции-утилиты, которые не подходят в другие сервисы
 */
class UtilityService{

  constructor(){
    this.fileHashStack = [];
  }

  /**
   * Получает роль текцщего пользователя
   */
  static getRole(){
    return new Promise((resolve, reject)=>{
      $.ajax({url: window.config.upload_url, method: 'POST'}).done(()=>{
        resolve(true);
      }).fail(()=>{
        resolve(false);
      });
    });
  }

}

export {UtilityService}
