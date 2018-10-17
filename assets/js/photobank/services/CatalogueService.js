import $ from 'jquery';

class CatalogueService{
  constructor(){

  }

  static fetchRootNodes(currentNode = "", prevresult = []){
    let result = prevresult;
    return new Promise((resolve, reject)=>{
      $.getJSON(window.config.get_nodes_url+currentNode).done((data)=>{
        result = result.concat(data);
        if(data.filter((node)=>{return node.parent == null}).length >0){
          //tracked = result.map((res)=>{return res.id});
          resolve(result);
        }

        else if(data.filter((node)=>{return node.parent == 1}).length >0){
          this.fetchRootNodes("", result).then((result)=>{
            resolve(result);
          });
        }

        else{
          this._fetchNodeParent(currentNode).then((parent)=>{
            this.fetchRootNodes(parent,result).then((result)=>{
              resolve(result);
            });
          });
        }
      });
    });
  }

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

  static fetchNodes(data, tracked, node){
    let result = data;
    return new Promise((resolve,reject)=>{
      $.getJSON(window.config.get_nodes_url+node, (nodes)=>{
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

  static fetchLevel(data, currentNode){
    let parent = this._getNodeById(data, currentNode);
    let children = this._getNodeChildren(data, parent);
    return children;
  }

  static getCrumbs(data, currentNode){
    let crumbs = [];
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

  static _fetchNodeParent(id){
    return new Promise((resolve,reject)=>{
      $.getJSON("/catalogue/node/"+id, (data)=>{
        resolve(data.parent);
      }).fail(()=>{
        reject("request-failed");
      });
    });
  }

  static _getNodeParent(data, node){
    for(var i = 0; i<data.length; i++){
      if(node.parent == data[i].id){
        return data[i];
      }
    }
    return null;
  }

  static _getNodeChildren(data, node){
    let children = [];
    for(var i = 0; i<data.length; i++){
      if(node.id == data[i].parent && node.id !== data[i].id){
        children.push(data[i]);
      }
    }
    return children;
  }

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
