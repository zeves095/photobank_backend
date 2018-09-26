import React from 'react';
// import $ from 'jquery';

import { ItemSection } from './ItemSection';

export class NodeViewer extends React.Component{
  constructor(props) {
    super(props);
    this.state ={
      "node": this.props.node,
      "node_items": [],
      "current_item": null,
      "item_section": ""
    }
    this.getItems = this.getItems.bind(this);
    this.itemClickHandler = this.itemClickHandler.bind(this);
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
      let nodeItemList = data.map((item)=>
        <div key={item.id}>
          <h4 data-item={item.id} onClick={this.itemClickHandler}>{item.name}</h4>
        </div>
      );
      this.setState({
        "node_items" : data,
        "node_items_list": nodeItemList
      });
    });
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
    itemSection = <ItemSection render_existing={true} item_code={currItem.code} item_id={currItem.id} name={currItem.name} open_by_default={true}/>;
    return itemSection;
  }

  render() {
    return (
      <div className="node-viewer">
        <h2 className="node-viewer__component-title component-title">Просмотр категории</h2>
        <div className="node-viewer__view-inner view-inner">
          <div className="view-inner__item-list">
            {this.state.node_items_list}
          </div>
          <div className="view-inner_item-section" key={this.state.current_item!=null?this.state.current_item.id:""}>
            {this.state.item_section}
          </div>
        </div>
      </div>
    );
  }
}
