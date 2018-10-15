import $ from 'jquery';

class LocalStorageService{
  constructor(){
  }
  static _getKeys(){
    let keys = {
      "current_node": "pb_data_catalogue_current_node",
      "current_item": "pb_data_current_item",
      "pending_downloads": "pb_data_download_list"
    }
    return keys;
  }
  static init(){
    if(typeof window.localStorage.photobank_data == "undefined"){
      window.localStorage.photobank_data = "set";
      window.localStorage.pb_data_catalogue_current_node = "1";
      window.localStorage.pb_data_current_item = "1";
      window.localStorage.pb_data_downloads = "";
    }
  }

  static set(key, value){
    let keys = this._getKeys();
    if(Object.keys(Object.keys(keys).indexOf(key)) != -1){
      window.localStorage[keys[key]] = value;
    }
  }

  static get(key){
    let keys = this._getKeys();
    if(Object.keys(Object.keys(keys).indexOf(key)) != -1 && typeof window.localStorage[keys[key]] != "undefined"){
      return window.localStorage[keys[key]];
    } else {
      return null;
    }
  }

  static addTo(list, value){
    let keys = this._getKeys();
    if(Object.keys(Object.keys(keys).indexOf(list)) != -1){
      let val = window.localStorage[keys[list]] + " " + value;
      window.localStorage[keys[list]] = val;
    }
  }

  static removeFrom(list, value){
    let keys = this._getKeys();
    if(Object.keys(Object.keys(keys).indexOf(list)) != -1){
      let val = window.localStorage[keys[list]];
      let listArr = val.split(" ");
      let result = "";
      listArr.splice(listArr.indexOf(value),1);
      for(var item in listArr){
        if(listArr[item] == ""){continue}
        result = result + listArr[item]+" ";
      }
      window.localStorage[keys[list]] = result;
    }
  }

}



export {LocalStorageService}
