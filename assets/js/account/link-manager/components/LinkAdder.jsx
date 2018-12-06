import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import LinkAddForm from './LinkAddForm';
import LinkResource from './LinkResource';
import ResourceExplorer from './ResourceExplorer';

import { doAction } from '../actionCreator'

export class LinkAdder extends React.Component{

  constructor(props){
    super(props);
    this.state={};
  }
  render(){
    let link_adder = (
      <div className={"link-adder__inner"+(this.props.link_editing?"open":"")}>
      <div className="component-body__top-section">
        <LinkAddForm />
        <LinkResource />
      </div>
      <div className="component-body__bottom-section">
        <ResourceExplorer />
      </div>
    </div>
    )
    return (
      <div className={"link-adder"+(this.props.link_editing?" open":"")}>
        <div className="component-header">
          <h2 className="component-title">
            Добавление ссылки
          </h2>
        </div>
        <div className="component-body">
          {this.props.link_editing?link_adder:null}
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

export default connect(mapStateToProps, mapDispatchToProps)(LinkAdder);
