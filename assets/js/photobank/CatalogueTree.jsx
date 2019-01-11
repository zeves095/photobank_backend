import React from 'react';
// import $ from 'jquery';
import TreeView from 'react-simple-jstree';
import {ItemSearch} from './ItemSearch';
import {ItemQueryObject} from './services/ItemQueryObject';
import {CatalogueService} from './services/CatalogueService';
import {LocalStorageService} from './services/LocalStorageService';
import {NotificationService} from '../services/NotificationService';
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
      "catalogue_data": [],
      "tracked_nodes": [],
      "current_node": null,
      "crumbs": [],
      "view": this.props.default_view,
      "loading": false,
    }
    this.getCatalogueNodes = this.getCatalogueNodes.bind(this);
    this.getCrumbs = this.getCrumbs.bind(this);
    this.listClickHandler = this.listClickHandler.bind(this);
    this.handleTreeClick = this.handleTreeClick.bind(this);
    this.handleViewChoice = this.handleViewChoice.bind(this);
    this.traverseUp = this.traverseUp.bind(this);
    this.handleNodeChoice = this.handleNodeChoice.bind(this);
    this.handleQuery = this.handleQuery.bind(this);
  }

  /**
   * Запрашивает структуру каталога с сервера
   */
  getCatalogueNodes(){
    this.setState({"loading":true});
    let nodesResponse = CatalogueService.fetchNodes(this.state.catalogue_data, this.state.tracked_nodes, this.state.current_node);
    nodesResponse.then((cat_data)=>{
      this.setState({
        "catalogue_data": cat_data,
        "loading":false
      });
    }).catch((error)=>{
      NotificationService.throw(error);
    });
  }

  /**
   * Запрашивает массив объектов разделов каталога для отображения хлебных крошек
   */
  getCrumbs(){
    let crumbs = CatalogueService.getCrumbs(this.state.catalogue_data, this.state.current_node);
    this.setState({
      "crumbs" : crumbs
    });
    //crumbs.reverse();
    this.props.crumb_handler(crumbs);
  }

  /**
   * Обработчик события выбора раздела каталога
   * @param  {Event} e Событие клика
   */
  listClickHandler(e){
    e.stopPropagation();
    let curr_id = e.target.getAttribute('data-node');
    this.setState({
      "current_node": curr_id,
    });
  }

  /**
   * Обработчик события выбора раздела каталога из древовидного представления
   * @param  {Event} e Событие клика
   * @param  {Object} data Данные, полученные из jstree
   */
  handleTreeClick(e,data){
    if(data.selected[0] != this.state.current_node && data.action == "select_node"){
      this.setState({
        "current_node": data.selected[0],
      });
    }
  }

  /**
   * Обработчик выбора активного раздела каталога
   */
  handleNodeChoice(){
    if(this.state.current_node == null){LocalStorageService.unset("current_node");}else{
      LocalStorageService.set("current_node", this.state.current_node);
    }
    let queryObject = new ItemQueryObject();
    queryObject.nodeId = this.state.current_node;
    this.props.queryHandler(queryObject);
  }

  /**
   * Запрашивает структуру каталога от созраненного выбранного раздела до верхнего уровня каталога
   */
  componentWillMount(){
    //let currentNode = LocalStorageService.get("current_node");
    CatalogueService.fetchRootNodes(this.props.node).then((data)=>{
      let tracked = data.slice(0).map((result)=>{return result.id});
      this.setState({
        "tracked_nodes": tracked,
        "current_node": this.props.node,
        "catalogue_data": data,
      });
    }).catch((error)=>{
      NotificationService.throw(error);
    });
  }

  /**
   * Обрабатывает выбор раздела каталога
   */
  componentDidUpdate(prevProps,prevState){
    if(this.state.current_node != prevState.current_node){
      this.handleNodeChoice();
      this.getCatalogueNodes();
      this.getCrumbs();
    }
  }

  /**
   * Обработчик выбора типа предаставления
   * @param  {Event} e Событие клика
   */
  handleViewChoice(e){
    let view = $(e.target).attr("data-view");
    LocalStorageService.set("catalogue_view", view);
    this.setState({'view':view});
  }

  /**
   * Смещает выбор текущего уровня каталога на уровень выше (для кнопки "../" в представлении списка)
   */
  traverseUp(){
    let curNode = this.state.catalogue_data.filter((node)=>{return parseInt(node.id)==parseInt(this.state.current_node)})[0];
    if(typeof curNode!= "undefined"){
      this.setState({
        "current_node" : curNode.parent
      });
      // this.props.nodeChoiceHandler(curNode.parent);
    }
  }

  /**
   * Обработчик отправки объекта поиска на сервер
   * @param  {ItemQueryObject} queryObject Объект поиска
   */
  handleQuery(queryObject){
    this.props.queryHandler(queryObject);
  }

  render() {
    // if(this.state.current_node==0){return null}
    let view = "";
    let viewClass = "";
    switch(this.state.view){
      case "1":
        let children = CatalogueService.fetchLevel(this.state.catalogue_data, this.state.current_node)
        let list = [];
        list.push(<div onClick={this.traverseUp} className="list-view__cat_item list-view__cat_item--parent">../</div>);
        for(var i = 0; i< children.length; i++){
          let child = children[i];
          list.push(
            <div key={child.id} title={child.id} className="list-view__cat_item list-view__cat_item--parent" onClick={this.listClickHandler} data-node={child.id}><b data-node={child.id}>{child.name}</b></div>
          );
        }
        view = list;
        viewClass = "list-view";
        break;
      case "2":
        if(this.state.catalogue_data.length==0){view = "";break;}
        let tree=CatalogueService.makeTree(this.state.catalogue_data, this.state.current_node);
        view = <TreeView treeData={tree} onChange={this.handleTreeClick} />;
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
