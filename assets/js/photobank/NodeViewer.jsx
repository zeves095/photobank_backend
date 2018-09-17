import React from 'react';
// import $ from 'jquery';

import { ItemSection } from './ItemSection';

export class NodeViewer extends React.Component{
  constructor(props) {
    super(props);
    this.state ={
      "node": this.props.node,
      "node_items": []
    }
    this.getItems = this.getItems.bind(this);
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
      this.setState({
        "node_items": data
      });
    });
  }

  render() {
    return (
      <div className="node_viewer">
        <h2 className="component_title">Просмотр категории</h2>
        <div className="node_viewer_inner">
        {this.state.node_items.map((item)=><div key={item.id}><ItemSection item_code={item.itemCode} item_id={item.id} name={item.name} open_by_default={false}/></div>)}
        </div>
      </div>
    );
  }
}
