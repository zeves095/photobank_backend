import React from 'react';
import {connect} from 'react-redux';
import selectors from '../selectors';
import {ResourceService,NotificationService} from '../services';
import {addResourceToDownloads, updateResourceField} from '../actionCreator';
import utility from '../services/UtilityService';

export class NodeCrud extends React.Component {

  constructor(props) {
    super(props);
    this.state={
      priority_active:false
    }
    this.fileViewClasses = ['file--icons-lg ','file--icons-sm ','file--detailed '];
  }

  render() {
    let addElement = (
      <div className="crud-controls crud-controls--add">
        <p><i className="fas fa-folder-plus"></i>Добавить папку</p>
        <label for="node-name">Название</label>
        <input type="text" name="name" id="node-name" onChange={(e)=>this.setState({name:e.target.value})} />
        <span className="button-block"><button></button></span>
      </div>
    );
    return (
      <div className="catalogue-tree__node-crud node-crud">

      </div>
    );
  }

}

const mapStateToProps = (state,props)=>{
  return {
    finished_presets: selectors.resource.getFinishedPresets(state,props),
    max_main: selectors.resource.getMaxMainResources(state,props),
    max_add: selectors.resource.getMaxAddResources(state,props),
    current_main: selectors.resource.getCurrentMainResources(state,props),
    current_add: selectors.resource.getCurrentAddResources(state,props),
    authorized: selectors.user.getAuthorized(state,props),
  }
}

const mapDispatchToProps = {
  addResourceToDownloads,
  updateResourceField,

}

export default connect(mapStateToProps, mapDispatchToProps)(NodeCrud)
