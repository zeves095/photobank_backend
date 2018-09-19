import React from 'react';
// import $ from 'jquery';

import { ItemSection } from './ItemSection';

export class NodeViewer extends React.Component{
  constructor(props) {
    super(props);
    this.state ={
      "node": this.props.node,
      "node_items": [],
      "opened_items": []
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
    $.getJSON("/catalogue/node/items/"+nodeId, (data)=>{
      console.log(this.state.opened_items);
      let node_items = data.map((item)=>
        <div key={item.id}>
          <h4 data-item={item.id} onClick={this.itemClickHandler}>{item.name}</h4>
        {this.state.opened_items.indexOf(item.id.toString())!=-1?<ItemSection item_code={item.itemCode} item_id={item.id} name={item.name} open_by_default={true}/>:""}
        </div>
      );
      this.setState({
        "node_items": node_items
      });
    });
  }

  itemClickHandler(e){
    let item = $(e.target).attr("data-item");
    console.log(this.state.opened_items.indexOf(item));
    if(this.state.opened_items.indexOf(item) == -1){
      this.state.opened_items.push(item);
      this.setState({
        'opened_items':this.state.opened_items
      });
      this.getItems();
    }
  }

  render() {
    return (
      <div className="node_viewer">
        <h2 className="component_title">Просмотр категории</h2>
        <div className="node_viewer_inner">
          {this.state.node_items}
        </div>
      </div>
    );
  }
}
