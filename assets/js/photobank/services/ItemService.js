import {ItemQueryObject} from './ItemQueryObject';
import $ from 'jquery';

class ItemService{
  constructor(){

  }

  static fetchItems(query, filter){
    return new Promise((resolve, reject)=>{
      let searchResponse = this._getItems(query);
      searchResponse.then((data)=>{
        let dataFiltered = this._filterData(data, filter);
        resolve(dataFiltered);
      });
    });
  }

  static getIdentity(id){
    return new Promise((resolve,reject)=>{
        $.ajax({url: window.config['item_url']+id, method: 'GET'}).done((data)=>{
          resolve(data);
        });
    });
  }

  static _getItems(queryObject){
    return new Promise((resolve,reject)=>{
      if(!queryObject instanceof ItemQueryObject){reject("Invalid query object")}
      $.getJSON(window.config.get_items_url+queryObject.getNodeId(), (data)=>{
        resolve(data);
      });
    })
  }

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
