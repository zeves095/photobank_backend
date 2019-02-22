import React from 'react';
import {connect} from 'react-redux';
import selectors from '../selectors';
import {ResourceService,NotificationService} from '../services';
import {addGarbageNode,updateGarbageNode,removeGarbageNode} from '../actionCreator';
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
    this.props.addGarbageNode(this.state.name, this.props.node, this.props.catalogue_data, this.props.collection_type);
  }

  handleUpdateNode=()=>{
    this.props.updateGarbageNode(this.props.node, this.state.name, this.props.node_parent, this.props.catalogue_data, this.props.collection_type);
  }

  bodyListener = (e)=>{
    e.stopPropagation();
    e.preventDefault();
    console.log("CLOKK",e.target);
    let node_id = this.props.node;
    let parent_id = e.target.id.substring(0, e.target.id.length-7);
    this.props.stopNodeRebase(node_id, parent_id, this.props.catalogue_data, this.props.collection_type);
    document.body.removeEventListener("click",this.bodyListener,false);
  }

  handleStartParentChoice=()=>{
    this.props.startNodeRebase();
    document.body.addEventListener("click",this.bodyListener,false);
  }

  handleRemoveNode=()=>{
    this.props.removeGarbageNode(this.props.node, this.props.node_parent, this.props.catalogue_data, this.props.collection_type);
  }

  render() {
    const addElement = (
      <div className="crud-controls crud-controls--add">
        <p>Добавить папку</p>
      <label htmlFor="node-name">Название</label>
        <input type="text" name="name" id="node-name" onChange={(e)=>this.setState({name:e.target.value})} />
        <span className="button-block"><button onClick={()=>{this.handleAddNode()}}><i className="fas fa-folder-plus"></i>Добавить</button></span>
      </div>
    );
    const renameElement = (
      <div className="crud-controls crud-controls--add">
        <p>Переименовать папку</p>
      <label htmlFor="node-name">Название</label>
        <input type="text" name="name" id="node-name" onChange={(e)=>this.setState({name:e.target.value})} />
        <span className="button-block"><button onClick={()=>{this.handleUpdateNode()}}><i className="fas fa-sync-alt"></i>Сохранить</button></span>
      </div>
    );
    const moveElement = (
      <div className="crud-controls crud-controls--add">
        <p>Переместить папку</p>
        <span className="button-block"><button onClick={()=>{this.handleStartParentChoice()}}><i className="fas fa-hand-pointer"></i>Выбрать нового родителя</button></span>
      </div>
    );
    const removeElement = (
      <div className="crud-controls crud-controls--add">
        <p>Удалить папку</p>
        <span className="button-block"><button onClick={()=>{this.handleRemoveNode()}}><i className="fas fa-folder-minus"></i>Удалить</button></span>
      </div>
    );
    let elems = [addElement, renameElement, moveElement, removeElement];
    return (
      <div className="catalogue-tree__node-crud node-crud">
        <div className="node-crud__operations button-block">
          <button className="btn" onClick={()=>this.handleChooseOperation(0)}><i className="fas fa-folder-plus"></i></button>
        <button className="btn" onClick={()=>this.handleChooseOperation(1)}><i className="fas fa-sync-alt"></i></button>
      <button className="btn" onClick={()=>this.handleChooseOperation(2)}><i className="fas fa-hand-pointer"></i></button>
    <button className="btn" onClick={()=>this.handleChooseOperation(3)}><i className="fas fa-folder-minus"></i></button>
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
