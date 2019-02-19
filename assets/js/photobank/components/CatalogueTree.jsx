import React from 'react';
// import $ from 'jquery';
import TreeView from 'react-simple-jstree';
import ItemSearch from './ItemSearch';
import NodeCrud from './NodeCrud';
import {ItemQueryObject} from '../services/ItemQueryObject';
import {CatalogueService} from '../services/CatalogueService';
import {LocalStorageService} from '../services/LocalStorageService';
import {NotificationService} from '../../services/NotificationService';

import {connect} from 'react-redux';
import selectors from '../selectors';
import {chooseNode, chooseCatalogueViewType, pushCrumbs, chooseCollectionType} from '../actionCreator';
/**
 * [state description]
 * @type {Object}
 */
export class CatalogueTree extends React.Component {

  /**
   * Конструктор компонета
   * crumbs - Массив объектов разделов каталога для хлебных крошек
   */
  constructor(props) {
    super(props);
    this.state ={
      "crumbs": [],
    }
  }

  /**
   * Обработчик выбора активного раздела каталога
   */
  handleNodeChoice = (id)=>{
    this.props.chooseNode(id, this.props.catalogue_data, this.props.collection_type);
  }

  /**
   * Выбирает созраненный раздел каталога как активный
   */
  componentWillMount(){
    this.handleCollectionChoice(this.props.collection_type);
    this.handleNodeChoice(this.props.current_node);
  }

  componentDidUpdate(prevProps){
    if((this.props.current_node !== prevProps.current_node || this.props.catalogue_data !== prevProps.catalogue_data)&&this.props.catalogue_data.length){
      this.props.pushCrumbs(this.props.catalogue_data, this.props.current_node);
    }
    if(this.props.collection_type !== prevProps.collection_type){
      this.handleNodeChoice(this.props.current_node);
    }
  }

  /**
   * Обработчик выбора типа предаставления
   * @param {Number} type Тип представления
   */
  handleViewChoice = (type)=>{
    if(type==3){
      this.props.chooseNode(null, this.props.catalogue_data, this.props.collection_type);
    }
    this.props.chooseCatalogueViewType(type);
  }

  /**
   * Обработчик выбора типа коллекции (каталог/свалка)
   * @param {Number} type Тип коллекции
   *
   */
  handleCollectionChoice(type){
    this.props.chooseCollectionType(type);
  }

  /**
   * Смещает выбор текущего уровня каталога на уровень выше (для кнопки "../" в представлении списка)
   */
  traverseUp = ()=>{
    let curNode = this.props.catalogue_data.filter((node)=>{return parseInt(node.id)==parseInt(this.props.current_node)})[0];
    if(typeof curNode!= "undefined"){
      this.props.chooseNode(curNode.parent, this.props.catalogue_data, this.props.collection_type);
    }
  }

  render() {
    let view = "";
    let viewClass = "";
    switch(this.props.view){
      case "1":
        let children = this.props.catalogue_data.filter(node=>node.parent===this.props.current_node);
        let list = [];
        if(this.props.current_node!==null){list.push(<div onClick={this.traverseUp} className="list-view__cat_item list-view__cat_item--parent">../</div>);}
        for(var i = 0; i< children.length; i++){
          let child = children[i];
          list.push(
            <div key={child.id} title={child.id} className="list-view__cat_item list-view__cat_item--parent" onClick={()=>{this.handleNodeChoice(child.id)}} data-node={child.id}><b data-node={child.id}>{child.name}</b></div>
          );
        }
        view = list;
        viewClass = "list-view";
        break;
      case "2":
        if(this.props.catalogue_data.length==0){view = "";break;}
        let tree=CatalogueService.makeTree(this.props.catalogue_data, this.props.current_node);
        view = <TreeView treeData={tree} onChange={(e,data)=>{if(data.action==='select_node' && data.selected[0] != this.props.current_node){this.handleNodeChoice(data.selected[0])}}} />;
        viewClass = "tree-view";
        break;
      case "3":
        view = <ItemSearch searchQueryHandler={this.handleQuery} filterid="srch" />;
        viewClass = "search-view";
        break;
    }

    let crumbs = this.props.crumbs&&this.props.crumbs.map((crumb)=><span key={crumb.name} data-node={crumb.id} className={crumb.active?"crumbs__crumb crumbs__crumb--active":"crumbs__crumb"} onClick={()=>{this.handleNodeChoice(crumb.id)}}>{crumb.name}</span>);

    return (
      <div className={"catalogue-tree"}>
        <span className="titlefix"><h2 className="catalogue-tree__component-title component-title">
          Каталог
          <span className="component-title__view-icons"><i className="fas fa-sitemap" title="Дерево" data-view="2" onClick={()=>{this.handleViewChoice("2")}}></i><i className="fas fa-list" title="Список" data-view="1" onClick={()=>{this.handleViewChoice("1")}}></i><i title="Поиск" data-view="3" onClick={()=>{this.handleViewChoice("3")}} className="fas fa-search"></i></span></h2>
        <div className="collection-tabs">
          <span className={"collection-tabs__tab" + (this.props.collection_type==0?" active":"")} onClick={()=>{this.handleCollectionChoice(0)}}>Товары</span>
        <span className={"collection-tabs__tab" + (this.props.collection_type==1?" active":"")} onClick={()=>{this.handleCollectionChoice(1)}}>Свалка</span>
        </div>
      </span>
      <div className="inner-bump">
          <div className="catalogue-tree__crumbs crumbs">
            {this.props.view==1?crumbs:null}
          </div>
          <div className={(this.props.loading?"loading ":"")+"catalogue-tree__view-inner view-inner"}>
            <div className={"view-inner__"+viewClass + " " + viewClass}>
              {view}
            </div>
          </div>
          {this.props.collection_type==1&&this.props.isAuthorized?<NodeCrud />:null}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state,props) =>{
  return {
    collection_type: selectors.catalogue.getCollectionType(state,props),
    catalogue_data: selectors.catalogue.getCatalogueData(state,props),
    current_node: selectors.catalogue.getCurrentNode(state,props),
    view: selectors.localstorage.getStoredCatalogueViewtype(state,props),
    loading: selectors.catalogue.getLoadingCatalogue(state,props),
    crumbs: selectors.catalogue.getCrumbs(state,props),
    isAuthorized: selectors.user.getAuthorized(state,props)
  }
}

const mapDispatchToProps = {
  chooseNode,
  chooseCatalogueViewType,
  pushCrumbs,
  chooseCollectionType
}

export default connect(mapStateToProps, mapDispatchToProps)(CatalogueTree);
