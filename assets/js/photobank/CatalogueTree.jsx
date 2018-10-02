import React from 'react';
// import $ from 'jquery';
import TreeView from 'react-simple-jstree';
export class CatalogueTree extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": [],
      "catalogue_list": [],
      "catalogue_tree": {},
      "tracked_nodes": [],
      "current_node": 1,
      "crumbs": [],
      "view": this.props.default_view
    }
    this.getCatalogueNodes = this.getCatalogueNodes.bind(this);
    this.getNodeById = this.getNodeById.bind(this);
    this.getNodeParent = this.getNodeParent.bind(this);
    this.populateCatalogue = this.populateCatalogue.bind(this);
    this.getNodeLevel = this.getNodeLevel.bind(this);
    this.getCrumbs = this.getCrumbs.bind(this);
    this.nodeChoiceHandler = this.nodeChoiceHandler.bind(this);
    this.makeTree = this.makeTree.bind(this);
    this.handleTreeClick = this.handleTreeClick.bind(this);
    this.handleViewChoice = this.handleViewChoice.bind(this);
  }

  getCatalogueNodes(data){
    $.getJSON(window.config.get_nodes_url+this.state.current_node, (data)=>{
      let cat_data = [];
      for(var node in data){
        if(this.state.tracked_nodes.indexOf(data[node].id) == -1){
          cat_data.push(data[node]);
          this.state.tracked_nodes.push(data[node].id);
        }
      }
      if(cat_data.length>0){
        this.setState({
          "catalogue_data": this.state.catalogue_data.concat(cat_data)
        });
      }
      this.populateCatalogue();
    });
  }

  populateCatalogue(){
    let element = [];
    let parent = this.getNodeById(this.state.current_node);
    let children = this.getNodeChildren(parent);
    for(var i = 0; i<children.length; i++){
      let child = children[i];
      element.push(
        <div key={child.id} className="list-view__cat_item list-view__cat_item--parent" onClick={this.nodeChoiceHandler} data-node={child.id}><b data-node={child.id}>{child.name}</b></div>
      );
    }
    let catalogueList = element;
    this.setState({
      "catalogue_list": catalogueList
    });
    this.getCrumbs();
    this.props.crumb_handler(this.state.crumbs);
    this.makeTree();
  }

  makeTree(){
    let tree={ core: { data: [] }, 'selected':[]};
    for(var node in this.state.catalogue_data){
      let item = this.state.catalogue_data[node];
      let treeNode ={
        'text':"",
        'parent':"",
        'state':{
          'selected':false,
          'opened':true
        }
      };
      if(item.id == this.state.current_node){
        tree['selected'] = [item.id];
        treeNode['state']['selected'] = true;
        let nodeToOpen = item;
        let bugCounter = 0;
        while(nodeToOpen.parent != null && nodeToOpen.parent != 1 && nodeToOpen.parent != "#"){
          treeNode['state']['opened'] = true;
          nodeToOpen = this.state.catalogue_data.filter((datum)=>{return datum.id == nodeToOpen.parent})[0];
          if(bugCounter++ >= 200){
            alert('AHTUNG!!!!');
            break;
          }
        }
      }
      treeNode.text = item.name;
      treeNode.parent = item.parent;
      if(treeNode.parent == null){
        treeNode.parent = "#";
      }
      treeNode.id = item.id;
      tree['core']['data'].push(treeNode);
    }
    this.setState({
      'catalogue_tree': tree
    });
  }

  getCrumbs(){
    let crumbs = [];
    let cur_node = this.getNodeById(this.state.current_node);
    cur_node.active = true;
    crumbs.push(cur_node);
    while(this.getNodeParent(cur_node) != cur_node && this.getNodeParent(cur_node)!= null){
      let parent = this.getNodeParent(cur_node);
      parent.active = false;
      crumbs.push(parent);
      cur_node = this.getNodeById(parent.id);
    }
    this.state.crumbs = crumbs;
    crumbs = crumbs.map((crumb)=><span key={crumb.name} data-node={crumb.id} className={crumb.active?"crumbs__crumb crumbs__crumb--active":"crumbs__crumb"} onClick={this.nodeChoiceHandler}>{crumb.name}</span>);
    crumbs.reverse();
    this.state.crumbs_list = crumbs;
  }

  getNodeParent(node){
    for(var i = 0; i<this.state.catalogue_data.length; i++){
      if(node.parent == this.state.catalogue_data[i].id){
        return this.state.catalogue_data[i];
      }
    }
    return null;
  }

  getNodeChildren(node){
    let children = [];
    for(var i = 0; i<this.state.catalogue_data.length; i++){
      if(node.id == this.state.catalogue_data[i].parent && node.id !== this.state.catalogue_data[i].id){
        children.push(this.state.catalogue_data[i]);
      }
    }
    return children;
  }

  getNodeById(id){
    for(var i = 0; i<this.state.catalogue_data.length; i++){
      if(id == this.state.catalogue_data[i].id){
        return this.state.catalogue_data[i];
      }
    }
    return null;
  }

  getNodeLevel(node){
    if(node.parent !== 0){
      return this.getNodeLevel(this.getNodeParent(node))+1;
    }
    return 0;
  }

  nodeChoiceHandler(e){
    e.stopPropagation();
    let curr_id = e.target.getAttribute('data-node');
    this.state.current_node = curr_id;
    this.getCatalogueNodes(this.props.catalogue_data);
    this.props.nodeChoiceHandler(curr_id);
  }

  handleTreeClick(e,data){
    if(data.selected[0] != this.state.current_node && data.action == "select_node"){
      this.state.current_node = data.selected[0];
      this.getCatalogueNodes(this.props.catalogue_data);
      this.props.nodeChoiceHandler(data.selected[0]);
    }
  }

  componentDidUpdate(prevProps){
    if(this.props.catalogue_data != prevProps.catalogue_data){
      this.state.catalogue_data = this.props.catalogue_data;
      this.getCatalogueNodes();
    }
  }

  handleViewChoice(e){
    let view = $(e.target).attr("data-view");
    this.setState({'view':view});
  }

  render() {
    return (
      <div className="catalogue-tree">
        <h2 className="catalogue-tree__component-title component-title">Каталог<span className="component-title__view-icons"><i className="fas fa-sitemap" data-view="2" onClick={this.handleViewChoice}></i><i className="fas fa-list" data-view="1" onClick={this.handleViewChoice}></i></span></h2>
        <div>
          <div className="catalogue-tree__crumbs crumbs">
            {this.state.crumbs_list}
          </div>
          <div className="catalogue-tree__view-inner view-inner">
            <div className="view-inner__list-view list-view">
              {this.state.view==1?this.state.catalogue_list:""}
            </div>
            <div className="view-inner__tree-view">
              {this.state.view==2?<TreeView treeData={this.state.catalogue_tree} onChange={this.handleTreeClick} />:""}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
