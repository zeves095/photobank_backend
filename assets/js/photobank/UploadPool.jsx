import React from 'react';
// import $ from 'jquery';

import { ItemSection } from './ItemSection';
import { ListFilter } from './ListFilter';

export class UploadPool extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      "resumable_container": window.resumableContainer,
      "rendered_items": [],
      "pool":[],
      "view_type":1,
      "filter_query": ""
    }
    this.getResumableList = this.getResumableList.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleViewChoice = this.handleViewChoice.bind(this);
    this.filterQueryHandler = this.filterQueryHandler.bind(this);
  };

  getResumableList(){
    let resumables = [];
    let rendered = [];
    let res_container = this.state.resumable_container;
    for(var itemId in res_container){
      rendered.push(itemId);
    }
    this.state.rendered_items = rendered;
    this.filterData();
    this.buildPool();
  }

  buildPool(){
    let res_container = this.state.resumable_container;
    let pool = Object.keys(res_container).filter(key=>this.state.rendered_items.includes(key)).map(key=>
      <div>
        <h4>ITEM {key}</h4>
      <ItemSection key={"pool" + key} item_id={key} default_view={this.state.view_type} render_existing={false} open_by_default={true} section_type="up" />
      </div>
    );
    this.setState({
      "pool":pool
    });
  }

  filterData(){
    let items = this.state.rendered_items;
    let filtered = [];
    if(this.state.filter_query == ""){
      filtered = items;
    } else {
      filtered = items.filter((item)=>{return item == this.state.filter_query});
    }
    this.state.rendered_items = filtered;
  }

  componentDidMount(){
    let container = window.resumableContainer;
    this.state.resumable_container = container;
    this.getResumableList();
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
