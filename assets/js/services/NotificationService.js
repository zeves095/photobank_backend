import $ from 'jquery';

/**
 * Сервис для отображения сообщений и ошибок пользователю
 */
class NotificationService{
  constructor(){
  }
  /**
   * Возарвщает массив с сообщениями в виде [ключ=>сообщение]
   */
  static _getKeys(){
    let keys = {
      "unknown-error": "Неизвестная ошибка",
      "failed-root-nodes": "Не удалось получить структуру каталога",
      "fetch-nodes-fail": "Не удалось получить структуру каталога",
      "server-error": "Ошибка подключения к серверу",
      "request-failed": "Ошибка запроса",
      "none-found": "Ничего не найдено",
      "ext-not-supported": "Тип файла не поддерживается",
      "user-list": "Ошибка при получения списка пользователей",
      "user-update-failed": "Невозможно обновить пользователя",
      "link-copied": "Сcылка скопирована в буфер обмена",
      "dl-queued": "Загрузка поставлена в очередь",
      "dl-done": "Загрузка завершена",
      "up-ready": "Готов к отправке",
      "up-done": "Загрузка на сервер завершена",
      "unfinished-cleared": "Удалены незавершенные загрузки",
      "user-success":"Пользователь успешно обновлен",
      "link-added":"Ссылка успешно создана",
      "link-add-error":"Ошибка при добавлении ссылки",
      "search-error":"Ошибка поиска",
      "link-fetch-error":"Невозможно получить список ссылок",
      "thumbnail-error":"Невозможно получить изображения ресурсов",
      "clipboard-error":"Скачайте нормальный брузер",
      "remove-upload-error":"Не удалось удалить загрузку",
      "node-update-fail":"Не удалось обновить раздел каталога",
      "node-remove-fail":"Не удалось удалить раздел. Возможно, папка не пуста.",
      "node-create-fail":"Не удалось создать раздел.",
    }
    return keys;
  }

  /**
   * Показывает оповещение
   * @param  {String} key                Ключ сообщения
   * @param  {String} [customMessage=""] Опциональный параметр с произвольным сообщением, не определенным в списке. Для отображение такого сообщения в параметре key должена быть передана строка "custom"
   */
  static toast(key, customMessage = ""){
    let keys = this._getKeys();
    if(key === "custom"){
      this._makeNotification(customMessage, 0, 3);
      return;
    }
    if(Object.keys(keys).indexOf(key) != -1){
      this._makeNotification(keys[key], 0, 3);
    }
  }

  /**
   * Показывает ошибку
   * @param  {String} key                Ключ сообщения
   * @param  {String} [customMessage=""] Опциональный параметр с произвольным сообщением, не определенным в списке. Для отображение такого сообщения в параметре key должена быть передана строка "custom"
   */
  static throw(key, customMessage = ""){
    let keys = this._getKeys();
    if(key === "custom"){
      this._makeNotification(customMessage, 1);
      return;
    }
    if(Object.keys(keys).indexOf(key) != -1){
      this._makeNotification(keys[key], 1);
    }else{this._makeNotification(keys["unknown-error"], 1);}
  }

  /**
   * Создает элемент с оповещением
   * @param  {String} text     текст сообщения
   * @param  {Number} type     Тип сообщения, 0 - сообщение, 1 - ошибка
   * @param  {Number} [time=0] Время, через которое сообщение исчезает в секундах. 0 - не исчезает
   */
  static _makeNotification(text, type ,time=0){
      if (typeof document === 'undefined') {
        return false;
      }
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

  /**
   * Удаляет сообщение, перед этим поставив ему класс для анимации
   * @param  {[type]} el [description]
   * @return {[type]}    [description]
   */
  static _slideOut(el){
    el.className += " notification--out";
    setTimeout(()=>{el.parentNode.removeChild(el)}, 400);
  }

}


export {NotificationService}
