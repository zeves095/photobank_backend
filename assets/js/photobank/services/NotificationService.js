import $ from 'jquery';

class NotificationService{
  constructor(){
  }
  static _getKeys(){
    let keys = {
      "unknown-error": "Неизвестная ошибка",
      "failed-root-nodes": "Не удалось получить структуру каталога",
      "request-failed": "Ошибка запроса",
      "none-found": "Ничего не найдено",
      "link-copied": "Сcылка скопирована в буфер обмена",
      "dl-queued": "Загрузка поставлена в очередь",
      "dl-done": "Загрузка завершена",
      "up-ready": "Готов к отправке",
      "up-done": "Загрузка на сервер завершена",
      "unfinished-cleared": "Удалены незавершенные загрузки"
    }
    return keys;
  }

  static toast(key){
    let keys = this._getKeys();
    if(Object.keys(keys).indexOf(key) != -1){
      this._makeNotification(keys[key], 0, 3);
    }
  }

  static throw(key){
    let keys = this._getKeys();
    if(Object.keys(keys).indexOf(key) != -1){
      this._makeNotification(keys[key], 1);
    }else{this._makeNotification(keys["unknown-error"], 1);}
  }

  static _makeNotification(text, type ,time=0){
      let id = (((1+Math.random())*0x10000)|0).toString(16).substring(1);
      let overlay = document.getElementById('notification-overlay');
      let notification = document.createElement("div");

      notification.className = "notification notification--"+(type==0?"toast":"error");
      notification.innerHTML = "<button type='button' id='button-"+id+"'><i class='fas fa-times-circle'></i></button><p class='notification__notification-caption'>"+text+"</p>";

      overlay.appendChild(notification);

      let btn = document.getElementById("button-"+id);
      btn.onclick = (e)=>{this._slideOut(notification)};//document.getElementById("notification-"+id))}
      if(time!=0){setTimeout(()=>{this._slideOut(notification)},time*1000)};
  }

  static _slideOut(el){
    el.className += " notification--out";
    setTimeout(()=>{el.parentNode.removeChild(el)}, 400);
  }

}


export {NotificationService}
