import React from 'react';
// import $ from 'jquery';

import { ItemSection } from './ItemSection';

export class UploadPool extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      "resumable_container": window.resumableContainer,
      "pool":[]
    }
    this.getResumableList = this.getResumableList.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  getResumableList(){
    let resumables = [];
    let res_container = this.state.resumable_container;
    for(var itemId in res_container){
      resumables.push(<ItemSection key={"pool" + itemId} item_id={itemId} render_existing={false} open_by_default={true} />);
    }
    this.setState({
      "pool":resumables
    });
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

  render(){
    return(
      <div className="upload-pool">
        <h2 className="upload-pool__component-title component-title">Загрузки</h2>
        <div className="upload-pool__view-inner view-inner">
          {this.state.pool}
          <button type="button" onClick={this.handleSubmit}>Загрузить</button>
        </div>
      </div>
    );
  }
}
