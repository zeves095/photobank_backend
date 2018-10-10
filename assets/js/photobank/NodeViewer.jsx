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
      "item_section": "Не выбран товар",
      "view_pool": false,
      "view_type": 1,
      "product_crumbs": this.props.crumb_string,
      "loading": false
    }
    this.getItems = this.getItems.bind(this);
    this.itemClickHandler = this.itemClickHandler.bind(this);
    this.filterData = this.filterData.bind(this);
    this.filterQueryHandler = this.filterQueryHandler.bind(this);
    this.handlePoolClick = this.handlePoolClick.bind(this);
    this.handleViewChoice = this.handleViewChoice.bind(this);
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.node !== prevProps.node){
      this.setState({
        "node": this.props.node
      });
      this.getItems();
    }
    if(this.state.current_item != prevState.current_item){
      this.getItems();
    }
    if(this.state.filter_query != prevState.filter_query){
      this.getItems();
    }
  }

  componentDidMount(){
    this.getItems();
  }

  getItems(nodeId = this.props.node){
    this.setState({"loading":true});
    $.getJSON(window.config.get_items_url+nodeId, (data)=>{
      let nodeItems = data;
      this.filterData(data);
      // this.setState({
      //   "node_items" : nodeItems
      // });
    });
  }

  filterData(items){
    //let items = this.state.node_items;
    let filtered = [];
    if(this.state.filter_query == ""){
      filtered = items;
    } else {
      filtered = items.filter((item)=>{return item.itemCode.toLowerCase().includes(this.state.filter_query.toLowerCase()) || item.name.toLowerCase().includes(this.state.filter_query.toLowerCase())});
    }
    this.setState({
      "node_items_filtered" : filtered,
      "loading": false
    });
  }

  filterQueryHandler(query){
    this.setState({
      "filter_query" : query
    });
  }

  itemClickHandler(e){
    let itemId = $(e.target).attr("data-item");
    let currItem = this.state.node_items_filtered.filter((item)=>{return item.id == itemId})[0];
    this.setState({
      'view_pool':false,
      'current_item': currItem,
      'product_crumbs': this.props.crumb_string
    });
  }

  handlePoolClick(){
    this.setState({
      "view_pool" : !this.state.view_pool
    })
  }

  handleViewChoice(view){
    this.setState({
      "view_type":view
    });
  }

  render() {

    let nodeItemList = this.state.node_items_filtered.map((item)=>
      <div className={"list-item"+((this.state.current_item!=null&&item.id==this.state.current_item.id)?" list-item--active":"")} key={item.id} data-item={item.id} onClick={this.itemClickHandler}>
        <h4 data-item={item.id} onClick={this.itemClickHandler}><i className="fas fa-circle" style={{"fontSize":"7pt", "margin": "3px"}}></i>Товар №{item.itemCode} "{item.name}"</h4>
      </div>
    );

    let itemSection = this.state.current_item!=null?(<ItemSection viewChoiceHandler={this.handleViewChoice} render_existing={true} item_id={this.state.current_item.id} open_by_default={true} section_type="nv" crumb_string={this.props.crumb_string} default_view={this.state.view_type} />):null;

    return (

      <div className="node-viewer">
        <div className="node-viewer__view-inner view-inner">
          <div className={(this.state.loading?"loading ":"")+"view-inner__item-list"}>
            <h2 className="node-viewer__component-title component-title">Товары</h2>
          <div className="view-inner__container">
            <ListFilter filterHandler={this.filterQueryHandler} filterid="nodesearch" placeholder="Фильтр по выбранному" />
          {this.state.node_items_filtered.length>0?null:"Нет товаров в выбранной категории"}
            {nodeItemList}
          </div>
          </div>
          {$(".view-inner__item-section").length>0?<Draggable box1=".view-inner__item-list" box2=".view-inner__item-section" id="2" />:null}
          <div className="view-inner__item-section" key={this.state.current_item!=null?this.state.current_item.id:""}>
            <h2 className="node-viewer__component-title component-title">Файлы <i className="crumb-string">{this.state.product_crumbs}</i></h2>
          <button type="button" className="item-section-switcher" onClick={this.handlePoolClick}>{this.state.view_pool?"К последнему товару":"Корзина товаров"}</button>
          <div className="view-inner__container">
            {this.state.view_pool?
            <UploadPool viewChoiceHandler={this.handleViewChoice} default_view={this.state.view_type} />
            :itemSection}
          </div>
          </div>
        </div>
      </div>
    );
  }
}
