import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import { chooseResource, addResourceToPool } from '../actionCreator'

export class ResourceSearchResults extends React.Component{

  constructor(props){
    super(props);
    this.state={};
  }

  handleResourceChoice = (e)=>{
    //this.props.chooseResource(parseInt(e.target.dataset['res'], 10));
  }

  handleAddResourceToPool = (e)=>{
    e.stopPropagation();
    this.props.addResourceToPool(parseInt(e.target.dataset['res'], 10));
  }

  render(){
    let tooManyResources = this.props.resources_found.length == 100;
    let resources = this.props.resources_found.map((resource)=>{
      return(
        <div data-res={resource.id} key={"resource"+resource.id} className="waves-effect waves-light resource card-panel blue-grey lighten-2 white-text col s12 m6" onClick={this.handleResourceChoice}>
          <span className={"resource-preview"+(typeof resource.thumbnail === 'undefined'?" resource-preview--loading":"")} style={{backgroundImage:"url(/catalogue/node/item/resource/"+resource.thumbnail+".jpg)"}}></span>
        <i className="fas fa-plus-circle add-res" data-res={resource.id} onClick={this.handleAddResourceToPool}></i>
        {resource.src_filename}
        </div>
      )
    });
    return (
      <div className="resource-seach-results">
        <div className="component-header component-header--subcomponent">
          <h2 className="component-title">
            Результаты поиска
          </h2>
        </div>
        <div className="component-body component-body--subcomponent">
          {tooManyResources?(<div className="resource card-panel red lighten-1 white-text"><i className="fas fa-times-circle left-icon"></i>Показаны не все результаты. Необходимо сузить критерии поиска.</div>):null}
          {this.props.resources_found.length==0?"Нет ресурсов":resources}
        </div>
      </div>
    );
  }

}
const mapStateToProps = (state) =>{
  return {
    resources_found: state.resource.resources_found
  }
}

const mapDispatchToProps = {
  chooseResource,
  addResourceToPool
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceSearchResults);
