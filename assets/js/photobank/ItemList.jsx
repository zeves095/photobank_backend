import React from 'react';
import { ListFilter } from './ListFilter';

export class ItemList extends React.Component{
  constructor(props) {
    super(props);
    this.state ={
      "node": this.props.node,
      "node_items": [],
      "node_items_filtered": [],
      "filter_query": "",
      "current_item": null,
      "loading": false
    }
    this.getItems = this.getItems.bind(this);
    this.itemClickHandler = this.itemClickHandler.bind(this);
    this.filterData = this.filterData.bind(this);
    this.filterQueryHandler = this.filterQueryHandler.bind(this);
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
      'current_item': currItem,
    });
    this.props.itemChoiceHandler(currItem);
  }

  render() {

    let nodeItemList = this.state.node_items_filtered.map((item)=>
      <div className={"list-item"+((this.state.current_item!=null&&item.id==this.state.current_item.id)?" list-item--active":"")} key={item.id} data-item={item.id} onClick={this.itemClickHandler}>
        <h4 data-item={item.id} onClick={this.itemClickHandler}><i className="fas fa-circle" style={{"fontSize":"7pt", "margin": "3px"}}></i>Товар №{item.itemCode} "{item.name}"</h4>
      </div>
    );

    return (

      <div className={(this.state.loading?"loading ":"")+"view-inner__item-list"}>
        <h2 className="node-viewer__component-title component-title">Товары</h2>
      <div className="view-inner__container">
        <ListFilter filterHandler={this.filterQueryHandler} filterid="nodesearch" placeholder="Фильтр по выбранному" />
      {this.state.node_items_filtered.length>0?null:"Нет товаров в выбранной категории"}
        {nodeItemList}
      </div>
      </div>
    );
  }
}
