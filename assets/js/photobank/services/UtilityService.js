import {LocalStorageMock} from '../../tests/mockdata/';
import {LocalStorageService} from '../../photobank/services/';

/**
 * Функции-утилиты, которые не подходят в другие сервисы
 */
export default class UtilityService{

  constructor(){
    this.fileHashStack = [];
  }

  static config = {};
  static localStorage = {};

  static fetchConfig(){
    return fetch('/upload/config', {method:"GET"})
    .then(response=>response.json())
    .then((result)=>{
      this.config = result;
      return result;
    })
  }

  static initLocalstorage(){
    if(typeof window ==="undefined"){
      this.localStorage = new LocalStorageMock();
    }else{
      this.localStorage = window.localStorage;
    }
    LocalStorageService.init();
  }

}
