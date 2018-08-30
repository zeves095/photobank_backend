import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import ResourceSearchForm from './ResourceSearchForm';
import ResourceSearchResults from './ResourceSearchResults';

import { doAction } from '../actionCreator'

/**
 * Браузер ресурсов с поиском
 */
export class ResourceExplorer extends React.Component{
  /**
   * Конструктор компонента
   * @param {Object} props Входные данные из коннекта Redux
   */
  constructor(props){
    super(props);
    this.state={};
  }
  render(){
    return (
        <div className="component-body component-body--subcomponent resource-explorer">
          <div className="component-header component-header--subcomponent">
            <h2 className="component-title">
              Поиск ресурса
            </h2>
          </div>
            <ResourceSearchForm />
            <ResourceSearchResults />
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
