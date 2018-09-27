import React from 'react';
// import $ from 'jquery';

import { ItemSection } from './ItemSection';
import { ListFilter } from './ListFilter';

export class UploadPool extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      "resumable_container": window.resumableContainer,
      "item_sections": [],
      "item_list": [],
      "item_list_filtered": [],
      "pool":[],
      "view_type":1,
      "filter_query": ""
    }
    this.getResumableList = this.getResumableList.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleViewChoice = this.handleViewChoice.bind(this);
    this.filterQueryHandler = this.filterQueryHandler.bind(this);
    this.handleItemIdentity = this.handleItemIdentity.bind(this);
    this.getInitialList = this.getInitialList.bind(this);
  };

  getResumableList(){
    if (typeof this.updateListTimer != 'undefined') {
      clearTimeout(this.updateListTimer);
    }
    this.updateListTimer = setTimeout(()=> {
      let resumables = [];
      let rendered = [];
      let res_container = this.state.resumable_container;
      this.state.item_sections = [];
      for(var itemId in res_container){
        this.state.item_sections[itemId] = <ItemSection key={"pool" + itemId} item_id={itemId} default_view={this.state.view_type} render_existing={false} open_by_default={true} identityHandler={this.handleItemIdentity} section_type="up" />;
      }
      this.filterData();
      this.buildPool();
    }, 30);
  }

  buildPool(){
    let items = this.state.item_list_filtered;
    let pool = items.map(item=>{
      return(
      <div key={"pool-item" + item.id}>
        <h4 key={"pool-item-header" + item.id}>{item.name}</h4>
        {this.state.item_sections[item.id]}
      </div>
    )}
    );
    this.setState({
      "pool":pool
    });
  }

  filterData(){
    let items = this.state.item_list;
    let filtered = [];
    if(this.state.filter_query == ""){
      filtered = items;
    } else {
      filtered = items.filter((item)=>{return item.id == this.state.filter_query || item.code == this.state.filter_query || item.name == this.state.filter_query});
    }
    this.state.item_list_filtered = filtered;
    console.warn(filtered);
  }

  getInitialList(){
    let pool = [];
    for(var itemId in this.state.resumable_container){
      if(typeof this.state.resumable_container[itemId] != "undefined"){
        console.log(this.state.resumable_container[itemId]);
        pool.push(<ItemSection key={"query" + itemId} item_id={itemId} default_view={this.state.view_type} render_existing={false} open_by_default={true} identityHandler={this.handleItemIdentity} section_type="up" />);
      }
    }
    this.setState({
      "pool":pool
    });
  }

  componentDidMount(){
    let container = window.resumableContainer;
    this.state.resumable_container = container;
    this.getInitialList();
  }

  handleSubmit(){
    for(var res in this.state.resumable_container){
      this.state.resumable_container[res].upload();
    }
  }

  handleViewChoice(e){
    let viewBtn = $(e.target).is("button")?$(e.target):$(e.target).parent();
    let view = viewBtn.data("view");
    this.setState({"view_type":view});
  }

  handleItemIdentity(id, name, code){
    this.state.item_list[id] = {
      "id": id,
      "name": name,
      "code": code
    };
    this.getResumableList();
  }

  filterQueryHandler(query){
    this.state.filter_query = query;
    this.getResumableList();
  }

  render(){
    return(
      <div className="upload-pool">
        <button type="button" data-view="0" onClick={this.handleViewChoice}><i className="fas fa-th-large"></i></button>
        <button type="button" data-view="1" onClick={this.handleViewChoice}><i className="fas fa-th"></i></button>
        <button type="button" data-view="2" onClick={this.handleViewChoice}><i className="fas fa-list-ul"></i></button>
        <h2 className="upload-pool__component-title component-title">Загрузки</h2>
      <ListFilter filterHandler={this.filterQueryHandler} />
        <div className="upload-pool__view-inner view-inner">
          {this.state.pool}
          <button type="button" onClick={this.handleSubmit}>Загрузить</button>
        </div>
      </div>
    );
  }
}
