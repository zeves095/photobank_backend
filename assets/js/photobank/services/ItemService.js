import {ItemQueryObject} from './ItemQueryObject';
import $ from 'jquery';

class ItemService{
  constructor(){

  }

  static fetchItems(query, filter, items,need_refresh = true){
    return new Promise((resolve, reject)=>{
      if(!need_refresh){
        let dataFiltered = this._filterData(items, filter);
        resolve([items, dataFiltered]);
      }else{
        this._getItems(query).then((data)=>{
          if(data.length == 0){reject("none-found")}
          let dataFiltered = this._filterData(data, filter);
          resolve([data, dataFiltered]);
        }).catch((e)=>{
          reject("none-found");
        });
      }
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
      if(queryObject.nodeId != null){
        $.getJSON(window.config.get_items_url+queryObject.nodeId, (data)=>{
          resolve(data);
        }).fail((e)=>{reject([])});
      }else{
        let data = {"name":queryObject.name,"code":queryObject.code,"parent_name":queryObject.parent_name,"search_nested":queryObject.search_nested}
        $.get(window.config.item_search_url,data).done((data)=>{
          resolve(data);
        }).fail((e)=>{reject([])});
      }
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
