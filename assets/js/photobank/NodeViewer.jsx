import React from 'react';
import { ItemSection } from './ItemSection';
import { ListFilter } from './ListFilter';

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
      "item_section": ""
    }
    this.getItems = this.getItems.bind(this);
    this.itemClickHandler = this.itemClickHandler.bind(this);
    this.filterData = this.filterData.bind(this);
    this.buildList = this.buildList.bind(this);
    this.filterQueryHandler = this.filterQueryHandler.bind(this);
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
      <div key={item.id}>
        <h4 data-item={item.id} onClick={this.itemClickHandler}>{item.name}</h4>
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
      filtered = items.filter((item)=>{return item.itemCode == this.state.filter_query || item.name == this.state.filter_query});
      console.warn(filtered);
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
      'item_section': this.makeItemSection(currItem)
    });
  }

  makeItemSection(currItem){
    let itemSection = null;
    itemSection = <ItemSection render_existing={true} item_id={currItem.id} name={currItem.name} open_by_default={true} section_type="nv" />;
    return itemSection;
  }

  render() {
    return (
      <div className="node-viewer">
        <div className="node-viewer__view-inner view-inner">
          <div className="view-inner__item-list">
            <h2 className="node-viewer__component-title component-title">Товары</h2>
          <div className="view-inner__container">
            <ListFilter filterHandler={this.filterQueryHandler} />
            {this.state.node_items_list}
          </div>
          </div>
          <div className="view-inner__item-section" key={this.state.current_item!=null?this.state.current_item.id:""}>
            <h2 className="node-viewer__component-title component-title">Файлы</h2>
          <div className="view-inner__container">
            {this.state.item_section}
          </div>
          </div>
        </div>
      </div>
    );
  }
}
