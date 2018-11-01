import React from 'react';
// import $ from 'jquery';

import { ItemSection } from './ItemSection';
import { ListFilter } from './ListFilter';
import {NotificationService} from './services/NotificationService';

export class UploadPool extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      "resumable_container": window.resumableContainer,
      "item_sections": [],
      "item_list": [],
      "item_list_filtered": [],
      "pool":[],
      "view_type":this.props.default_view,
      "filter_query": "",
      "collapse_all": false,
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleViewChoice = this.handleViewChoice.bind(this);
    this.filterQueryHandler = this.filterQueryHandler.bind(this);
    this.handleItemIdentity = this.handleItemIdentity.bind(this);
    this.getInitialList = this.getInitialList.bind(this);
    this.handleCollapseAll = this.handleCollapseAll.bind(this);
  };

  filterData(){
    let items = this.state.item_list;
    let filtered = [];
    if(this.state.filter_query == ""){
      filtered = items;
    } else {
      filtered = items.filter((item)=>{return item.id.toLowerCase().includes(this.state.filter_query) || item.name.toLowerCase().includes(this.state.filter_query)});
    }
    return filtered;
  }

  getInitialList(){
    let pool = [];
    for(var itemId in this.state.resumable_container){
      if(typeof this.state.resumable_container[itemId] != "undefined"){
        pool.push({
          id: itemId,
          name: ""
        });
      }
    }
    this.setState({
      "item_list":pool
    });
  }

  componentDidMount(){
    let container = window.resumableContainer;
    this.setState({
      "resumable_container" : container
    });
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
    this.state.view_type = view;
    this.props.viewChoiceHandler(view);
    this.getResumableList();
  }

  handleItemIdentity(id, name){
    let itlist = this.state.item_list;
    itlist[id] = {
      "id": id,
      "name": name
    };
    this.setState({
      "item_list":itlist
    });
  }

  filterQueryHandler(query){
    this.setState({
      "filter_query": query
    });
  }

  handleCollapseAll(){
    this.setState({
      "collapse_all": !this.state.collapse_all
    });
  }

  render(){
    let items = this.filterData();
    let pool = items.map(item=>{
      return(
      <div key={"pool-item" + item.id}>
        <ItemSection authorized={true} key={"pool" + item.id} item_id={item.id} default_view={this.state.view_type} render_existing={false} open_by_default={!this.state.collapse_all} identityHandler={this.handleItemIdentity} section_type="up" />
      </div>
    )}
    );
    return(
      <div className="upload-pool">
        <button type="button" className={"view-button"+(this.state.view_type==0?" view-button--active":"")} data-view="0" onClick={this.handleViewChoice}><i className="fas fa-th-large"></i></button>
      <button type="button" className={"view-button"+(this.state.view_type==1?" view-button--active":"")} data-view="1" onClick={this.handleViewChoice}><i className="fas fa-th"></i></button>
    <button type="button" className={"view-button"+(this.state.view_type==2?" view-button--active":"")} data-view="2" onClick={this.handleViewChoice}><i className="fas fa-list-ul"></i></button>
  <h2 className="upload-pool__component-title component-title">Загрузки<button type="button" onClick={this.handleCollapseAll} className="upload-pool__collapse-all">{this.state.collapse_all?"Развернуть все":"Свернуть все"}</button></h2>
    <ListFilter filterHandler={this.filterQueryHandler} filterid="poolsearch" placeholder="Фильтр по товару" /><button type="button" className="upload-pool__upload-all" onClick={this.handleSubmit}>Загрузить все</button>
        <div className="upload-pool__view-inner">
          {pool}
        </div>
      </div>
    );
  }
}
