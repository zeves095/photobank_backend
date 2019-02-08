import utility from '../photobank/services/UtilityService';

/**
 * Сервис для получения и обновления данных по ресурсам
 */
class ResourceService{
  constructor(){
  }

  /**
   * Запрашивает список существующих ресурсов для товара
   * @param  {String} itemId Идентификатор товара
   */
  static fetchExisting(itemId){
    return new Promise((resolve, reject)=>{
      fetch(utility.config.existing_uploads_url+itemId, {method: "GET"})
      .then(response=>response.json())
      .then((data)=>{
        resolve(data);
      }).catch((e)=>{
        console.log(e);
        reject("request-failed");
      });
    })
  }

  /**
   * Получает все сгенерированные пресеты для товара, с ограничением по первому и последнему ресурсу из списка
   * @param  {Object} pagination Параметры пагинации
   * @param  {Object[]} existing Список существующих ресурсов товара
   */
  static fetchExistingPresets(pagination, existing){
    let presets = [];
    let resources = existing.slice(pagination.start, pagination.end).map(res=>res.id);
    return fetch("/catalogue/node/item/resources/presets/", {method: 'POST',body:JSON.stringify(resources)})
    .then(response=>response.json())
    .then((data)=>{
      return data;
    }).catch((e)=>{
      console.log(e);
      reject("request-failed");
    });
  }

  /**
   * Осуществляет скачивание ресурсов в браузере клиента
   * @param  {Number[]} resources Список ресурсов, изображения которых нужно скачать
   */
  static downloadResource(resources){
    if(!Array.isArray(resources)){resources = [resources]}
    let anchor = document.createElement('a');
    anchor.setAttribute('download', null);
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    for (var i = 0; i < resources.length; i++) {
      let link = this._getLinkById(resources[i]);
      anchor.setAttribute('href', link);
      anchor.click();
    }
    document.body.removeChild(anchor);
  }

  /**
   * Копирует ссылку наресурс для авторизованных пользователей в буфер обмена клиента
   * @param  {Number} id Идентификатор ресурса
   */
  static copyLinkToClipboard(id){
    let link = this._getLinkById(id);
    navigator.clipboard.writeText(link);
  }

  /**
   * Открывает изображение ресурса в отдельной вкладке
   * @param  {Number} id Идентификатор ресурса
   */
  static openInTab(id){
    let link = this._getLinkById(id);
    window.open(link)
  }

  /**
   * Получает ссылку на пресет типа thumbnail ресурса для авторизованного пользователя
   * @param  {Number} id Идентификатор ресурса
   */
  static fetchThumbnailLink(id){
    let resourceLink = this._getLinkById(id, true);
    return new Promise((resolve, reject)=>{
      new Promise((resolve,reject)=>{
        fetch(resourceLink,{method:"GET"})
        .then(response=>response.json())
        .then((result)=>{
          resolve(result.gid);
        })
      }).then((gid)=>{
        fetch(resourceLink,{method:"GET"}+"/"+gid)
        .then(response=>response.json())
        .then((result)=>{
          resolve(this._getLinkById(result.id, true));
        })
      })
    });
  }

  /**
   * Получает данные по ресурсу с сервера
   * @param  {Number} res Идентификатор ресурса
   */
  static getResource(res){
    if(!Array.isArray(res)){res = [res]}
    let resourceIterable = [];
    return new Promise((resolve,reject)=>{
      for(var r in res){
        if(res[r] == ""){continue}
        resourceIterable.push(new Promise((resolve,reject)=>{
          fetch(utility.config["resource_url"]+res[r], {method:"GET"})
          .then(response=>response.json())
          .then((result)=>{
            resolve(result);
          });
        }));
      }
      Promise.all(resourceIterable).then((results)=>{
        resolve(results);
      });
    })
  }

  /**
   * Получает ссылку на ресурс для авторизованного пользователя по идентификатору ресурса
   * @param  {Number}  id             Идентификатор ресурса
   * @param  {Boolean} [isAjax=false] true - получить JSON с информацией по ссылке, false - получить изображение по ссылке
   */
  static _getLinkById(id, isAjax = false){
    let href = window.location.href.split("/");
    let host = href[0] + "//" + href[2]
    let link = host+utility.config.resource_url+id+(isAjax?"":".jpg");
    return link;
  }

}

export {ResourceService}
