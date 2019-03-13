import React from 'react';
import {connect} from 'react-redux';

import selectors from '../selectors';
import {NotificationService,ResourceService} from '../services';
import {addGarbageNode,removeGarbageNode,updateGarbageNode} from '../actionCreator';
import {startNodeRebase,stopNodeRebase} from '../actionCreator';
import utility from '../services/UtilityService';

export class NodeCrud extends React.Component {

  constructor(props) {
    super(props);
    this.state={
      operation:0,
      id:null,
      name:null,
      parent:null,
    }
  }

  handleChooseOperation=(operation)=>{
    this.setState({operation});
  }

  handleAddNode=()=>{
    this.props.onCreate(this.props.node,this.state.name);
  }

  handleRenameNode=()=>{
    this.props.onRename(this.props.node,this.state.name,this.props.node_parent);
  }

  handleStartParentChoice=()=>{
    this.props.startNodeRebase();
    document.body.addEventListener("click",this.bodyListener,false);
  }

  handleRemoveNode=()=>{
    this.props.onDelete(this.props.node,this.props.node_parent);
  }

  handleRestoreNode=()=>{
    this.props.onRestore(this.props.node,this.props.node_parent);
  }

  bodyListener = (e)=>{
    e.stopPropagation();
    e.preventDefault();
    let node_id = this.props.node;
    let parent_id = e.target.id.substring(0, e.target.id.length-7);
    this.props.onMove(node_id,parent_id);
    // this.props.stopNodeRebase(
    //   node_id,
    //   parent_id,
    //   this.props.catalogue_data,
    //   this.props.collection_type
    // );
    document.body.removeEventListener("click",this.bodyListener,false);
  }


  render() {
    const addElement = (
      <div className="crud-controls crud-controls--add">
        <p>Добавить подпапку</p>
      <label htmlFor="node-name">Название</label>
        <input type="text" name="name" id="node-name" onChange={(e)=>this.setState({name:e.target.value})} />
        <span className="button-block"><button onClick={this.handleAddNode}><i className="fas fa-folder-plus"></i>Добавить</button></span>
      </div>
    );
    const renameElement = (
      <div className="crud-controls crud-controls--add">
        <p>Переименовать папку</p>
      <label htmlFor="node-name">Название</label>
        <input type="text" name="name" id="node-name" onChange={(e)=>this.setState({name:e.target.value})} />
        <span className="button-block"><button onClick={this.handleRenameNode}><i className="fas fa-sync-alt"></i>Сохранить</button></span>
      </div>
    );
    const removeElement = (
      <div className="crud-controls crud-controls--add">
        <p>{this.props.node_deleted?"Восстановить":"Удалить"} папку</p>
        <span className="button-block"><button onClick={this.props.node_deleted?this.handleRestoreNode:this.handleRemoveNode}><i className="fas fa-folder-minus"></i>{this.props.node_deleted?"Восстановить":"Удалить"}</button></span>
      </div>
    );
    let elems = [addElement, renameElement, removeElement];
    return (
      <div className="catalogue-tree__node-crud node-crud">
        <div className="node-crud__operations button-block">
          <button className="btn" onClick={()=>this.handleChooseOperation(0)} title="Добавить подпапку"><i className="fas fa-folder-plus"></i></button>
        <button className="btn" onClick={()=>this.handleChooseOperation(1)} title="Переименовать папку"><i className="fas fa-sync-alt"></i></button>
    <button className="btn" onClick={()=>this.handleChooseOperation(2)} title={(this.props.node_deleted?"Восстановить":"Удалить")+" папку"}><i className="fas fa-folder-minus"></i></button>
        </div>
        {elems[this.state.operation]}
      </div>
    );
  }

}

const mapStateToProps = (state,props)=>{
  return {
    node: selectors.catalogue.getCurrentNode(state,props),
    node_parent: selectors.catalogue.getCurrentNodeParent(state,props),
    node_deleted: selectors.catalogue.getCurrentNodeIsDeleted(state,props),
    collection_type: selectors.catalogue.getCollectionType(state,props),
    catalogue_data: selectors.catalogue.getCatalogueData(state,props),
  }
}

const mapDispatchToProps = {
  addGarbageNode,
  updateGarbageNode,
  removeGarbageNode,
  startNodeRebase,
  stopNodeRebase,
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeCrud)
