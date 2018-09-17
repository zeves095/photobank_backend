import React from 'react';
// import $ from 'jquery';

import { CatalogueTree } from './CatalogueTree';
import { NodeViewer } from './NodeViewer';
import { UploadPool } from './UploadPool';


export class PhotoBank extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      "catalogue_data": {},
      "view_pool": false
    }
    this.fetchUnfinished();
    this.handleNodeChoice = this.handleNodeChoice.bind(this);
  }

  fetchUnfinished(){
    let unfinishedUploads = $("#unfinished_uploads").val().split("|");
    if (unfinishedUploads[0] !== "") {
      for (var i = 0; i < unfinishedUploads.length; i++) {
        let unfinishedParts = unfinishedUploads[i].split(',');
        if(typeof window.resumableContainer[unfinishedParts[0]] == 'undefined'){
          window.resumableContainer[unfinishedParts[0]]=new Resumable({target: '/api/upload/'});
        }
        if(unfinishedParts[0]==this.state.item_id){
          this.uploads.push({'filename': unfinishedParts[1], 'filehash': unfinishedParts[2], 'class': "unfinished", "ready": true});
        }
      }
    }
  }

  handleNodeChoice(id){
    this.setState({
      "selected_node": id
    });
  }

  componentWillMount(){
    //$.getJSON("/assets/js/components/photobank/dummy_data1.json", (data)=>{
    $.getJSON("/catalogue/nodes/", (data)=>{
      this.setState({
        "catalogue_data":data,
        "selected_node":1
      });
    });
  }

  render() {
    if(this.state.catalogue_data != {}){
    return (
      <div className="photobank_main">
      <div className="main_block">
        <CatalogueTree catalogue_data={this.state.catalogue_data} nodeChoiceHandler={this.handleNodeChoice} />
        <NodeViewer catalogue_data={this.state.catalogue_data} node={this.state.selected_node} />
        </div>
        {this.state.view_pool?<UploadPool />:""}
        <div className="butt-wrapper">
        <button type="button" className=" large_btn" onClick={()=>{this.setState({"view_pool":!this.state.view_pool})}}>{this.state.view_pool?"Скрыть":"Загрузки"}</button>
        </div>
      </div>
    );
  } else {return (<h1>ЗАГРУЗКА...</h1>)}
  }
}
