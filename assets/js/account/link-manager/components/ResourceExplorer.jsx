import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import ResourceSearchForm from './ResourceSearchForm';
import ResourceSearchResults from './ResourceSearchResults';

import { doAction } from '../actionCreator'

export class ResourceExplorer extends React.Component{

  constructor(props){
    super(props);
    this.state={};
  }
  render(){
    return (
      <div className="resource-explorer">
        <div className="component-header component-header--subcomponent">
          <h2 className="component-title">
            Поиск ресурса
          </h2>
        </div>
        <div className="component-body component-body--subcomponent">
            <ResourceSearchForm />
            <ResourceSearchResults />
        </div>
      </div>
    );
  }

}

const mapStateToProps = (state) =>{
  return {
    link_editing: state.link.link_editing
  }
}

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceExplorer);
