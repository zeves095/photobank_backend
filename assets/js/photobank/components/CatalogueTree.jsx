import React from 'react';
// import $ from 'jquery';
import TreeView from 'react-simple-jstree';
import {ItemSearch} from './ItemSearch';
import {ItemQueryObject} from '../services/ItemQueryObject';
import {CatalogueService} from '../services/CatalogueService';
import {LocalStorageService} from '../services/LocalStorageService';
import {NotificationService} from '../../services/NotificationService';

import {connect} from 'react-redux';
import {fetchRootNodes, fetchNodes, chooseNode} from '../actionCreator';
/**
 * [state description]
 * @type {Object}
 */
export class CatalogueTree extends React.Component {

  /**
   * Конструктор компонета
   * catalogue_data - Полные данные структуры каталога
   * tracked_nodes - Массив идентификаторов разделов каталога, которые уже отслеживаются в состоянии компонента
   * current_node - Текущий выбранный раздел каталога
   * crumbs - Массив объектов разделов каталога для хлебных крошек
   * view - Текущий выбранный тип отображения структуры каталога
   * loading - Находится ли компонент в состоянии загрузки
   */
  constructor(props) {
    super(props);
    this.state ={
      "crumbs": [],
      "view": this.props.default_view,
    }
  }

  /**
   * Запрашивает массив объектов разделов каталога для отображения хлебных крошек
   */
  getCrumbs =()=>{
    let crumbs = CatalogueService.getCrumbs(this.props.catalogue_data, this.props.current_node);
    this.setState({
      "crumbs" : crumbs
    });
    this.props.crumb_handler(crumbs);
  }

  /**
   * Обработчик выбора активного раздела каталога
   */
  handleNodeChoice = (id)=>{
    this.props.chooseNode(id);
    if(!this.props.catalogue_data.find((node)=>node.parent===id)){
      this.props.fetchNodes(id);
    }
  }

  /**
   * Запрашивает структуру каталога от созраненного выбранного раздела до верхнего уровня каталога
   */
  componentWillMount(){
    this.props.fetchRootNodes(this.props.current_node);
  }

  /**
   * Обработчик выбора типа предаставления
   * @param  {Event} e Событие клика
   */
  handleViewChoice = (e)=>{
    let view = e.target.dataset["view"];
    LocalStorageService.set("catalogue_view", view);
    this.setState({'view':view});
  }

  /**
   * Смещает выбор текущего уровня каталога на уровень выше (для кнопки "../" в представлении списка)
   */
  traverseUp = ()=>{
    let curNode = this.props.catalogue_data.filter((node)=>{return parseInt(node.id)==parseInt(this.props.current_node)})[0];
    if(typeof curNode!= "undefined"){
      this.props.chooseNode(curNode.parent);
    }
  }

  render() {
    // if(this.props.current_node==0){return null}
    let view = "";
    let viewClass = "";
    switch(this.state.view){
      case "1":
        let children = CatalogueService.fetchLevel(this.props.catalogue_data, this.props.current_node)
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

    let crumbs = this.state.crumbs.map((crumb)=><span key={crumb.name} data-node={crumb.id} className={crumb.active?"crumbs__crumb crumbs__crumb--active":"crumbs__crumb"} onClick={this.listClickHandler}>{crumb.name}</span>);

    return (
      <div className={"catalogue-tree"}>
        <span className="titlefix"><h2 className="catalogue-tree__component-title component-title">Каталог<span className="component-title__view-icons"><i className="fas fa-sitemap" title="Дерево" data-view="2" onClick={this.handleViewChoice}></i><i className="fas fa-list" title="Список" data-view="1" onClick={this.handleViewChoice}></i><i title="Поиск" data-view="3" onClick={this.handleViewChoice} className="fas fa-search"></i></span></h2></span>
      <div className="inner-bump">
          <div className="catalogue-tree__crumbs crumbs">
            {this.state.view==1?crumbs:null}
          </div>
          <div className={(this.state.loading?"loading ":"")+"catalogue-tree__view-inner view-inner"}>
            <div className={"view-inner__"+viewClass + " " + viewClass}>
              {view}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) =>{
  return {
    catalogue_data: state.catalogue.catalogue_data,
    current_node: state.catalogue.current_node
  }
}

const mapDispatchToProps = {
  fetchRootNodes,
  fetchNodes,
  chooseNode
}

export default connect(mapStateToProps, mapDispatchToProps)(CatalogueTree);
