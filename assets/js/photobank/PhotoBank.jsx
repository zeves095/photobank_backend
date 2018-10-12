import React from 'react';
// import $ from 'jquery';

import { CatalogueTree } from './CatalogueTree';
import { NodeViewer } from './NodeViewer';
import { Draggable } from './Draggable';
import {ItemQueryObject} from './services/ItemQueryObject';
import {ResourceService} from './services/ResourceService';
import {UploadService} from './services/UploadService';
import {CatalogueService} from './services/CatalogueService';

export class PhotoBank extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "crumb_string": "",
      "item_query_object": new ItemQueryObject(1)
    }
    this.fetchUnfinished();
    this.handleCatalogueQuery = this.handleCatalogueQuery.bind(this);
    this.handleCrumbUpdate = this.handleCrumbUpdate.bind(this);
  }

  fetchUnfinished(){
    UploadService.fetchUnfinishedItems().then((items)=>{
      for(var item in items){
        window.resumableContainer[items[item]]=new Resumable({target: window.config.upload_target_url});
      }
    });
  }

  handleCatalogueQuery(queryObject){
    this.setState({
      "selected_node": queryObject.getNodeId(),
      "item_query_object": queryObject
    });
  }

  handleCrumbUpdate(crumbs){
    let crumbsClone = crumbs.slice(0).reverse();
    let needElipsis = false;
    if(crumbsClone.length>3){crumbsClone = crumbsClone.slice(0,3); needElipsis = true;}
    let crumb_string = crumbsClone.reduce((accumulator,currentValue)=>accumulator+"/"+currentValue.name, "");
    this.setState({
      "crumb_string":(needElipsis?"...":"")+crumb_string
    })
  }

  render() {
    if(this.state.catalogue_data != {}){
    return (
      <div className="photobank-main">
      <div className="photobank-main__main-block">
        <CatalogueTree catalogue_data={this.state.catalogue_data} queryHandler={this.handleCatalogueQuery} default_view="2" crumb_handler={this.handleCrumbUpdate} />
      {$(".catalogue-tree").length>0?<Draggable box1=".catalogue-tree" box2=".node-viewer" id="1" />:null}
      <NodeViewer catalogue_data={this.state.catalogue_data_filtered} node={this.state.selected_node} query={this.state.item_query_object} crumb_string={this.state.crumb_string} />
        </div>
        <div className="photobank-main__butt-wrapper">
        </div>
      </div>
    );
  } else {return (<h1>ЗАГРУЗКА...</h1>)}
  }
}
