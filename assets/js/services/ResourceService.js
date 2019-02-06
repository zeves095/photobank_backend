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
   * @param  {String} itemId          Идентификатор товара
   * @param  {Object[]} existing        Список существующих ресурсов товара
   * @param  {Number} start           Индекс начала списка товаров, для которых нужны пресеты
   * @param  {Number} end             Индекс конца списка товаров, для которых нужны пресеты
   * @param  {Object[]} finishedPresets Уже запрошенные и полученные пресеты
   */
  static fetchExistingPresets(pagination, existing){
    let presets = [];
    return new Promise((resolve,reject)=>{
      if(existing.length==0){resolve([])}
      let presetIterable = [];
      for(var i = pagination.start; i<pagination.end; i++){
        if(typeof existing[i] != "undefined"){
          presetIterable.push(this._getFinishedPresets(existing[i]));
        }
      }
      Promise.all(presetIterable).then((data)=>{
        for(var item in data){
          if(data[item]!=null){
            presets = presets.concat(data[item]);
          }
        }
        // presets = presets.filter((preset)=>{
        //   for(var fin in finishedPresets){
        //      if(preset.preset==finishedPresets[fin].preset&&finishedPresets[fin].resource==preset.resource){
        //        return false;
        //      }
        //   }
        //   return true;
        // });
        resolve(presets);
      }).catch((e)=>{
        reject(e);
      });
    });
  }

  /**
   * Запрашивает обработанные пресеты с сервера для одного ресурса
   * @param  {Object[]} existing        Список существующих ресурсов товара
   * @param  {Number} id              Идентификатор ресурса
   * @param  {Object[]} finishedPresets Уже запрошенные и полученные пресеты
   */
  static _getFinishedPresets(existing){
    let presetItems = [];
    let presets = [];
    return new Promise((resolve, reject)=>{
      if(typeof existing == 'undefined'){resolve(null)}
      //if(finishedPresets.filter((fin_preset)=>{return fin_preset.resource == existing.id}).length >= Object.keys(utility.config['presets']).length){resolve(null)}

      for(var preset in utility.config['presets']){

        let presetId = utility.config['presets'][preset]['id'];
        let resId = existing.id;
        let url = utility.config.resource_url + existing.id + "/" + presetId;
        presetItems.push(new Promise((resolvePreset,rejectPreset)=>{
          fetch(url, {method: 'GET'})
          .then(response=>response.json())
          .then((data)=>{
            if(typeof data.id != "undefined"){
              resolvePreset({
                'id': data.id,
                'resource' : data.gid,
                'preset' : data.preset
              });
            }else{
              resolvePreset(null);
            }
          }).catch((e)=>{
            console.log(e);
            reject("request-failed");
          });
        }))
      }
      Promise.all(presetItems).then((result)=>{
        for(var i = 0; i<result.length; i++){
          if(result[i] !=  null){
            presets.push(result[i]);
          }
        }
        resolve(presets);
      });
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
