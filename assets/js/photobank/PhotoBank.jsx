import React from 'react';
// import $ from 'jquery';

import { CatalogueTree } from './CatalogueTree';
import { NodeViewer } from './NodeViewer';
import { Draggable } from './Draggable';
import {ItemQueryObject} from './services/ItemQueryObject';
import {ResourceService} from './services/ResourceService';
import {UploadService} from './services/UploadService';
import {CatalogueService} from './services/CatalogueService';
import {LocalStorageService} from './services/LocalStorageService';
import {NotificationService} from './services/NotificationService';

export class PhotoBank extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "crumb_string": "",
      "item_query_object": null,
      "ls_node": null
    }
    this.fetchUnfinished();
    this.handleCatalogueQuery = this.handleCatalogueQuery.bind(this);
    this.handleCrumbUpdate = this.handleCrumbUpdate.bind(this);

    LocalStorageService.init();
  }

  fetchUnfinished(){
    UploadService.fetchUnfinishedItems().then((items)=>{
      for(var item in items){
        window.resumableContainer[items[item]]=new Resumable({target: window.config.upload_target_url});
      }
    }).catch((error)=>{
      NotificationService.throw(error);
    });
  }

  handleCatalogueQuery(queryObject){
    this.setState({
      "selected_node": queryObject.nodeId,
      "item_query_object": queryObject
    });
  }

  handleCrumbUpdate(crumbs){
    let crumbsClone = crumbs.slice(0).reverse();
    let needElipsis = false;
    if(crumbsClone.length>3){crumbsClone = crumbsClone.slice(-3); needElipsis = true;}
    let crumb_string = crumbsClone.reduce((accumulator,currentValue)=>accumulator+"/"+currentValue.name, "");
    this.setState({
      "crumb_string":(needElipsis?"...":"")+crumb_string
    })
  }

  componentWillMount(){
    let prevnode = LocalStorageService.get("current_node");
    let previtem = LocalStorageService.get("current_item");
    let prevview = LocalStorageService.get("list_view_type");
    this.setState({
      "ls_node": prevnode,
      "ls_item": previtem,
      "ls_view": prevview,
    });
  }

  render() {
    if(this.state.catalogue_data == {}){return (<h1>ЗАГРУЗКА...</h1>)}
    let cat_view = LocalStorageService.get("catalogue_view");
    return (
      <div className="photobank-main">
        <div id="notification-overlay">

        </div>
      <div className="photobank-main__main-block">
        <CatalogueTree catalogue_data={this.state.catalogue_data} queryHandler={this.handleCatalogueQuery} default_view={cat_view} crumb_handler={this.handleCrumbUpdate} node={this.state.ls_node} />
      {$(".catalogue-tree").length>0?<Draggable box1=".catalogue-tree" box2=".node-viewer" id="1" />:null}
      {this.state.item_query_object == null?null:<NodeViewer catalogue_data={this.state.catalogue_data_filtered} node={this.state.selected_node} query={this.state.item_query_object} crumb_string={this.state.crumb_string} item={this.state.ls_item} default_view={this.state.ls_view} />}
        </div>
        <div className="photobank-main__butt-wrapper">
        </div>
      </div>
    );
}
}
