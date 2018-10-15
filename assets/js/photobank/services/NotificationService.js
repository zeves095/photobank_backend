import $ from 'jquery';

class NotificationService{
  constructor(){
  }
  static _getKeys(){
    let keys = {
      "unknown-error": "Неизвестная ошибка",
      "failed-root-nodes": "Не удалось получить структуру каталога",
      "request-failed": "Ошибка запроса",
    }
    return keys;
  }

  static toast(key){

  }

  static throw(key){
    console.log(key);
    let keys = this._getKeys();
    if(Object.keys(keys).indexOf(key) != -1){
      alert(keys[key]);
    }else{alert(keys["unknown-error"])}
  }

}



export {NotificationService}
