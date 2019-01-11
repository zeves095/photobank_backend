import $ from 'jquery';
/**
 * Сервис для получения и обновления данных пользователей
 */
class UserService{

  __construct(){

  }

  /**
   * Запрашивает с сервера данные о пользователях
   */
  static fetchUsers(){
    return new Promise((resolve,reject)=>{
      $.getJSON(window.config.user_get_url).done((data)=>{
        resolve(data);
      }).fail((e)=>{
        reject();
      });
    });
  }

  /**
   * Отправляет одновленную информацию о пользователе/данные для создания нового пользователя
   * @param  {Object} user Данные пользователя
   */
  static submitUser(user){
    return new Promise((resolve, reject)=>{
      user.active = user.active?1:0;
      $.ajax({
        "url":window.config.user_set_url,
        "data":user,
        "method":"POST"
      }).done((data)=>{
        resolve(data);
      }).fail((e)=>{
        reject();
      });
    });
  }

  /**
   * Возвращает пустой объект с полями для создания нового пользователя
   * @param  {Object[]} users Существующие пользователи
   */
  static getBlankUser(users){
    let id = users[users.length-1].id + 1;
    let blankUser = {"id":id, "password":"","name":"", "email":"", "active":true, "role":"ROLE_USER"};
    return blankUser;
  }


}

export {UserService};
