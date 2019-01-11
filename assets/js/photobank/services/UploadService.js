import $ from 'jquery';
import { hex_md5 } from '../../vendor/md5';

/**
 * Сервис для работы с загрузками на сервер
 */
class UploadService{

  constructor(){
    this.fileHashStack = [];
  }

  /**
   * Получает список товаров каталога, для которых есть начатые, но не законченные загрузки
   */
  static fetchUnfinishedItems(){
    let items = [];
    return new Promise((resolve, reject)=>{
      let unfinishedResponse = this._getAllUnfinished();
      unfinishedResponse.then((data)=>{
        for (var i = 0; i < data.length; i++) {
          let unfinishedUpload = data[i];
          if(typeof window.resumableContainer[unfinishedUpload[0]] == 'undefined' && items.indexOf(unfinishedUpload[0])==-1){
            items.push(unfinishedUpload[0]);
          }
        }
        resolve(items);
      });
    });
  }

  /**
   * Получает список начатых, но не законченных загрузок для конкретного товара
   * @param  {Object} item Объект товара, для которого необходимо найти незаконченные загрузки
   * @param  {Object[]} existing Массив объектов загруженных на сервер ресурсов
   */
  static fetchUnfinished(item, existing){
    let unfinished = [];
    return new Promise((resolve, reject)=>{
      let unfinishedResponse = this._getAllUnfinished();
      unfinishedResponse.then((data)=>{
        for (var i = 0; i < data.length; i++) {
          let unfinishedUpload = data[i];
          if(unfinishedUpload[0]==item){
            unfinished.push({'filename': unfinishedUpload[1], 'filehash': unfinishedUpload[2], 'class': "unfinished", "ready": true, "completed":unfinishedUpload[3],"total":unfinishedUpload[4]});
          }
        }
        let unfinished_filtered = unfinished.filter((unfinished)=>{
          return existing.filter((upload)=>{return upload.filehash == unfinished.filehash}).length == 0;
        })
        resolve(unfinished_filtered);
      });
    });
  }

  /**
   * Удаляет загрузки из списка незавершенных, если они были продолжены
   * @param  {Object[]} unfinished Массив объектов незаконченных загрузок
   * @param  {Object[]} pending Массив загрузок, готовых к отправке
   * @return {Object[]} Массив незаконченных загрузок, для которых нет соответствующего говотого к отправке файла
   */
  static resolveResumed(unfinished, pending){
    let resolved = unfinished.filter((unfin)=>{
      for(var i = 0; i<pending.length; i++){
        if(unfin.filename == pending[i].fileName && unfin.filehash == pending[i].uniqueIdentifier){
          return false;
        }
      }
      return true;
    });
    return resolved;
  }

  /**
   * Выполняет обработку файла перед загрузкой на сервер
   * @param  {string} file Содержание файла, который нужно отправить на сервер
   * @param  {Object[]} existingUploads Массив сужествующих готовых к отправке файлов
   */
  static processFile(file, existingUploads){
    return new Promise((resolve, reject)=>{
      let hashResponse = this._getHash(file);
      hashResponse.then((filehash)=>{
        file.uniqueIdentifier = filehash;
        this._commitUpload(file, existingUploads).then((response)=>{
          resolve();
        });
      });
    });
  }

  /**
   * Удаляет запись о незаконченной загрузке с сервера
   * @param  {string} filehash Уникальная строка-идентификатор файла
   * @param  {string} itemId Код 1С товара
   */
  static deleteUpload(filehash, itemId){
    return new Promise((resolve, reject)=>{
      let obj = {
        'filehash': filehash,
        'itemid': itemId
      }
      $.ajax({url: window.config.remove_upload_url, method: 'POST', data: obj}).done(()=>{
        resolve();
      });
    });
  }

  /**
   * Получает сгенерированный ключ md5 для загружаемого файла
   * @param  {string} file Содержание файла, который нужно отправить на сервер
   */
  static _getHash(file){
    return new Promise((resolve, reject)=>{
      let fileObj = file.file;
      let reader = new FileReader();
      reader.onload = (e)=>{
        let hashable = e.target.result;
        hashable = new Uint8Array(hashable);
        hashable = CRC32.buf(hashable).toString();
        let identifier = hex_md5(hashable+file.itemId + file.file.size)
        resolve(identifier);
      };
      reader.readAsArrayBuffer(fileObj);
    });
  }

  /**
   * Отправляет запрос на создание записи о начатой загрузке на сервер
   * @param  {string} file Содержание файла, который нужно отправить на сервер
   * @param  {Object[]} existingUploads Массив существующих готовых к отправке файлов
   */
  static _commitUpload(file, existingUploads){
    return new Promise((resolve, reject)=>{
      let allowed = true;
      let self = existingUploads.indexOf(file);
      for(var existingUpload in existingUploads){
        if(existingUploads[existingUpload].uniqueIdentifier == file.uniqueIdentifier && existingUpload != self){
          allowed = false;
          existingUploads.splice(self, 1);
          resolve(false);
        }
      }
      if(allowed){
        file.ready = true;
        let obj = {
          'filehash': file.uniqueIdentifier,
          'filename': file.fileName,
          'itemid': file.itemId,
          'totalchuks': file.chunks.length
        }
        $.ajax({url: window.config.commit_upload_url, method: 'POST', data: obj}).done(()=>{
          resolve(true);
        });
      }
    });
  }

  /**
   * Получает полный список незавершенных загрузок с сервера
   */
  static _getAllUnfinished(){
    return new Promise((resolve, reject)=>{
      $.getJSON(window.config.unfinished_uploads_url, (data)=>{
        resolve(data);
      });
    });
  }

}

export {UploadService}
