import utility from './UtilityService';
import * as constants from '../constants';
/**
 * Сервис для получения и обновления данных по структуре каталога
 */
class CatalogueService{
  constructor(){

  }

  /**
   * Рекурсивно получает структуру каталога от раздела, сохраненного в браузере до верхнего уровня
   * @param  {Number} [currentNode=null] Текущий раздел каталога
   * @param  {Array}  [prevresult=[]] Предыдущий результат выполнения функции
   */
  static fetchRootNodes(currentNode = null, collection, prevresult = []){
    let result = prevresult;
    return new Promise((resolve, reject)=>{
      let searchNode = (currentNode!=null?currentNode:"");
      let url = constants.CATALOGUE_COLLECTION===collection?utility.config.get_nodes_url:utility.config.get_garbage_nodes_url;
      fetch(url+searchNode, {method:"GET"})
      .then(response=>response.json())
      .then((data)=>{
        result = result.concat(data);
        if(currentNode == null){
          resolve(result);
        }
        else{
          this._fetchNodeParent(currentNode, collection)
.then((parent)=>{
            this.fetchRootNodes(parent, collection,result)
.then((result)=>{
              resolve(result);
            });
          });
        }
      });
    });
  }

  /**
   * Запрашивает данные о дочерних элементах каталога от раздела каталога
   * @param {Number} id Код 1С раздела каталога
   */
  static fetchNodes(id, collection){
    return new Promise((resolve,reject)=>{
      let searchNode = (id!=null?id:"");
      let url = constants.CATALOGUE_COLLECTION===collection?utility.config.get_nodes_url:utility.config.get_garbage_nodes_url;
      fetch(url+searchNode,{'method':'GET'})
.then((nodes)=>{
        resolve(nodes);
      })
    });
  }

  /**
   * Получает один уровень разделов каталога
   * @param  {Object[]} data Уже полученная структура каталога
   * @param  {Number} currentNode Текущий выбранный раздел каталога
   *
   * @return {Object[]} Массив разделов каталога, находящихся на уровне каталога
   */
  static fetchLevel(data, currentNode){

    let parent = this._getNodeById(data, currentNode);
    let children = this._getNodeChildren(data, parent);
    return children;
  }

    /**
     * Строит структуру каталога для отображения через компонент jstree
     * @param  {Object[]} data Данные каталога
     * @param  {Number} currentNode Идентификатор текущего выбранного раздела каталога
     *
     * @return {Object} Данные для отображения в компоненте jstree
     */
    static makeTree(data, currentNode){
      let tree={ core: { data: [] }, 'selected':[]};
      let nodeToOpen;
      data.forEach((item)=>{
        let node = {
          'text':item.name,
          'parent':item.parent||"#",
          'id':item.id,
          'li_attr':{class:item.deleted?"deleted":""},
          'state':{
            'selected':currentNode===item.id,
            'opened':currentNode===item.id,
          }
        };
        tree['core']['data'].push(node);
        if(node['state']['selected']===true){
          nodeToOpen = node;
        }
      });
      while(typeof nodeToOpen != "undefined"){
        nodeToOpen['state']['opened'] = true;
        nodeToOpen = tree['core']['data'].find((parent)=>{return parent.id === nodeToOpen.parent});
      }
      return tree;
    }

  /**
   * Получает список хлебных крошек из имеющейся структуры каталога и текущего выбранного раздела каталога
   * @param  {Object[]} data Уже полученная структура каталога
   * @param  {Number} currentNode Текущий выбранный раздел каталога
   *
   * @return {Object[]} Массив из последовательности разделов катталога к верхенему уровню
   */
  static getCrumbs(data, currentNode){
    let crumbs = [];
    let cur_node = this._getNodeById(data, currentNode);
    if(cur_node == null){return crumbs;}
    cur_node.active = true;
    crumbs.push(cur_node);
    while(this._getNodeParent(data, cur_node) != cur_node && this._getNodeParent(data, cur_node)!= null){
      let parent = this._getNodeParent(data, cur_node);
      parent.active = false;
      crumbs.push(parent);
      cur_node = this._getNodeById(data, parent.id);
    }
    return crumbs.reverse();
  }

  /**
   * Получает родительский раздел каталога по идентификатору дочернего с сервера
   * @param  {Number} id Идентификатор дочернего разделы каталога
   */
  static _fetchNodeParent(id, collection){
    return new Promise((resolve,reject)=>{
      let url = collection==0?utility.config.get_node_url:utility.config.get_garbage_node_url;
      fetch(url+id,{method:"GET"})
      .then(response=>response.json())
      .then((data)=>{
        resolve(data.parent);
      }).catch(()=>{
        reject("request-failed");
      });
    });
  }

  /**
   * Получает родительский раздел каталога по идентификатору дочернего из имеющихся данных
   * @param  {Object[]} data Уже полученная структура каталога
   * @param  {Object} node Объект дочернего ресурса каталога
   *
   * @return {Object} Родительский ресурс
   */
  static _getNodeParent(data, node){
    for(var i = 0; i<data.length; i++){
      if(node.parent == data[i].id){
        return data[i];
      }
    }
    return null;
  }

  /**
   * Получает список дочерних ресурсов от раздела каталога
   * @param  {Object[]} data Уже полученная структура каталога
   * @param  {Object} node Объект родительского ресурса
   *
   * @return {Object[]} Дочерние разделы каталога
   */
  static _getNodeChildren(data, node){
    let children = [];
    let nodeId = null;
    if(node != null){nodeId = node.id;}
    for(var i = 0; i<data.length; i++){
      if(nodeId == data[i].parent && nodeId !== data[i].id){
        children.push(data[i]);
      }
    }
    return children;
  }

  /**
   * Полуачет объект раздела каталога по его идентификатору
   * @param  {Object} data Уже полученная структура каталога
   * @param  {Number} id Идентификатор раздела каталога
   * @return {Object} Объект раздела каталога
   */
  static _getNodeById(data, id){
    for(var i = 0; i<data.length; i++){
      if(id == data[i].id){
        return data[i];
      }
    }
    return null;
  }

}

export {CatalogueService}
