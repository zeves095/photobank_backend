import React from 'react';
// import $ from 'jquery';
import TreeView from 'react-simple-jstree';
import {ItemQueryObject} from './services/ItemQueryObject';
import {CatalogueService} from './services/CatalogueService';
export class CatalogueTree extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": [],
      "catalogue_list": [],
      "catalogue_tree": {},
      "tracked_nodes": [],
      "current_node": 0,
      "crumbs": [],
      "view": this.props.default_view,
      "loading": false,
      "draw_tree":false
    }
    this.getCatalogueNodes = this.getCatalogueNodes.bind(this);
    this.getCrumbs = this.getCrumbs.bind(this);
    this.listClickHandler = this.listClickHandler.bind(this);
    this.handleTreeClick = this.handleTreeClick.bind(this);
    this.handleViewChoice = this.handleViewChoice.bind(this);
    this.traverseUp = this.traverseUp.bind(this);
  }

  getCatalogueNodes(){
    this.setState({"loading":true});
    let nodesResponse = CatalogueService.fetchNodes(this.state.catalogue_data, this.state.tracked_nodes, this.state.current_node);
    nodesResponse.then((cat_data)=>{
      this.setState({
        "catalogue_data": cat_data,
        "draw_tree":true,
        "loading":false
      });
    });
  }

  getCrumbs(){
    let crumbs = CatalogueService.getCrumbs(this.state.catalogue_data, this.state.current_node);
    this.setState({
      "crumbs" : crumbs
    });
    this.props.crumb_handler(crumbs);
  }

  listClickHandler(e){
    e.stopPropagation();
    let curr_id = e.target.getAttribute('data-node');
    this.chooseNode(curr_id);
  }

  handleTreeClick(e,data){
    if(data.selected[0] != this.state.current_node && data.action == "select_node"){
      this.chooseNode(data.selected[0]);
    }
  }

  chooseNode(id){
    this.setState({
      "current_node" : id
    });
    let queryObject = new ItemQueryObject(id);
    this.props.queryHandler(queryObject);
  }

  componentWillMount(){
    let rootResponse = CatalogueService.fetchRootNodes();
    rootResponse.then((data)=>{
      let currentNode = data[0].id;
      this.setState({
        "current_node": currentNode,
        "catalogue_data": data,
      });
    });
  }

  componentDidUpdate(prevProps,prevState){
    if(this.state.current_node != prevState.current_node){
      this.getCatalogueNodes();
      this.getCrumbs();
    }
  }

  handleViewChoice(e){
    let view = $(e.target).attr("data-view");
    this.setState({'view':view});
  }

  traverseUp(){
    let curNode = this.state.catalogue_data.filter((node)=>{return parseInt(node.id)==parseInt(this.state.current_node)})[0];
    if(typeof curNode!= "undefined"&&curNode.parent != null){
      this.setState({
        "current_node" : curNode.parent
      });
      this.props.nodeChoiceHandler(curNode.parent);
    }
  }

  render() {
    // if(this.state.current_node==0){return null}
    let tree = {};
    let list = [];
    if(this.state.view==2){
        tree=CatalogueService.makeTree(this.state.catalogue_data, this.state.current_node);
    }
    if(this.state.view==1){
      let children = CatalogueService.fetchLevel(this.state.catalogue_data, this.state.current_node)
      for(var i = 0; i<children.length; i++){
        let child = children[i];
        list.push(
          <div key={child.id} className="list-view__cat_item list-view__cat_item--parent" onClick={this.listClickHandler} data-node={child.id}><b data-node={child.id}>{child.name}</b></div>
        );
      }
    }
    let crumbs = this.state.crumbs.map((crumb)=><span key={crumb.name} data-node={crumb.id} className={crumb.active?"crumbs__crumb crumbs__crumb--active":"crumbs__crumb"} onClick={this.listClickHandler}>{crumb.name}</span>);
    return (
      <div className={(this.state.loading?"loading ":"")+"catalogue-tree"}>
        <h2 className="catalogue-tree__component-title component-title">Каталог<span className="component-title__view-icons"><i className="fas fa-sitemap" data-view="2" onClick={this.handleViewChoice}></i><i className="fas fa-list" data-view="1" onClick={this.handleViewChoice}></i></span></h2>
        <div>
          <div className="catalogue-tree__crumbs crumbs">
            {this.state.view==1?crumbs:null}
          </div>
          <div className="catalogue-tree__view-inner view-inner">
            <div className="view-inner__list-view list-view">
              {this.state.view==1?<div onClick={this.traverseUp} className="list-view__cat_item list-view__cat_item--parent">../</div>:null}
              {this.state.view==1?list:""}
            </div>
            <div className="view-inner__tree-view">
              {this.state.view==2&&this.state.draw_tree?<TreeView treeData={tree} onChange={this.handleTreeClick} />:""}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
