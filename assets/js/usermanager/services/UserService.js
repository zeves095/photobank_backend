import utility from '../../photobank/services/UtilityService';
/**
 * Сервис для получения и обновления данных пользователей
 */
class UserService{

  __construct(){
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
