import $ from 'jquery';

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
      $.getJSON(window.config.existing_uploads_url+itemId, (data)=>{
        resolve(data);
      }).fail(()=>{
        reject("request-failed");
      });;
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
      //if(finishedPresets.filter((fin_preset)=>{return fin_preset.resource == existing.id}).length >= Object.keys(window.config['presets']).length){resolve(null)}

      for(var preset in window.config['presets']){

        let presetId = window.config['presets'][preset]['id'];
        let resId = existing.id;
        let url = window.config.resource_url + existing.id + "/" + presetId;
        presetItems.push(new Promise((resolvePreset,rejectPreset)=>{
          $.ajax({url: url, method: 'GET'}).done((data)=>{
            if(typeof data.id != "undefined"){
              resolvePreset({
                'id': data.id,
                'resource' : data.gid,
                'preset' : data.preset
              });
            }else{
              resolvePreset(null);
            }
          }).fail(()=>{
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
   * Обновляет метаинформацию ресурса
   * @param  {Object} form Данные формы
   */
  static updateResource(data){
    return new Promise((resolve, reject)=>{
      
      // let data = {
      //   "id" : form.find("input[name='id']").val()
      // };
      // let val = form.find("select, input[type='text'], input[type='hidden']");
      // let chk = form.find("input[type='checkbox']");
      // if(val.length){
      //   val.each(function(){
      //     data[$(this).prop('name')]=$(this).val()
      //   })
      // }
      // if(chk.length){
      //   sel.each(function(){
      //     data[$(this).prop('name')]=$(this).prop("checked")
      //   })
      // }
      // let dataJson = JSON.stringify(data);
      // $.ajax({
      //   url: window.config.resource_url+data.id,
      //   method: 'PATCH',
      //   data: dataJson,
      //   contentType: "application/json; charset=utf-8",
      //   dataType: "json"
      // }).done(()=>{
      //   resolve();
      // }).fail(()=>{
      //   reject("request-failed");
      // });
      //resolve();
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
        $.ajax(resourceLink).done((result)=>{
          resolve(result.gid);
        })
      }).then((gid)=>{
        $.ajax(resourceLink+"/"+gid).done((result)=>{
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
          $.ajax(window.config["resource_url"]+res[r]).done((result)=>{
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
    let link = host+window.config.resource_url+id+(isAjax?"":".jpg");
    return link;
  }

}

export {ResourceService}
