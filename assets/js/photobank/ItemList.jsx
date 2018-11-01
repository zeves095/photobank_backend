import React, {PureComponent} from 'react';
import { ListFilter } from './ListFilter';
import {ItemService} from './services/ItemService';

import {LocalStorageService} from './services/LocalStorageService';
import {NotificationService} from './services/NotificationService';

export class ItemList extends React.Component{
  constructor(props) {
    super(props);
    this.state ={
      "node": this.props.node,
      "node_items": [],
      "node_items_filtered": [],
      "filter_query": "",
      "current_item": null,
      "previtem_id": this.props.item,
      "loading": false,
      "need_refresh": false
    }
    this.getItems = this.getItems.bind(this);
    this.itemClickHandler = this.itemClickHandler.bind(this);
    this.filterQueryHandler = this.filterQueryHandler.bind(this);
  }

  getItems(){
    this.setState({"loading":true});
    ItemService.fetchItems(this.props.query, this.state.filter_query, this.state.node_items, this.state.need_refresh).then((data)=>{
      this.setState({
        "node_items": data[0],
        "node_items_filtered" : data[1],
        "loading": false
      });
    }).catch((error)=>{
      if(error == "none-found"){
        //NotificationService.toast(error);
        this.setState({
          "node_items": [],
          "node_items_filtered" : [],
          "loading": false
        });
      }else{
        NotificationService.throw(error);
      }
    });
  }

  filterQueryHandler(query){
    this.setState({
      "filter_query" : query
    });
  }

  itemClickHandler(e){
    let itemId = "";
    if(e.target){
      itemId = $(e.target).attr("data-item");
    }else{
      itemId = e;
    }
    LocalStorageService.set("current_item", itemId);
    let currItem = this.state.node_items_filtered.filter((item)=>{return item.id == itemId})[0];
    this.setState({
      'current_item': currItem,
    });
    this.props.itemChoiceHandler(currItem);
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.node !== prevProps.node || this.props.query !== prevProps.query){
      console.log("reset");
      this.setState({
        "node": this.props.node,
        "node_items":[],
        "need_refresh":true
      });
    }
    if(this.state.filter_query != prevState.filter_query || this.state.need_refresh){
      this.setState({
        "need_refresh":false
      });
      this.getItems();
    }
    if(this.props.node == prevProps.node && prevState.node_items_filtered.length == 0 && this.state.node_items_filtered.length>0){
      this.itemClickHandler(this.props.item);
    }
  }

  componentWillMount(){
    this.getItems();
  }

  componentDidMount(){
    this.itemClickHandler(this.props.item);
  }

  render() {

    let nodeItemList = this.state.node_items_filtered.map((item)=>
      <div className={"list-item"+((this.state.current_item!=null&&item.id==this.state.current_item.id)?" list-item--active":"")} key={item.id} data-item={item.id} onClick={this.itemClickHandler}>
        <h4 data-item={item.id} onClick={this.itemClickHandler} title={item.node}><i className="fas fa-circle" style={{"fontSize":"7pt", "margin": "3px"}}></i>Товар №{item.itemCode} "{item.name}"</h4>
      </div>
    );
    let tooBroadMsg = this.state.node_items_filtered.length == 100?"Показаны не все результаты. Необходимо сузить критерии поиска.":"";
    return (

      <div className={"view-inner__item-list"}>
        <h2 className="node-viewer__component-title component-title">Товары</h2>
      <div className={(this.state.loading?"loading ":"")+"view-inner__container"}>
        <ListFilter filterHandler={this.filterQueryHandler} filterid="nodesearch" placeholder="Фильтр по выбранному" />
      {this.state.node_items_filtered.length>0?null:"Нет товаров в выбранной категории"}
        {tooBroadMsg}
        {nodeItemList}
        {tooBroadMsg}
      </div>
      </div>
    );
  }
}
