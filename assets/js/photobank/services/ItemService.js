import {ItemQueryObject} from './ItemQueryObject';
import $ from 'jquery';

/**
 * Сервис для получения и обновления данных о товарах каталога
 */
class ItemService{
  constructor(){

  }
  /**
   * Получает список товаров, при необходимости запрашивает с сервера, фильтрует полученные данные
   * @param  {ItemQueryObject}  query  Объект поискового запроса
   * @param  {String}  filter Значение фильтра
   * @param  {Object}  items  Уде полученный список товаров
   * @param  {Boolean} [need_refresh=true] Необходимость повторного обращения к серверу
   */
  static fetchItems(query){
    return new Promise((resolve, reject)=>{
        this._getItems(query).then((data)=>{
          if(data.length == 0){reject("none-found")}
          resolve(data);
        }).catch((e)=>{
          reject("none-found");
        });
    });
  }

  /**
   * Получает все данные товара каталога по его идентификатору
   * @param  {Number} id Идентификатор товара
   */
  static getIdentity(id){
    return new Promise((resolve,reject)=>{
        $.ajax({url: window.config['item_url']+id, method: 'GET'}).done((data)=>{
          resolve(data);
        });
    });
  }

  /**
   * Получает с сервера список товаров по поисковому объекту
   * @param  {ItemQueryObject}  queryObject  Объект поискового запроса
   */
  static _getItems(queryObject){
    return new Promise((resolve,reject)=>{
      if(!queryObject instanceof ItemQueryObject){reject("Invalid query object")}
      if(queryObject.nodeId != null){
        $.getJSON(window.config.get_items_url+queryObject.nodeId, (data)=>{
          resolve(data);
        }).fail((e)=>{reject([])});
      }else{
        let data = {"item_search_name":queryObject.name,"item_search_code":queryObject.code,"item_search_parent_name":queryObject.parent_name,"item_search_search_nested":queryObject.search_nested, "item_search_article":queryObject.article}
        $.get(window.config.item_search_url,data).done((data)=>{
          resolve(data);
        }).fail((e)=>{reject([])});
      }
    })
  }

  /**
   * Фильтрует полученные данные
   * @param  {Object[]} data Данные о товарах
   * @param  {String} query Строка фильтра
   */
  static _filterData(data, query){
    let filtered = [];
    if(query == ""){
      filtered = data;
    } else {
      filtered = data.filter((item)=>{return item.itemCode.toLowerCase().includes(query.toLowerCase()) || item.name.toLowerCase().includes(query.toLowerCase())});
    }
    return filtered;
  }

}

export {ItemService}
