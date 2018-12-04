import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import { chooseResource } from '../actionCreator'

export class ResourceSearchResults extends React.Component{

  constructor(props){
    super(props);
    this.state={};
  }

  handleResourceChoice = (e)=>{
    this.props.chooseResource(parseInt(e.target.dataset['res'], 10));
  }

  render(){
    let resources = this.props.resources_found.map((resource)=>{
      return(
        <div data-res={resource.id} key={"resource"+resource.id} className="waves-effect waves-light resource card-panel blue-grey lighten-2 white-text col s12 m6" onClick={this.handleResourceChoice}>
          <span className={"resource-preview"+(typeof resource.thumbnail === 'undefined'?" resource-preview--loading":"")} style={{backgroundImage:"url(/catalogue/node/item/resource/"+resource.thumbnail+".jpg)"}}></span>
          {resource.id}
        </div>
      )
    });
    return (
      <div className="resource-seach-results">
        <div className="component-header component-header--subcomponent">
          <h2 className="component-title">
            Рузультаты поиска
          </h2>
        </div>
        <div className="component-body component-body--subcomponent">
          {this.props.resources_found.length==0?"Ничего не найдено":resources}
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
  chooseResource
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceSearchResults);
