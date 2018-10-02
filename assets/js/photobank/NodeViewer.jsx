import React from 'react';
import { ItemSection } from './ItemSection';
import { ListFilter } from './ListFilter';
import { UploadPool } from './UploadPool';
import { Draggable } from './Draggable';

export class NodeViewer extends React.Component{
  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": this.props.catalogue_data,
      "node": this.props.node,
      "node_items": [],
      "node_items_filtered": [],
      "filter_query": "",
      "current_item": null,
      "item_section": "",
      "view_pool": false,
      "view_type": 1,
      "product_crumbs": this.props.crumb_string
    }
    this.getItems = this.getItems.bind(this);
    this.itemClickHandler = this.itemClickHandler.bind(this);
    this.filterData = this.filterData.bind(this);
    this.buildList = this.buildList.bind(this);
    this.filterQueryHandler = this.filterQueryHandler.bind(this);
    this.handlePoolClick = this.handlePoolClick.bind(this);
    this.handleViewChoice = this.handleViewChoice.bind(this);
  }

  componentDidUpdate(prevProps){
    if(this.props.node !== prevProps.node){
      this.setState({
        "node": this.props.node
      });
      this.getItems();
    }
  }

  componentDidMount(){
    this.getItems();
  }

  getItems(nodeId = this.props.node){
    $.getJSON(window.config.get_items_url+nodeId, (data)=>{
      let nodeItems = data;
      this.setState({
        "node_items" : nodeItems
      });
      this.buildList();
    });
  }

  buildList(){
    this.filterData();
    let nodeItemList = this.state.node_items_filtered.map((item)=>
      <div className="list-item" key={item.id}>
        <h4 data-item={item.id} onClick={this.itemClickHandler}><i className="fas fa-circle" style={{"fontSize":"7pt", "margin": "3px"}}></i>Товар №{item.itemCode} "{item.name}"</h4>
      </div>
    );
    this.setState({
      "node_items_list": nodeItemList
    });
  }

  filterData(){
    let items = this.state.node_items;
    let filtered = [];
    if(this.state.filter_query == ""){
      filtered = items;
    } else {
      filtered = items.filter((item)=>{return item.itemCode.toLowerCase().includes(this.state.filter_query.toLowerCase()) || item.name.toLowerCase().includes(this.state.filter_query.toLowerCase())});
    }
    this.state.node_items_filtered = filtered;
  }

  filterQueryHandler(query){
    this.state.filter_query = query;
    this.buildList();
  }

  itemClickHandler(e){
    let itemId = $(e.target).attr("data-item");
    let currItem = this.state.node_items.filter((item)=>{return item.id == itemId})[0];
    this.setState({
      'current_item': currItem,
      'item_section': this.makeItemSection(currItem),
      'product_crumbs': this.props.crumb_string
    });
  }

  handlePoolClick(){
    this.setState({
      "view_pool" : !this.state.view_pool
    })
  }

  makeItemSection(currItem){
    let itemSection = null;
    itemSection = <ItemSection viewChoiceHandler={this.handleViewChoice} render_existing={true} item_id={currItem.id} name={currItem.name} open_by_default={true} section_type="nv" crumb_string={this.props.crumb_string} default_view={this.state.view_type} />;
    return itemSection;
  }

  handleViewChoice(view){
    this.setState({
      "view_type":view
    });
  }

  render() {
    return (
      <div className="node-viewer">
        <button type="button" className="item-section-switcher" onClick={this.handlePoolClick}>{this.state.view_pool?"К последнему товару":"Корзина товаров"}</button>
        <div className="node-viewer__view-inner view-inner">
          <div className="view-inner__item-list">
            <h2 className="node-viewer__component-title component-title">Товары</h2>
          <div className="view-inner__container">
            <ListFilter filterHandler={this.filterQueryHandler} filterid="nodesearch" placeholder="Фильтр по выбранному" />
          {this.state.node_items.length>0?null:"Нет товаров в выбранной категории"}
            {this.state.node_items_list}
          </div>
          </div>
          {$(".view-inner__item-section").length>0?<Draggable box1={$(".view-inner__item-list")} box2={$(".view-inner__item-section")} id="2" />:null}
          <div className="view-inner__item-section" key={this.state.current_item!=null?this.state.current_item.id:""}>
            <h2 className="node-viewer__component-title component-title">Файлы <i className="crumb-string">{this.state.product_crumbs}</i></h2>
          <div className="view-inner__container">
            {this.state.view_pool?
            <UploadPool viewChoiceHandler={this.handleViewChoice} default_view={this.state.view_type} />
            :this.state.item_section}
          </div>
          </div>
        </div>
      </div>
    );
  }
}
