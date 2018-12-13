import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import LinkAddForm from './LinkAddForm';
import LinkResource from './LinkResource';
import ResourceExplorer from './ResourceExplorer';

import { stopEditing } from '../actionCreator'

export class LinkAdder extends React.Component{

  constructor(props){
    super(props);
    this.state={};
  }

  handleCloseAdder = ()=>{
    this.props.stopEditing();
  }

  render(){
    let link_adder = (
      <div className={"link-adder__inner "+(this.props.link_adding?"open":"")}>
        <div className="component-header component-header--subcomponent adder-controls">
          <div className="button-block"><button type="button" name="button" onClick={this.handleCloseAdder}><i className="fas fa-times-circle"></i></button></div>
        </div>
      <div className="component-body__bottom-section resource-section">
        <ResourceExplorer />
      </div>
      <div className="component-body__top-section link-section">
        <h2 className="component-title">
          Добавление ссылки
        </h2>
        <LinkAddForm />
        <LinkResource />
      </div>
    </div>
    )
    return (
      <div className={"link-adder"+(this.props.link_adding?" open":"")}>
        <div className="component-body">
          {this.props.link_adding?link_adder:null}
        </div>
      </div>
    );
  }

}

const mapStateToProps = (state) =>{
  return {
    link_adding: state.link.link_adding,
  }
}

const mapDispatchToProps = {
  stopEditing
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkAdder);
