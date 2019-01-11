// TODO убрать джейквеееееееерииии
import $ from 'jquery';

/**
 * Сервис для получения и обновления данных по структуре каталога
 */
class CatalogueService{
  constructor(){

  }

  /**
   * Рекурсивно получает структуру каталога от раздела, сохраненного в браузере до верхнего уровня
   * @param  {int} [currentNode=null] Текущий раздел каталога
   * @param  {Array}  [prevresult=[]] Предыдущий результат выполнения функции
   */
  static fetchRootNodes(currentNode = null, prevresult = []){
    let result = prevresult;
    return new Promise((resolve, reject)=>{
      let searchNode = (currentNode!=null?currentNode:"");
      $.getJSON(window.config.get_nodes_url+searchNode).done((data)=>{
        result = result.concat(data);
        if(currentNode == null){
          resolve(result);
        }

        else{
          this._fetchNodeParent(currentNode).then((parent)=>{
            //if(parent == null){parent = "";}
            this.fetchRootNodes(parent,result).then((result)=>{
              resolve(result);
            });
          });
        }
      });
    });
  }

  /**
   * Строит структуру каталога для отображения через компонент jstree
   * @param  {Object[]} data Данные каталога
   * @param  {int} currentNode Идентификатор текущего выбранного раздела каталога
   *
   * @return {Object} Данные для отображения в компоненте jstree
   */
  static makeTree(data, currentNode){
    let tree={ core: { data: [] }, 'selected':[]};
    for(var node in data){
      let item = data[node];
      let treeNode ={
        'text':item.name,
        'parent':item.parent,
        'id':item.id,
        'state':{
          'selected':false,
          'opened':false
        }
      };
      if(treeNode.parent == null){
        treeNode.parent = "#";
      }
      tree['core']['data'].push(treeNode);
    }
    for(var node in tree['core']['data']){
      let treeNode = tree['core']['data'][node];
      if(treeNode.id == currentNode){
        tree['selected'] = [treeNode.id];
        treeNode['state']['selected'] = true;
        treeNode['state']['opened'] = true;
        let nodeToOpen = treeNode;
        let bugCounter = 0;
        while(typeof nodeToOpen != "undefined"){
          nodeToOpen['state']['opened'] = true;
          nodeToOpen = tree['core']['data'].filter((datum)=>{return datum.id == nodeToOpen.parent})[0];
        }
      }
    }
    return tree;
  }

  /**
   * Запрашивает данные о дочерних элементах каталога от раздела каталога
   * @param  {Object[]} data Уже полученная структура каталога
   * @param  {int[]} tracked Список разделов каталога, по которым уже есть данные
   * @param  {int} node Идентификатор раздела каталога, дочерние элементы которого необходимо найти
   */
  static fetchNodes(data, tracked, node){
    let result = data;
    return new Promise((resolve,reject)=>{
      let searchNode = (node!=null?node:"");
      $.getJSON(window.config.get_nodes_url+searchNode, (nodes)=>{
        let cat_data = [];
        for(var node in nodes){
          if(tracked.indexOf(nodes[node].id) == -1){
            cat_data.push(nodes[node]);
            tracked.push(nodes[node].id);
          }
        }
        if(cat_data.length>0){
          result = result.concat(cat_data);
        }
        resolve(result);
      }).fail(()=>{
        reject("request-failed");
      });
    });
  }

  /**
   * Получает один уровень разделов каталога
   * @param  {Object[]} data Уже полученная структура каталога
   * @param  {int} currentNode Текущий выбранный раздел каталога
   *
   * @return {Object[]} Массив разделов каталога, находящихся на уровне каталога
   */
  static fetchLevel(data, currentNode){

    let parent = this._getNodeById(data, currentNode);
    let children = this._getNodeChildren(data, parent);
    return children;
  }

  /**
   * Получает список хлебных крошек из имеющейся структуры каталога и текущего выбранного раздела каталога
   * @param  {Object[]} data Уже полученная структура каталога
   * @param  {int} currentNode Текущий выбранный раздел каталога
   *
   * @return {Object[]} Массив из последовательности разделов катталога к верхенему уровню
   */
  static getCrumbs(data, currentNode){
    let crumbs = [];
    if(currentNode == null){return crumbs;}
    let cur_node = this._getNodeById(data, currentNode);
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
   * @param  {int} id Идентификатор дочернего разделы каталога
   */
  static _fetchNodeParent(id){
    return new Promise((resolve,reject)=>{
      $.getJSON("/catalogue/node/"+id, (data)=>{
        resolve(data.parent);
      }).fail(()=>{
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
   * @param  {int} id Идентификатор раздела каталога
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
